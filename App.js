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
    ActivityIndicator, 
    View, 
    TouchableOpacity, 
    Appearance, 
    useColorScheme, 
   // DefaultTheme,
    DarkTheme,    
    SafeAreaView,
    useWindowDimensions 
} from 'react-native';
import { DefaultTheme, Provider as PaperProvider} from 'react-native-paper';

import Icon  from 'react-native-vector-icons/Ionicons';
import FAIcon  from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/dist/MaterialIcons';
import { NavigationContainer, useNavigationContainerRef, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { getHeaderTitle } from '@react-navigation/elements';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

//import { createAppContainer } from '@react-navigation/native';

import { StyleManager } from './Styles';

import PlaylistScreen from './PlaylistScreen';
import PlaylistEditor from './PlaylistEditor';

import PlayScreen from './PlayScreen';
import SearchScreen from './SearchScreen';
import SettingsScreen from './SettingsScreen';
import FilesScreen from './FilesScreen';
import ConnectionsScreen from './ConnectionsScreen';
import ArtistsScreen from './ArtistsScreen';
import AlbumsScreen from './AlbumsScreen';
import SongsScreen from './SongsScreen';
//import PlaylistDetails from './PlaylistDetails';
import WelcomeScreen from './WelcomeScreen';
import OutputsScreen from './OutputsScreen';
import DebugScreen from './DebugScreen';
import AlbumArtScreen from './AlbumArtScreen';
import UPnPBrowseScreen from './UPnPBrowseScreen';
import UPnPRenderersScreen from './UPnPRenderersScreen';
import StreamPlayScreen from './StreamPlayScreen';
import MPDConnection from './MPDConnection';

class Header extends React.Component {
    state = {
        connectionState: 0
    }

    componentDidMount() {
        this.setState({connectionState: MPDConnection.isConnected() ? 2 : 0});
        this.onConnect = MPDConnection.getEventEmitter().addListener(
            "OnConnect",
            () => {
                this.setState({connectionState: 2});
            }
        );

        this.onConnecting = MPDConnection.getEventEmitter().addListener(
            "OnConnecting",
            () => {
                this.setState({connectionState: 1});
            }
        );

        this.onDisconnect = MPDConnection.getEventEmitter().addListener(
            "OnDisconnect",
            () => {
                this.setState({connectionState: 0});
            }
        );

        this.onApperance = Appearance.addChangeListener(({ colorScheme }) => {
            this.setState({connectionState: this.state.connectionState});
        });
    }

    componentWillUnmount() {
        this.onConnect?.remove();
        this.onConnecting?.remove();
        this.onDisconnect?.remove();
        if (this.onApperance) {
            this.onApperance.remove();
        }
    }

    render() {
        let color;
        let icon;
        let isConnecting = false;
        switch (this.state.connectionState) {
            case 0:
                color = "gray";
                icon = "unlink";
                break;
            case 1:
                isConnecting = true;
                break;
            case 2:
                color = "red";
                icon = "link";
                break;
        }
        const styles = StyleManager.getStyles("appStyles");

        return (
            <View>
            {isConnecting &&
                <View style={styles.connecting}>
                    <ActivityIndicator size="small" color="#0000ff" style={styles.paddingRight}/>
                </View>
            }
            {!isConnecting &&
                <FAIcon name={icon} size={20} color={color} style={styles.paddingRight}/>
            }
            </View>
        );
    }
}

class SortHeader extends React.Component {
    render() {
        const styles = StyleManager.getStyles("appStyles");
        const { navigation } = this.props;
        return (
            <View>
                <TouchableOpacity onPress={this.props.route.params?.sort}>
                    <MaterialIcon name="sort" size={20} color="gray" style={styles.paddingRight}/>
                </TouchableOpacity>
            </View>
        );
    }
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const TopTab = createMaterialTopTabNavigator();
/*
const PlayStack = createStackNavigator(
    {
        Play: { 
            screen: PlayScreen 
        },
        PlaylistDetails: { 
            screen: PlaylistDetails 
        },
        Connections: { 
            screen: ConnectionsScreen 
        }
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: () => (
                <Header navigation={navigation}></Header>
            ),
            headerBackTitle: null,
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
        })
    }
);
*/

function PlayPage(navigationRef) {
    return (
        <TopTab.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <TopTab.Screen name="Player" component={PlayScreen} props={navigationRef} />
            <TopTab.Screen name="Queue" component={PlaylistScreen} props={navigationRef} />
            <TopTab.Screen name="Playlists" component={PlaylistEditor} props={navigationRef} />            
        </TopTab.Navigator>
    )
}
/*
const BrowseStack = createStackNavigator(
    {
        Artists: { 
            screen: ArtistsScreen
        },
        Albums: { 
            screen: AlbumsScreen,
            navigationOptions: ({ navigation }) => ({
                headerRight: () => (
                    <Header navigation={navigation}></Header>
                ),
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            })
        },
        Songs: { 
            screen: SongsScreen
        }
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: () => (
                <SortHeader navigation={navigation}></SortHeader>
            ),
            headerBackTitle: null,
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
        })
    }
);
*/

function BrowseStack(navigationRef) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="Artists" component={ArtistsScreen} props={navigationRef} options={{ headerShown: false }} />
            <Stack.Screen name="Albums" component={AlbumsScreen} props={navigationRef} options={{ headerShown: false }}/>            
            <Stack.Screen name="Songs" component={SongsScreen} props={navigationRef} options={{ headerShown: false }} />            
        </Stack.Navigator>
    )
}

