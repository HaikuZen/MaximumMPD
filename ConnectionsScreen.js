/*
* The MIT License (MIT)
*
* Copyright (c) 2018 Richard Backhouse
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    Appearance
} from 'react-native';
import MPDConnection from './MPDConnection';
import UPnPManager from './UPnPManager';
import IonIcon  from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
//import { Input, Button } from 'react-native-elements'
import { TextInput, Button  } from 'react-native-paper'
//import ActionButton from 'react-native-action-button';
import { FloatingAction } from "react-native-floating-action";

import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import Config from './Config';
import { StyleManager } from './Styles';

class AddConnectionModal extends React.Component {
    state = {
        name: "",
        host: "",
        port: 6600,
        password: ""
    };

    onCancel(visible) {
        this.setState({
            name: "",
            host: "",
            port: 6600,
            password: ""
        });
        this.props.onCancel();
    }

    addConnection() {
        if (this.state.name === "") {
            Alert.alert(
                "Create Connection Error",
                "Name must not be blank"
            );
            return;
        }
        if (this.state.host === "") {
            Alert.alert(
                "Create Connection Error",
                "Host must not be blank"
            );
            return;
        }
        if (this.state.port === "") {
            Alert.alert(
                "Create Connection Error",
                "Port must not be blank"
            );
            return;
        }
        let parsedPort = parseInt(this.state.port);
        if (isNaN(parsedPort)) {
            Alert.alert(
                "Create Connection Error",
                "Port value must be a number"
            );
            return;
        }

        this.props.addConnection(this.state.name, this.state.host, this.state.port, this.state.password);
        this.setState({
            name: "",
            host: "",
            port: 6600,
            password: ""
        });
    }

    render() {
        const styles = StyleManager.getStyles("connectionsStyles");
        const common = StyleManager.getStyles("styles");

        const visible = this.props.visible;
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={() => {
            }}>
                <View style={styles.dialog1}>
                    <View style={styles.dialog2}>
                        <Text style={styles.dialogtext}>Add MPD Connection</Text>
                    </View>
                    <TextInput label="Name" 
                            autoCapitalize="none" 
                            onChangeText={(name) => this.setState({name})} 
                            //style={styles.entryField}
                            inputStyle={styles.label}
                            labelStyle={styles.label}
                            >
                    </TextInput>
                    <TextInput label="Host" 
                            autoCapitalize="none" 
                            onChangeText={(host) => this.setState({host})} 
                            //style={styles.entryField}
                            inputStyle={styles.label}
                            labelStyle={styles.label}>
                    </TextInput>
                    <TextInput keyboardType='numeric' 
                            label="Port" 
                            onChangeText={(port) => this.setState({port})} 
                            //style={styles.entryField} 
                            inputStyle={styles.label}
                            labelStyle={styles.label}>
                    </TextInput>
                    <TextInput secureTextEntry={true} 
                            label="Password (if required by MPD server)" 
                            onChangeText={(password) => this.setState({password})} 
                            //style={styles.entryField} 
                            inputStyle={styles.label}
                            labelStyle={styles.label}>
                    </TextInput>
                    <View style={styles.dialog3}>
                        <Button
                            onPress={() => {this.addConnection();}}
                            title="Add"
                            //icon={{name: 'plus', size: 15, type: 'font-awesome'}}
                            icon="check"
                            raised={true}
                            type="outline"
                        >Add</Button>
                        <Button
                            onPress={() => {this.onCancel();}}
                            title="Cancel"
                            //icon={{name: 'times-circle', size: 15, type: 'font-awesome'}}
                            icon="cancel"
                            raised={true}
                            type="outline"
                        >Cancel</Button>
                    </View>
                </View>
            </Modal>
        );
    }
}

export default class ConnectionsScreen extends React.Component {

    static navigationOptions = {
        title: 'Connections'
    };

    state = {
        discovered: [],
        configured: [],
        upnpServers: [],
        selected: (new Map()),
        modalVisible: false,
        loading: false
    }

    componentDidMount() {
        console.log('ConnectionsScreen>>>', this.props)
        const { navigation } = this.props !==undefined ? this.props.navigation : undefined;
       
        this.navigateOnConnect = navigation!==undefined ? navigation.navigateOnConnect || true : true;
        console.log('navigateOnConnect: ',this.navigateOnConnect)
        this.onDiscover = MPDConnection.getEventEmitter().addListener(
            "OnDiscover",
            (discovered) => {
                this.state.discovered = this.state.discovered.filter((d) => {
                        return !(d.name === discovered.name);
                });
                if (discovered.type === "add") {
                    discovered.key = discovered.name+discovered.ipAddress+discovered.port;
                    this.state.discovered.push(discovered);
                }
                this.setState({discovered: this.state.discovered});
            }
        );

        this.onDisconnect = MPDConnection.getEventEmitter().addListener(
            "OnDisconnect",
            () => {
            }
        );

        this.onUPnPServerDiscover = UPnPManager.addListener(
            "OnServerDiscover",
            (server) => {
                this.state.upnpServers = this.state.upnpServers.filter((s) => {
                    return !(s.udn === server.udn);
                });
                if (server.action === "find") {
                    server.key = server.udn;
                    this.state.upnpServers.push(server);
                }
                this.setState({upnpServers: this.state.upnpServers});
            }
        );

        const currentConnection = MPDConnection.current();
        if (currentConnection !== undefined && currentConnection.isConnected) {
            this.state.selected.set(currentConnection.name+currentConnection.host+currentConnection.port, true);
        }
        this.load();
        if (this.navigateOnConnect) {
            Config.isAutoConnect()
            .then((autoConnect) => {
                if (autoConnect.autoConnect && autoConnect.server) {
                    this.connect(autoConnect.server.name, autoConnect.server.host, autoConnect.server.port, autoConnect.server.pwd);
                }
            });
        }        
        this.onApperance = Appearance.addChangeListener(({ colorScheme }) => {
            this.setState({loading: this.state.loading});
        });
    }

    componentWillUnmount() {
        this.onDisconnect?.remove();
        this.onDiscover?.remove();
        this.onUPnPServerDiscover?.remove();
        if (this.onApperance) {
            this.onApperance.remove();
        }
    }

    load() {
        let discovered = MPDConnection.getDiscoveredList();
        discovered.forEach((d) => {
            d.key = d.name+d.ipAddress+d.port;
        });
        let upnpServers = UPnPManager.getServers();
        upnpServers.forEach((u) => {
            u.key = u.udn;
        });
        
        this.setState({discovered: discovered,upnpServers: upnpServers});        
        MPDConnection.getConnectionList()
        .then((connections) => {
            connections.forEach((c) => {
                c.key = c.name+c.ipAddress+c.port;
            })
            this.setState({configured: connections});
        });
    }

    onPress(item) {
        this.setState((state) => {
            const selected = new Map(state.selected);
            for (let key of selected.keys()) {
                selected.set(key, false);
            }
            return {selected};
        });
        let port = item.port;
        if (!Number.isInteger(port)) {
            port = Number.parseInt(port);
        }
        this.connect(item.name, item.ipAddress, port, item.pwd);
    }

    connect(name, ipAddress, port, pwd) {
        if (this.navigateOnConnect) {
            this.setState({loading: true});
        }
        MPDConnection.connect(name, ipAddress, port, pwd).then(
            () => {
                this.load();
                this.setState((state) => {
                    const selected = new Map(state.selected);
                    selected.set(name+ipAddress+port, true);
                    return {selected};
                });
                Config.isAutoConnect()
                .then((autoConnect) => {
                    if (autoConnect.autoConnect) {
                        const server = {
                            name: name,
                            host: ipAddress,
                            port: port,
                            pwd: pwd
                        };
                        Config.setAutoConnect(true, server);
                    }
                });

                if (this.navigateOnConnect) {
                    this.setState({loading: false});
                    this.props.navigation.navigate('Play', {urlcommand:''});
                }
            },
            (err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            }
        );

    }

    onCancel() {
        this.setState({modalVisible: false});
    }

    onAdd() {
        this.setState({modalVisible: true});
    }

    onRescan() {
        this.setState({discovered: [], upnpServers: []});
        MPDConnection.rescan();
        UPnPManager.rescan();
    }

    addConnection = (name, host, port, password) => {
        MPDConnection.addConnection(name, host, parsedPort, password, false, 0)
            .then(() => {
                MPDConnection.getConnectionList()
                    .then((connections) => {
                        connections.forEach((c) => {
                            c.key = c.name+c.ipAddress+c.port;
                        })
                        this.setState({configured: connections});
                        this.onCancel();
                    });
            });
    };

    onRowDidOpen() {

    }

    connectRow(rowMap, item) {
        if (rowMap[item.name+item.ipAddress+item.port]) {
			rowMap[item.name+item.ipAddress+item.port].closeRow();
        }
        if (rowMap[item.udn]) {
			rowMap[item.udn].closeRow();
        }
        if (item.udn) {
            MPDConnection.disconnect();
            this.setState((state) => {
                const selected = new Map(state.selected);
                for (let key of selected.keys()) {
                    selected.set(key, false);
                }
                return {selected};
            });
            UPnPManager.connectServer(item.udn);
            this.setState((state) => {
                const selected = new Map(state.selected);
                selected.set(item.udn, true);
                return {selected};
            });

            this.props.navigation.navigate('UPnPPage');
        } else {
            this.onPress(item);
        }
    }

    deleteRow(rowMap, item) {
        if (rowMap[item.name+item.ipAddress+item.port]) {
			rowMap[item.name+item.ipAddress+item.port].closeRow();
		}
        Alert.alert(
            "Delete Connection",
            "Are you sure you want to delete "+item.name+" ?",
            [
                {text: 'OK', onPress: () => {
                    if (MPDConnection.isConnected() && item.ipAddress === MPDConnection.current().host && item.port === MPDConnection.current().port) {
                        MPDConnection.disconnect();
                    }
                    MPDConnection.removeConnection(item)
                    .then(() => {
                        MPDConnection.getConnectionList()
                            .then((connections) => {
                                connections.forEach((c) => {
                                    c.key = c.name+c.ipAddress+c.port;
                                })
                                this.setState({configured: connections});
                            });
                    });
                }},
                {text: 'Cancel'}
            ]
        );
    }

    renderSeparator = () => {
        const common = StyleManager.getStyles("styles");
        return (
            <View
                style={common.separator}
            />
        );
    };

    render() {
        const styles = StyleManager.getStyles("connectionsStyles");
        const common = StyleManager.getStyles("styles");

        const navigation = this.props.navigation;

        const actions = [
            {
              text: "Rescan",
              icon: <IonIcon name="ios-refresh" size={20} color="white"/>,
              color: '#1abc9c',
              name: "bt_rescan",
              position: 1
            },
            {
              text: "Add Connection",
              icon: <Icon name="plus-square" size={15} color="#e6e6e6" />,
              color: '#3498db',
              name: "bt_add_connection",
              position: 2
            }
          ];        
        return (
            <View style={common.container1}>
                <AddConnectionModal visible={this.state.modalVisible} onCancel={() => {this.onCancel();}} addConnection={this.addConnection}></AddConnectionModal>
                <SwipeListView
					useSectionList
					sections={[
                        {title: 'Discovered', data: this.state.discovered},
                        {title: 'Configured', data: this.state.configured},
                        //{title: 'UPnP Servers', data: this.state.upnpServers}
                    ]}
                    renderItem={(data, map) => {
                        const openVal = data.section.title === "Configured" ? -150 : -75;
                        const item = data.item;

                        let selected;
                        if (item.udn) {
                            selected = this.state.selected.get(item.udn) === true ? "flex" : "none";
                        } else {
                            selected = this.state.selected.get(item.name+item.ipAddress+item.port) === true ? "flex" : "none";
                        }
                        let stats;
                        if (item.stats) {
                            stats = "Artists: "+item.stats.numberOfArtists+" Albums: "+item.stats.numberOfAlbums+" Songs: "+item.stats.numberOfSongs;
                        }
                        return (
                        <SwipeRow rightOpenValue={openVal}>
                            <View style={common.rowBack}>
                                {data.section.title === "Configured" &&
                                    <TouchableOpacity style={[common.backRightBtn, common.backRightBtnLeft]} onPress={ _ => this.deleteRow(map, item) }>
                                        <Text style={common.backTextWhite}>Delete</Text>
                                    </TouchableOpacity>
                                }
                                <TouchableOpacity style={[common.backRightBtn, common.backRightBtnRight]} onPress={ _ => this.connectRow(map, item) }>
                                    <Text style={common.backTextWhite}>Connect</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[common.container3, common.rowFront]}>
                                <View style={common.container4}>
                                    <Text style={styles.item}>{item.name}</Text>
                                    {item.ipAddress &&
                                        <Text style={styles.item}>{item.ipAddress}</Text>
                                    }
                                    {item.port &&
                                        <Text style={styles.item}>{item.port}</Text>
                                    }
                                    {stats &&
                                        <Text style={styles.item}>{stats}</Text>
                                    }
                                </View>
                                <Icon name="check" size={15} style={[{ display: selected }, common.icon]}/>
                            </View>
                        </SwipeRow>
                    );}}
                    renderSectionHeader={({section}) => <Text style={common.sectionHeaderAlt}>{section.title}</Text>}
                    ItemSeparatorComponent={this.renderSeparator}
				/>
                {this.state.loading &&
                    <View style={common.loading}>
                        <ActivityIndicator size="large" color="#0000ff"/>
                    </View>
                }
                <FloatingAction
                    actions={actions}
                    color="rgba(231,76,60,1)" hideShadow={true}
                    
                    onPressItem={name => {
                        if(name==="bt_rescan")
                            this.onRescan()
                        if(name==="bt_add_connection")
                            this.onAdd()
                    }}
                />
                {/* 
                <ActionButton buttonColor="rgba(231,76,60,1)" hideShadow={true}>
                    <ActionButton.Item buttonColor='#1abc9c' title="Rescan" size={40} textStyle={common.actionButtonText} onPress={() => {this.onRescan();}}>
                        <IonIcon name="ios-refresh" size={20} color="white"/>
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#3498db' title="Add Connection" size={40} textStyle={common.actionButtonText} onPress={() => {this.onAdd();}}>
                        <Icon name="plus-square" size={15} color="#e6e6e6" />
                    </ActionButton.Item>
                </ActionButton>
                */}
            </View>
        );
    }
}
