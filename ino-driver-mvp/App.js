import React from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon, Button } from 'react-native-elements';
import { Permissions, Notifications } from 'expo';
import { Provider } from 'react-redux';

import store from './store';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OfferScreen from './screens/OfferScreen';
import DetailScreen from './screens/DetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';


export default class App extends React.Component {
  // Get push notifications token and permissions
  // https://docs.expo.io/versions/latest/guides/push-notifications
  async componentDidMount() {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let pushNotificationsToken = await Notifications.getExpoPushTokenAsync();
    // for debug
    console.log(JSON.stringify(pushNotificationsToken));
  }


  render() {
    const headerNavigationOptions = {
      headerStyle: {
        backgroundColor: 'gray',
        marginTop: Platform.OS === 'android' ? 24 : 0
      },
      headerTitleStyle: { color: 'white' },
      headerTintColor: 'white',
    };


    const LoginStack = createStackNavigator({
      login: {
        screen: LoginScreen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: 'ログイン',
          headerBackTitle: ' '
        }
      },
      signup: {
        screen: SignupScreen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: '新規登録',
        }
      }
    }, {
      initialRouteName: 'login',
    });


    const MainStack = createStackNavigator({
      offer: {
        screen: OfferScreen,
        navigationOptions: ({ navigation }) => ({
          ...headerNavigationOptions,
          headerLeft: (
            <View style={{ paddingLeft: 10 }}>
              <Icon
                name='person'
                color='white'
                onPress={() => navigation.navigate('profile')}
              />
            </View>
          ),
          headerTitle: 'ino',
          headerBackTitle: ' '
        })
      },
      detail: {
        screen: DetailScreen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: '詳細',
        }
      },
      profile: {
        screen: ProfileScreen,
        navigationOptions: ({ navigation }) => ({
          ...headerNavigationOptions,
          headerTitle: 'プロフィール',
          headerRight: (
            <Button
              title="編集"
              color="white"
              buttonStyle={{ backgroundColor: 'transparent' }}
              onPress={() => navigation.navigate('editProfile')}
            />
          ),
        })
      }
    }, {
      initialRouteName: 'offer',
    });


    const RootStack = createStackNavigator({
      main: {
        screen: MainStack
      },
      editProfile: {
        screen: EditProfileScreen,
      }
    }, {
      mode: 'modal',
      headerMode: 'none',
    });


    const NavigatorTab = createBottomTabNavigator({
      login: {
        screen: LoginStack
      },
      root: {
        screen: RootStack
      }
    }, {
      navigationOptions: { tabBarVisible: false },
      initialRouteName: 'login',
      //lazy: true,
    });


    return (
      <Provider store={store}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <NavigatorTab />
        </View>
      </Provider>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center',
    justifyContent: 'center',
  },
});