/*
const SearchStack = createStackNavigator(
    {
        Search: { 
            screen: SearchScreen 
        },
        Albums: { 
            screen: AlbumsScreen
        },
        Songs: { 
            screen: SongsScreen,
            navigationOptions: ({ navigation }) => ({
                headerRight: () => (
                    <SortHeader navigation={navigation}></SortHeader>
                ),
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            })    
        }
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: () => (
                <Header navigation={navigation}></Header>
            ),
            headerBackTitle: null,
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
        })
    }
);
*/

function SearchStack(navigationRef) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="SearchMPD" component={SearchScreen} props={navigationRef} options={{ headerShown: false }} />
            <Stack.Screen name="Albums" component={AlbumsScreen} props={navigationRef} options={{ headerShown: false }} />
            <Stack.Screen name="Songs" component={SongsScreen} props={navigationRef} options={{ headerShown: false }} />            
        </Stack.Navigator>
    )
}

/*
const FilesStack = createStackNavigator(
    {
        Files: { 
            screen: FilesScreen,
            navigationOptions: ({ navigation }) => ({
                headerRight: () => (
                    <SortHeader navigation={navigation}></SortHeader>
                ),
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            })    
        }
    }
);
*/

function FilesStack(navigationRef ) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="File" component={FilesScreen} props={navigationRef} options={{ headerShown: false }} />
            <Stack.Screen name="Connections" component={ConnectionsScreen} props={navigationRef} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

/*
const SettingsStack = createStackNavigator(
    {
        Settings: { 
            screen: SettingsScreen 
        },
        Connections: { 
            screen: ConnectionsScreen 
        },
        Outputs: { 
            screen: OutputsScreen 
        },
        Debug: { 
            screen: DebugScreen 
        },
        AlbumArt: {
            screen: AlbumArtScreen
        }
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: () => (
                <Header navigation={navigation}></Header>
            ),
            headerBackTitle: null,
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
        })
    }
);
*/

function SettingsStack(navigationRef) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} props={navigationRef}  options={{ headerShown: false }}/>
            <Stack.Screen name="Connections" component={ConnectionsScreen} props={navigationRef}  options={{ headerShown: false }}/>
            <Stack.Screen name="Outputs" component={OutputsScreen} props={navigationRef}  options={{ headerShown: false }}/>
            <Stack.Screen name="Debug" component={DebugScreen} props={navigationRef}  options={{ headerShown: false }}/>
            <Stack.Screen name="AlbumArt" component={AlbumArtScreen} props={navigationRef}  options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

