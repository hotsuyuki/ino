import React from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Icon, Button } from 'react-native-elements';
import { Provider } from 'react-redux';

import store from './store';

import RegisterScreen from './screens/RegisterScreen';
import OfferScreen from './screens/OfferScreen';
import DetailScreen from './screens/DetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';


export default class App extends React.Component {
  render() {
    const headerNavigationOptions = {
      headerStyle: {
        backgroundColor: 'gray',
        marginTop: Platform.OS === 'android' ? 24 : 0
      },
      headerTitleStyle: { color: 'white' },
      headerTintColor: 'white',
    };


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
          headerTitle: 'Ino',
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
      register: { screen: RegisterScreen },
      root: { screen: RootStack }
    }, {
      navigationOptions: { tabBarVisible: false }
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
