import React from 'react';
import {
  StyleSheet, Text, View, Alert,
  AsyncStorage
} from 'react-native';
import { Button, FormLabel, FormInput } from 'react-native-elements';
import { AppLoading, Permissions, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


// for push notifications handler
const CANCELED_OFFER = 'canceled_offer';
const RESERVATION_DEADLINE = 'reservation_deadline';
const RECOMMEND_OFFER = 'recommend_offer';

const INITIAL_STATE = {
  // for skipping this screen or not
  isLogedin: null,

  // for ReservingScreen
  isReserving: null,

  // for rider info
  riderInfo: {
    mail: '',
  }
};


class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Decide to stay at LoginScreen or navigate to OfferListScreen or ReservingScreen
    try {
      let stringifiedRiderInfo = await AsyncStorage.getItem('riderInfo');

      // If there is NO stored rider info yet,
      // stay at LoginScreen
      if (stringifiedRiderInfo === null) {
        console.log('Cannot get rider info...');
        this.setState({
          isLogedin: false,
          isReserving: false,
        });

      // If there is the stored rider info already,
      // navigate to OfferListScreen or ReservingScreen
      } else {
        let mail = JSON.parse(stringifiedRiderInfo).mail;

        // Try access login api
        try {
          let loginResponse = await fetch('https://inori.work/riders/signin', {
          //let loginResponse = await fetch('https://inori.work/riders/login', { TODO: Change URL
            method: 'POST',
            headers: {},
            body: JSON.stringify({ mail }),
          });

          //console.log(`[LoginScreen] mail = ${JSON.stringify({ mail })}`);

          // If succeeded login with the stored email address,
          if (parseInt(loginResponse.status / 100, 10) === 2) {
            let loginResponseJson = await loginResponse.json();
            const riderInfo = loginResponseJson.rider;

            console.log(`[LoginScreen] JSON.stringify(riderInfo) = ${JSON.stringify(riderInfo)}`);

            await AsyncStorage.setItem('riderInfo', JSON.stringify(riderInfo));

            // Get push notifications token and add notification handle listener
            // https://docs.expo.io/versions/latest/guides/push-notifications
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

            let finalStatus = existingStatus;

            // Only ask if permissions have not already been determined,
            // because iOS won't necessarily prompt the user a second time.
            if (existingStatus !== 'granted') {
              // Android remote notification permissions are granted during the app install,
              // so this will only ask on iOS
              const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
              finalStatus = status;
            }

            console.log(`[LoginScreen] existingStatus = ${existingStatus}`);
            console.log(`[LoginScreen] finalStatus = ${finalStatus}`);

            // Stop here if the user did not grant permissions
            if (finalStatus !== 'granted') {
              return;
            }

            // Get the token that uniquely identifies this device
            let pushNotificationsToken = await Notifications.getExpoPushTokenAsync();
            console.log(`[LoginScreen] ${JSON.stringify(pushNotificationsToken)}`);

            // POST the push notification token
            try {
              let pushNotificationsResponse = await fetch('https://inori.work/tokens/push/riders', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: riderInfo.id,
                  token: pushNotificationsToken
                }),
              });

              //let pushNotificationsResponseJson = await pushNotificationsResponse.json();

              // If failed to POST the push notification token,
              if (
                parseInt(pushNotificationsResponse.status / 100, 10) === 4 ||
                parseInt(pushNotificationsResponse.status / 100, 10) === 5
              ) {
                console.log('Failed to POST the push notification token...');

                Alert.alert(
                  'プッシュ通知の設定に失敗しました。',
                  '電波の良いところで後ほどアプリを再起動して下さい。',
                  [{ text: 'OK' }]
                );
              }

            // If cannot access tokens api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access tokens api...');
            }

            // Handle notifications that are received or selected while the app is open.
            // If the app was closed and then opened by tapping the notification
            // (rather than just tapping the app icon to open it),
            // this function will fire on the next tick after the app starts with the notification data.
            this.notificationListener = Notifications.addListener(this.handleNotification);
            console.log('[LoginScreen] addListener(this.handleNotification) in componentWillMount()');

            console.log('[LoginScreen] Automatic login with the stored email address is succeeded!!!');
            this.setState({
              isLogedin: true,
              riderInfo: {
                mail: ''
              }
            });

            // Navigate to OfferListScreen or ReservingScreen
            let stringifiedReservationInfo = await AsyncStorage.getItem('reservationInfo');
            console.log(`[LoginScreen] stringifiedReservationInfo = ${stringifiedReservationInfo}`);

            if (stringifiedReservationInfo === null) {
              this.setState({ isReserving: false });
              this.props.navigation.navigate('offerList');
            } else {
              const reservationInfo = JSON.parse(stringifiedReservationInfo);

              // If the scheduling time (1 hour before the departure time) is NOT passed yet,
              if (new Date() < new Date(reservationInfo.scheduling_time)) {
                this.setState({ isReserving: false });
                this.props.navigation.navigate('offerList');
              } else {
                this.setState({ isReserving: true });
                console.log('[LoginScreen] navigate(reserving) in componentWillMount()');
                this.props.navigation.navigate('reserving');
              }
            }

          // If cannot login with the stored email address,
          } else if (
            parseInt(loginResponse.status / 100, 10) === 4 ||
            parseInt(loginResponse.status / 100, 10) === 5
          ) {
            console.log('Automatic login with the stored email address failed...');
            Alert.alert(
              'アカウントを確認できませんでした。',
              'アカウントを新規登録をするかもしくは電波の良いところで後ほどお試しください。',
              [{ text: 'OK' }]
            );
            this.setState({
              isLogedin: false,
              isReserving: false,
            });
          }

        // If cannot access the login api,
        } catch (error) {
          console.warn(error);
          console.log('Cannot access the login api...');
          Alert.alert(
            'エラーが発生しました。',
            '電波の良いところで後ほどお試しください。',
            [{ text: 'OK' }]
          );
          this.setState({
            isLogedin: false,
            isReserving: false,
          });
        }
      }

    // If cannot get stored rider info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored rider info...');
      this.setState({
        isLogedin: false,
        isReserving: false,
      });
    }
  }


  handleNotification = async (notification) => {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // for debug
    //console.log(`JSON.stringify(notification) = ${JSON.stringify(notification)}`);

    switch (notification.data.type) {
      // When the driver canceled the offer which already reserved,
      case CANCELED_OFFER: {
        // Cancel the scheduled local notification
        let stringifiedLocalNotifications = await AsyncStorage.getItem('localNotifications');
        let localNotifications = JSON.parse(stringifiedLocalNotifications);

        const newLocalNotifications = [];
        localNotifications.forEach(async (eachLocalNotification) => {
          if (eachLocalNotification.offer_id === notification.data.offer_id) {
            await Notifications.cancelScheduledNotificationAsync(eachLocalNotification.local_notification_id);
          } else {
            newLocalNotifications.push(eachLocalNotification);
          }
        });

        await AsyncStorage.setItem('localNotifications', JSON.stringify(newLocalNotifications));

        console.log('[LoginScreen] CANCELED_OFFER');

        // If foregrounded by selecting the push notification,
        if (notification.origin === 'selected') {
          // Rerender the screen
          this.props.fetchOwnReservations();
          this.props.fetchAllOffers();

          // Escape ReservingScreen and move back to OfferListScreen
          await AsyncStorage.removeItem('reservationInfo');
          this.props.resetSelectedOffer();
          console.log('[LoginScreen] navigate(offerList) in CANCELED_OFFER [notification.origin === selected]');
          this.props.navigation.navigate('offerList');

        // If received the push notification while the app is already foreground,
        } else if (notification.origin === 'received') {
          Alert.alert(
            '',
            `${notification.data.message_title}`,
            [
              {
                text: 'OK',
                onPress: async () => {
                  // Rerender the screen
                  this.props.fetchOwnReservations();
                  this.props.fetchAllOffers();

                  // Escape ReservingScreen and move back to OfferListScreen
                  await AsyncStorage.removeItem('reservationInfo');
                  this.props.resetSelectedOffer();
                  console.log('[LoginScreen] navigate(offerList) in CANCELED_OFFER [notification.origin === selected]');
                  this.props.navigation.navigate('offerList');
                },
              }
            ],
            { cancelable: false }
          );
        }
        break;
      }

      // When the reservation deadline has come,
      case RESERVATION_DEADLINE:
        // If foregrounded by selecting the push notification,
        if (notification.origin === 'selected') {
          this.props.navigation.navigate('reserving');

        // If received the push notification while the app is already foreground,
        } else if (notification.origin === 'received') {
          Alert.alert(
            '',
            `${notification.data.message_title}`,
            [
              {
                text: 'OK',
                onPress: () => this.props.navigation.navigate('reserving'),
              }
            ],
            { cancelable: false }
          );
        }
        break;

      case RECOMMEND_OFFER:
        // Rerender the screen
        this.props.fetchOwnReservations();
        this.props.fetchAllOffers();

        this.props.navigation.navigate('offerList');
        break;

      default:
        break;
    }
  };


  onLoginButtonPress = async () => {
    // Truncate whitespaces and add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    const mail = `${this.state.riderInfo.mail.replace(/\s/g, '').toLowerCase()}@stu.kanazawa-u.ac.jp`;

    // Try access login api
    try {
      let loginResponse = await fetch('https://inori.work/riders/signin', {
      //let loginResponse = await fetch('https://inori.work/riders/login', { TODO: Change URL
        method: 'POST',
        headers: {},
        body: JSON.stringify({ mail }),
      });

      // for debug
      //console.log('mail = ' + JSON.stringify({ mail }));

      // If succeed login with the stored email address,
      if (parseInt(loginResponse.status / 100, 10) === 2) {
        let loginResponseJson = await loginResponse.json();
        const riderInfo = loginResponseJson.rider;

        console.log(`[LoginScreen] JSON.stringify(riderInfo) = ${JSON.stringify(riderInfo)}`);

        await AsyncStorage.setItem('riderInfo', JSON.stringify(riderInfo));

        // Get push notifications token and add notification handle listener
        // https://docs.expo.io/versions/latest/guides/push-notifications
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

        let finalStatus = existingStatus;

        // Only ask if permissions have not already been determined,
        // because iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
          // Android remote notification permissions are granted during the app install,
          // so this will only ask on iOS
          const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
          finalStatus = status;
        }

        //console.log(`[LoginScreen] existingStatus = ${existingStatus}`);
        //console.log(`[LoginScreen] finalStatus = ${finalStatus}`);

        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
          return;
        }

        // Get the token that uniquely identifies this device
        let pushNotificationsToken = await Notifications.getExpoPushTokenAsync();
        console.log(`[LoginScreen] ${JSON.stringify(pushNotificationsToken)}`);

        // POST the push notification token
        try {
          let pushNotificationsResponse = await fetch('https://inori.work/tokens/push/riders', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: riderInfo.id,
              token: pushNotificationsToken
            }),
          });

          //let pushNotificationsResponseJson = await pushNotificationsResponse.json();

          // If failed to POST the push notification token,
          if (
            parseInt(pushNotificationsResponse.status / 100, 10) === 4 ||
            parseInt(pushNotificationsResponse.status / 100, 10) === 5
          ) {
            console.log('Failed to POST the push notification token...');

            Alert.alert(
              'プッシュ通知の設定に失敗しました。',
              '電波の良いところで後ほどアプリを再起動して下さい。',
              [{ text: 'OK' }]
            );
          }

        // If cannot access tokens api,
        } catch (error) {
          console.error(error);
          console.log('Cannot access tokens api...');
        }

        // Handle notifications that are received or selected while the app is open.
        // If the app was closed and then opened by tapping the notification
        // (rather than just tapping the app icon to open it),
        // this function will fire on the next tick after the app starts with the notification data.
        this.notificationListener = Notifications.addListener(this.handleNotification);

        console.log('[LoginScreen] Manual login with the input email address is succeeded!!!');
        this.setState({
          isLogedin: true,
          riderInfo: {
            mail: ''
          }
        });

        // Navigate to OfferListScreen or ReservingScreen
        let stringifiedReservationInfo = await AsyncStorage.getItem('reservationInfo');
        console.log(`[LoginScreen] stringifiedReservationInfo = ${stringifiedReservationInfo}`);

        if (stringifiedReservationInfo === null) {
          this.setState({ isReserving: false });
          this.props.navigation.navigate('offerList');
        } else {
          const reservationInfo = JSON.parse(stringifiedReservationInfo);

          // If the scheduling time (1 hour before the departure time) is NOT passed yet,
          if (new Date() < new Date(reservationInfo.scheduling_time)) {
            this.setState({ isReserving: false });
            this.props.navigation.navigate('offerList');
          } else {
            this.setState({ isReserving: true });
            console.log('[LoginScreen] navigate(reserving) in onLoginButtonPress()');
            this.props.navigation.navigate('reserving');
          }
        }

      // If cannot login with the stored email address,
      } else if (
        parseInt(loginResponse.status / 100, 10) === 4 ||
        parseInt(loginResponse.status / 100, 10) === 5
      ) {
        console.log('Manual login with the input email address failed...');
        Alert.alert(
          'アカウントを確認できませんでした。',
          'アカウントを新規登録をするかもしくは電波の良いところで後ほどお試しください。',
          [{ text: 'OK' }]
        );
      }

    // If cannot access the login api,
    } catch (error) {
      console.warn(error);
      console.log('Cannot access the login api...');
      Alert.alert(
        'エラーが発生しました。',
        '電波の良いところで後ほどお試しください。',
        [{ text: 'OK' }]
      );
    }
  }


  renderLoginButton() {
    return (
      <View style={{ padding: 20 }}>
        <Button
          // If email is not entered, inactivate the button
          disabled={this.state.riderInfo.mail === INITIAL_STATE.riderInfo.mail}
          title="ログイン"
          color="white"
          buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
          onPress={this.onLoginButtonPress}
        />
      </View>
    );
  }


  render() {
    console.log(`[LoginScreen] this.state.isLogedin = ${this.state.isLogedin}`);
    console.log(`[LoginScreen] this.state.isReserving = ${this.state.isReserving}`);

    if (
      this.state.isLogedin === INITIAL_STATE.isLogedin ||
      this.state.isReserving === INITIAL_STATE.isReserving
    ) {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 2, justifyContent: 'center' }}>
          <FormLabel>メールアドレス：</FormLabel>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 3 }}>
              <FormInput
                autoCapitalize="none"
                keyboardType="email-address"
                value={this.state.riderInfo.mail}
                onChangeText={(inputValue) => {
                  this.setState({
                    riderInfo: {
                      mail: inputValue
                    }
                  });
                }}
                containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
              />
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12 }}>@stu.kanazawa-u.ac.jp</Text>
            </View>
          </View>

          {this.renderLoginButton()}

        </View>

        <View style={{ flex: 3 }}>
          <View style={{ alignItems: 'center' }}>
            <Text>もしくは新規登録はこちら</Text>
          </View>

          <View style={{ padding: 20 }}>
            <Button
              title="新規登録"
              color="white"
              buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
              onPress={() => this.props.navigation.navigate('signup')}
            />
          </View>
        </View>

      </View>
    );
  }
}


const styles = StyleSheet.create({
});



const mapStateToProps = (state) => {
  return {
    riderInfo: state.riderReducer.riderInfo,
    ownReservations: state.riderReducer.ownReservations,
    allOffers: state.riderReducer.allOffers,
    selectedOffer: state.riderReducer.selectedOffer,
  };
};


export default connect(mapStateToProps, actions)(LoginScreen);