/*
const MainPage = createBottomTabNavigator(
  {
    Play: { screen: PlayStack },
    Browse: { screen: BrowseStack },
    Search: { screen: SearchStack },
    Files: { screen: FilesStack },
    Settings: { screen: SettingsStack }
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if (routeName === 'Play') {
                //iconName = `ios-musical-notes${focused ? '' : '-outline'}`;
                iconName = `ios-musical-notes`;
            } else if (routeName === 'Browse') {
                //iconName = `ios-list${focused ? '' : '-outline'}`;
                iconName = `ios-list`;
            } else if (routeName === 'Search') {
                //iconName = `ios-search${focused ? '' : '-outline'}`;
                iconName = `ios-search`;
            } else if (routeName === 'Files') {
                //iconName = `ios-folder${focused ? '' : '-outline'}`;
                iconName = `ios-folder`;
            } else if (routeName === 'Settings') {
                //iconName = `ios-settings${focused ? '' : '-outline'}`;
                iconName = `ios-settings`;
            }

            return <Icon name={iconName} size={25} color={tintColor} />;
        },
        tabBarOnPress: ({navigation, defaultHandler}) => {
            if (MPDConnection.isConnected()) {
                defaultHandler();
            }
        },
        tabBarOptions: {
            activeTintColor: 'red',
            inactiveTintColor: 'gray',
            style: StyleManager.getStyles("appStyles").tabBar
        }
    }),
    tabBarPosition: 'bottom',
    animationEnabled: true,
    swipeEnabled: false
  }
);
*/
/*
function MainPage(navigationRef) {
    return (
        <Tab.Navigator        
            screenOptions={{
                tabBarActiveTintColor: 'red',
                tabBarInactiveTintColor: 'gray',
                style: StyleManager.getStyles("appStyles").tabBar
            }}
        >
            <Tab.Screen 
                name="Play" 
                component={PlayPage} 
                options={{
                    tabBarLabel: 'Play',
                    tabBarIcon: ({ color, size }) => (
                    <Icon name='ios-musical-notes' size={25} color={color} />
                    ),
                }}
                props={navigationRef}
            />
            <Tab.Screen 
                name="Browse" 
                component={BrowseStack} 
                options={{
                    tabBarLabel: 'BrowseStack',
                    tabBarIcon: ({ color, size }) => (
                    <Icon name='ios-list' size={25} color={color} />
                    ),
                }}
                props={navigationRef}
            />
            <Tab.Screen 
                name="Search" 
                component={SearchStack} 
                options={{
                    tabBarLabel: 'SearchStack',
                    tabBarIcon: ({ color, size }) => (
                    <Icon name='ios-search' size={25} color={color} />
                    ),
                }}
                props={navigationRef}
            />
            <Tab.Screen 
                name="Files" 
                component={FilesStack} 
                options={{
                    tabBarLabel: 'FilesStack',
                    tabBarIcon: ({ color, size }) => (
                    <Icon name='ios-folder' size={25} color={color} />
                    ),
                }}
                props={navigationRef}
            />
            <Tab.Screen 
                name="Settings" 
                component={SettingsStack} 
                options={{
                    tabBarLabel: 'SettingsStack',
                    tabBarIcon: ({ color, size }) => (
                    <Icon name='ios-settings' size={25} color={color} />
                    ),
                }}
                props={navigationRef}
            />            
        </Tab.Navigator>
    )
}
*/
/*
const UPnPBrowseStack = createStackNavigator(
    {
        UPnPBrowse: { 
            screen: UPnPBrowseScreen,
            navigationOptions: ({ navigation }) => ({
                headerRight: () => (
                    <Header navigation={navigation}></Header>
                ),
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            })    
        }
    }
);
*/

function UPnPBrowseStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="UPnPBrowse" component={UPnPBrowseScreen} />
        </Stack.Navigator>
    )
}

/*
const UPnPRenderersStack = createStackNavigator(
    {
        UPnPRenderers: { 
            screen: UPnPRenderersScreen,
            navigationOptions: ({ navigation }) => ({
                headerRight: () => (
                    <Header navigation={navigation}></Header>
                ),
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            })    
        }
    }
);
*/

function UPnPRenderersStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="UPnPRenderers" component={UPnPRenderersScreen} />
        </Stack.Navigator>
    )
}

/*
const UPnPSettingsStack = createStackNavigator(
    {
        Connections: { 
            screen: ConnectionsScreen 
        }
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: () => (
                <Header navigation={navigation}></Header>
            ),
            headerBackTitle: null,
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
        })
    }
);
*/

function UPnPSettingsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="Connection" component={ConnectionsScreen} />
        </Stack.Navigator>
    )
}

/*
const StreamPlayStack = createStackNavigator(
    {
        Play: { 
            screen: StreamPlayScreen 
        }
    },
    {
        defaultNavigationOptions: ({ navigation }) => ({
            headerRight: () => (
                <Header navigation={navigation}></Header>
            ),
            headerBackTitle: null,
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
        })
    }
);
*/


function StreamPlayStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerBackTitle: null,
                headerStyle: StyleManager.getStyles("appStyles").headerStyle,
                headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
            }}        
        >
            <Stack.Screen name="Stream" component={StreamPlayScreen} />
        </Stack.Navigator>
    )
}

/*
const UPnPPage = createBottomTabNavigator(
    {
      Play: { screen: StreamPlayStack },
      Browse: { screen: UPnPBrowseStack },
      Render: { screen: UPnPRenderersStack },
      Settings: { screen: UPnPSettingsStack }
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
          tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if (routeName === 'Play') {
                iconName = `ios-musical-notes`;
            } else if (routeName === 'Browse') {
                iconName = `ios-list`;
            } else if (routeName === 'Render') {
                iconName = `ios-headset`;
            } else if (routeName === 'Settings') {
                iconName = `ios-settings`;
            }
  
            return <Icon name={iconName} size={25} color={tintColor} />;
          },
          tabBarOnPress: ({navigation, defaultHandler}) => {
                defaultHandler();
          },
          tabBarOptions: {
              activeTintColor: 'red',
              inactiveTintColor: 'gray',
              style: StyleManager.getStyles("appStyles").tabBar
          }
      }),
      tabBarPosition: 'bottom',
      animationEnabled: true,
      swipeEnabled: false
    }
);
*/

