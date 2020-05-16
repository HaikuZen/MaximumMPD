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
import { Text, View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SearchBar } from "react-native-elements";

import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import ActionButton from 'react-native-action-button';

import { Button } from 'react-native-elements'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

import MPDConnection from './MPDConnection';
import Base64 from './Base64';
import AlbumArt from './AlbumArt';
import NewPlaylistModal from './NewPlaylistModal';

export default class SongsScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        let type = navigation.getParam('album');
        if (!type) {
            type = navigation.getParam('genre');
        }
        return {
            title: "Songs ("+type+")"
        };
    };

    constructor(props) {
        super(props);
        this.state = {
          songs: [],
          fullset: [],
          loading: false,
          modalVisible: false,
          selectedItem: "",
          imagePath: "",
          searchValue: ""
        };
    }

    componentDidMount() {
        const { navigation } = this.props;
        const artist = navigation.getParam('artist');
        const album = navigation.getParam('album');
        const genre = navigation.getParam('genre');

        this.setState({loading: true});

        if (album) {
            MPDConnection.current().getSongsForAlbum(album, artist)
            .then((songs) => {
                this.setState({loading: false});
                this.setState({songs: songs, fullset: songs});
                AlbumArt.getAlbumArt(songs[0].artist, album)
                .then((path) => {
                    if (path) {
                        this.setState({imagePath: "file://"+path});
                    }
                });
            })
            .catch((err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            });
        } else if (genre) {
            MPDConnection.current().getSongsForGenre(genre)
            .then((songs) => {
                this.setState({loading: false});
                this.setState({songs: songs, fullset: songs});
            })
            .catch((err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            });
        }
        this.onDisconnect = MPDConnection.getEventEmitter().addListener(
            "OnDisconnect",
            () => {
                this.setState({songs: [], fullset: []});
                this.props.navigation.popToTop();
            }
        );
    }

    componentWillUnmount() {
        this.onDisconnect.remove();
    }

    search = (text) => {
        if (text.length > 0) {
            let filtered = this.state.fullset.filter((song) => {
                return song.title.toLowerCase().indexOf(text.toLowerCase()) > -1;
            });
            this.setState({songs: filtered, searchValue: text});
        } else {
            this.setState({songs: this.state.fullset, searchValue: text});
        }
    }

    addAll(toPlaylist) {
        const { navigation } = this.props;
        const artist = navigation.getParam('artist');
        const album = navigation.getParam('album');
        const genre = navigation.getParam('genre');

        if (toPlaylist === true) {
            this.setState({modalVisible: true, selectedItem: "all"});
        } else {
            if (album) {
                this.setState({loading: true});
                MPDConnection.current().addAlbumToPlayList(album, artist)
                .then(() => {
                    this.setState({loading: false});
                })
                .catch((err) => {
                    this.setState({loading: false});
                    Alert.alert(
                        "MPD Error",
                        "Error : "+err
                    );
                });
            } else if (genre) {
                this.setState({loading: true});
                MPDConnection.current().addGenreSongsToPlayList(genre)
                .then(() => {
                    this.setState({loading: false});
                })
                .catch((err) => {
                    this.setState({loading: false});
                    Alert.alert(
                        "MPD Error",
                        "Error : "+err
                    );
                });
            }
        }
    }

    onPress(item, toPlaylist) {
        if (toPlaylist === true) {
            this.setState({modalVisible: true, selectedItem: item.b64file});
        } else {
            this.setState({loading: true});
            MPDConnection.current().addSongToPlayList(decodeURIComponent(Base64.atob(item.b64file)))
            .then(() => {
                this.setState({loading: false});
            })
            .catch((err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            });
        }
    }

    queue(rowMap, item) {
        if (rowMap[item.b64file]) {
			rowMap[item.b64file].closeRow();
		}
        this.onPress(item, false);
    }

    playlist(rowMap, item) {
        if (rowMap[item.b64file]) {
			rowMap[item.b64file].closeRow();
		}
        this.onPress(item, true);
    }

    finishAdd(name, selectedItem) {
        this.setState({modalVisible: false});
        MPDConnection.current().setCurrentPlaylistName(name);

        this.setState({loading: true});

        if (selectedItem === "all") {
            const { navigation } = this.props;
            const artist = navigation.getParam('artist');
            const album = navigation.getParam('album');
            const genre = navigation.getParam('genre');
            if (album) {
                MPDConnection.current().addAlbumToNamedPlayList(album, artist, MPDConnection.current().getCurrentPlaylistName())
                .then(() => {
                    this.setState({loading: false});
                })
                .catch((err) => {
                    this.setState({loading: false});
                    Alert.alert(
                        "MPD Error",
                        "Error : "+err
                    );
                });
            } else if (genre) {
                MPDConnection.current().addGenreSongsToNamedPlayList(genre, MPDConnection.current().getCurrentPlaylistName())
                .then(() => {
                    this.setState({loading: false});
                })
                .catch((err) => {
                    this.setState({loading: false});
                    Alert.alert(
                        "MPD Error",
                        "Error : "+err
                    );
                });
            }    
        } else {
            MPDConnection.current().addSongToNamedPlayList(decodeURIComponent(Base64.atob(selectedItem)), MPDConnection.current().getCurrentPlaylistName())
            .then(() => {
                this.setState({loading: false});
            })
            .catch((err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            });
        }
    }

    autoPlay() {
        const { navigation } = this.props;
        const artist = navigation.getParam('artist');
        const album = navigation.getParam('album');
        const genre = navigation.getParam('genre');

        if (album) {
            this.setState({loading: true});
            MPDConnection.current().addAlbumToPlayList(album, artist, true)
            .then(() => {
                this.setState({loading: false});
            })
            .catch((err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            });
        } else if (genre) {
            MPDConnection.current().addGenreSongsToPlayList(genre, true)
            .then(() => {
                this.setState({loading: false});
            })
            .catch((err) => {
                this.setState({loading: false});
                Alert.alert(
                    "MPD Error",
                    "Error : "+err
                );
            });
        }
    }

    renderSeparator = () => {
        return (
            <View
                style={styles.separator}
            />
        );
    };

    render() {
        return (
            <View style={styles.container1}>
                <View style={styles.container2}>
                    <View style={styles.container3}>
                        <SearchBar
                            clearIcon
                            lightTheme
                            round
                            cancelButtonTitle="Cancel"
                            placeholder='Search'
                            onChangeText={this.search}
                            value={this.state.searchValue}
                            containerStyle={styles.searchbarContainer}
                            inputContainerStyle={styles.searchbarInputContainer}
                            inputStyle={styles.searchbarInput}
                    />
                    </View>
                    <View style={styles.container4}>
                        <Text style={styles.text}>
                            Total : {this.state.songs.length}
                        </Text>
                    </View>
                </View>
                <View style={styles.container5}>
                <SwipeListView
					useFlatList
                    data={this.state.songs}
                    keyExtractor={item => item.b64file}
                    renderItem={(data, map) => {
                        const item = data.item;
                        return (
                        <SwipeRow rightOpenValue={-150}>
                            <View style={styles.rowBack}>
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ _ => this.queue(map, item) }>
                                    <Text style={styles.backTextWhite}>Queue</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.playlist(map, item) }>
                                    <Text style={styles.backTextWhite}>Playlist</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.container6, styles.rowFront]}>
                                <View style={styles.paddingLeft}/>
                                {this.state.imagePath.length < 1 &&
                                    <Image style={styles.albumart} source={require('./images/icons8-cd-filled-50.png')}/>
                                }
                                {this.state.imagePath.length > 0 &&
                                    <Image style={styles.noalbumart} source={{uri: this.state.imagePath}}/>
                                }
                                <View style={styles.container7}>
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.item}>{item.title}</Text>
                                    {item.artist !== undefined &&
                                        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.item}>{item.artist}</Text>
                                    }
                                    {item.album !== undefined &&
                                        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.item}>{item.album}</Text>
                                    }
                                    <Text style={styles.item}>Track: {item.track} Time: {item.time}</Text>
                                </View>
                                <Icon name="ios-swap" size={20} color="black" style={styles.icon}/>
                            </View>
                        </SwipeRow>
                    );}}
                    renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                    ItemSeparatorComponent={this.renderSeparator}
				/>
                </View>
                {this.state.loading &&
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#0000ff"/>
                    </View>
                }
                <NewPlaylistModal visible={this.state.modalVisible} selectedItem={this.state.selectedItem} onSet={(name, selectedItem) => {this.finishAdd(name, selectedItem);}} onCancel={() => this.setState({modalVisible: false})}></NewPlaylistModal>

                <ActionButton buttonColor="rgba(231,76,60,1)" hideShadow={true}>
                    <ActionButton.Item buttonColor='#1abc9c' title="Play Now" size={40} textStyle={styles.actionButtonText} onPress={() => {this.autoPlay();}}>
                        <FAIcon name="play" size={15} color="#e6e6e6" />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#3498db' title="All to Queue" size={40} textStyle={styles.actionButtonText} onPress={() => {this.addAll(false);}}>
                        <FAIcon name="plus-square" size={15} color="#e6e6e6" />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#9b59b6' title="All to Playlist" size={40} textStyle={styles.actionButtonText} onPress={() => {this.addAll(true);}}>
                        <FAIcon name="plus-square" size={15} color="#e6e6e6" />
                    </ActionButton.Item>
                </ActionButton>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        fontFamily: 'GillSans-Italic',
    },
    sectionHeader: {
        paddingTop: 2,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 2,
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: 'rgba(247,247,247,1.0)',
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionButtonText: {
        fontSize: 13,
        fontFamily: 'GillSans-Italic'
    },
    backTextWhite: {
		color: '#FFF'
	},
    rowFront: {
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
        height: 85
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
        height: 85
	},
	backRightBtn: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		width: 75
	},
	backRightBtnLeft: {
		backgroundColor: 'grey',
		right: 75
	},
	backRightBtnRight: {
		backgroundColor: 'darkgray',
		right: 0
    },
    container1: { 
        flex: 1, 
        justifyContent: 'flex-start', 
        alignItems: 'stretch' 
    },
    container2: {
        flex: .1, 
        flexDirection: 'row', 
        alignItems: 'center'
    },
    container3: {
        flex: .75
    },
    container4: {
        flex: .25
    },
    container5: {
        flex: .9, 
        flexDirection: 'row', 
        alignItems: 'stretch' 
    },
    separator: {
        height: 1,
        width: "90%",
        backgroundColor: "#CED0CE",
        marginLeft: "5%"
    },
    text: {
        fontSize: 15,
        fontFamily: 'GillSans-Italic'
    },
    paddingLeft: {
        paddingLeft: 10
    },
    albumart: {
        width: 20, 
        height: 20, 
        paddingLeft: 20, 
        paddingRight: 35, 
        resizeMode: 'contain'
    },
    noalbumart: {
        width: 55, 
        height: 55, 
        paddingLeft: 20, 
        paddingRight: 20, 
        resizeMode: 'contain'
    },
    container6: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent:'space-between'
    },
    container7: { 
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'space-evenly', 
        alignItems: 'stretch', 
        padding: 5
    },
    icon: { 
        paddingLeft: 20, 
        paddingRight: 20 
    },
    searchbarContainer: {
        backgroundColor: 'white'
    },
    searchbarInputContainer: {
        backgroundColor: '#EBECEC'
    },
    searchbarInput: { 
        backgroundColor: '#EBECEC'
    }
});