function UPnPPage() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: 'red',
                tabBarInactiveTintColor: 'gray',
                style: StyleManager.getStyles("appStyles").tabBar
          }}
        >
        <Tab.Screen 
            name="Play" 
            component={StreamPlayScreen}             
            options={{
                tabBarLabel: 'Play',
                tabBarIcon: ({ color, size }) => (
                <Icon name='ios-musical-notes' size={25} color={color} />
                ),
              }}
        />
        <Tab.Screen 
            name="Browse" 
            component={UPnPBrowseScreen}
            options={{
                tabBarLabel: 'Browse',
                tabBarIcon: ({ color, size }) => (
                <Icon name='ios-list' size={25} color={color} />
                ),
              }}            
        />
        <Tab.Screen 
            name="Render" 
            component={UPnPRenderersScreen} 
            options={{
                tabBarLabel: 'Render',
                tabBarIcon: ({ color, size }) => (
                <Icon name='ios-headset' size={25} color={color} />
                ),
              }}                        
            />
        <Tab.Screen 
            name="Settings" 
            component={ConnectionsScreen} 
            options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ color, size }) => (
                <Icon name='ios-settings' size={25} color={color} />
                ),
              }}             
        />        
      </Tab.Navigator>
    )
}


function MyDrawer(navigationRef) {
    const dimensions = useWindowDimensions();
    const isLargeScreen = dimensions.width >= 768;  
    const styles = StyleManager.getStyles("appStyles");
    return (
      <Drawer.Navigator 
        initialRouteName="WelcomeScreen" 
        drawerStyle={styles.container}
        screenOptions={{
            drawerType: isLargeScreen ? 'permanent' : 'slide',
            drawerStyle: isLargeScreen ? null : { width: '50%' },
            overlayColor: 'transparent',
            headerBackTitle: null,           
            headerStyle: StyleManager.getStyles("appStyles").headerStyle,
            headerTitleStyle: StyleManager.getStyles("appStyles").headerTitleStyle
          }}        
      >
        <Drawer.Screen 
            name="Play" 
            component={PlayPage} 
            options={{
                title: 'Play',
                drawerIcon: ({ color, size }) => (
                <Icon name='ios-musical-notes' size={15} color={color} />
                ),
            }}
            props={navigationRef}
        />
        <Drawer.Screen 
            name="Browse" 
            component={BrowseStack} 
            options={{
                title: 'Browse',
                drawerIcon: ({ color, size }) => (
                <Icon name='ios-list' size={15} color={color} />
                ),
            }}
            props={navigationRef}
        />
        <Drawer.Screen 
            name="Search" 
            component={SearchStack} 
            options={{
                title: 'Search',
                drawerIcon: ({ color, size }) => (
                <Icon name='ios-search' size={15} color={color} />
                ),
            }}
            props={navigationRef}
        />
        <Drawer.Screen 
            name="Files" 
            component={FilesStack} 
            options={{
                title: 'Files',
                drawerIcon: ({ color, size }) => (
                <Icon name='ios-folder' size={15} color={color} />
                ),
            }}
            props={navigationRef}
        />
        <Drawer.Screen 
            name="UPnPPage" 
            component={UPnPPage} 
            options={{
                title: 'UPnPPage',
                drawerIcon: ({ color, size }) => (
                <Icon name='ios-server' size={15} color={color} />
                ),
            }}            
            props={navigationRef} 
        />        
        <Drawer.Screen 
            name="Settings" 
            component={SettingsStack} 
            options={{
                title: 'Settings',
                drawerIcon: ({ color, size }) => (
                <Icon name='ios-settings' size={15} color={color} />
                ),
            }}
            props={navigationRef}
        />
        <Drawer.Screen 
            name="WelcomeScreen" 
            options={{
                title:"Connections",
                drawerIcon: ({ color, size }) => (
                    <Icon name='ios-link' size={15} color={color} />
                    ),
            }}
            component={WelcomeScreen} 
            props={navigationRef} 
        />

      </Drawer.Navigator>
    );
}


export default () => {
    const theme = useColorScheme();
    //console.log('(theme)>>>', theme)
    const styles = StyleManager.getStyles("appStyles");
    const navigationRef = useNavigationContainerRef();
    return (
        <PaperProvider >
        <SafeAreaView style={styles.container}>
            <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
                <MyDrawer {...navigationRef}/>
            </NavigationContainer>
        </SafeAreaView>
        </PaperProvider>
    )
}
