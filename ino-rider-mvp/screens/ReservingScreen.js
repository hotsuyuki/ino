import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Image, StatusBar, TouchableOpacity,
  LayoutAnimation, UIManager, RefreshControl, Linking, Platform, AsyncStorage,
} from 'react-native';
import { Header, Button, Icon } from 'react-native-elements';
import { AppLoading, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


// for map of start or goal place
const HONBUTOMAE = '金沢大学本部棟前';

const INITIAL_STATE = {
  // for <ScrollView />
  isRefreshing: false,
};

const FACE_IMAGE_SIZE = 60;
const FACE_IMAGE_PLACEHOLDER = '../assets/face_image_placeholder.png';
const KYASH_IMAGE_SIZE = 40;
const KYASH_IMAGE = '../assets/kyash_icon.png';

let isCancelAlertShown = null;


class ReservingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Get stored reservation info
    let stringifiedReservationInfo = await AsyncStorage.getItem('reservationInfo');
    const reservationInfo = JSON.parse(stringifiedReservationInfo);

    const isReservation = true;

    // Call action creators
    this.props.getRiderInfo();
    this.props.fetchSelectedOffer(reservationInfo.offer_id, isReservation);

    // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
    // and make `OfferListScreen` rerender by calling action creators
    this.props.fetchOwnReservations();
    this.props.fetchAllOffers();

    isCancelAlertShown = false;
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
  }


  componentDidMount() {
    // Add navigation listener of changing the StatusBar configuration
    // https://reactnavigation.org/docs/en/status-bar.html#tabnavigator
    this.navigationListener = this.props.navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('light-content');
      //isAndroid && StatusBar.setBackgroundColor('black');
    });
  }


  componentWillUnmount() {
    // Remove navigation listener of changing the StatusBar configuration
    // https://reactnavigation.org/docs/en/status-bar.html#tabnavigator
    this.navigationListener.remove();
  }


  onScrollViewRefresh = () => {
    this.setState({ isRefreshing: true });

    const isReservation = true;

    // Call action creators
    this.props.getRiderInfo();
    this.props.fetchSelectedOffer(this.props.selectedOffer.offer.id, isReservation);

    // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
    // and make `OfferListScreen` rerender by calling action creators
    this.props.fetchOwnReservations();
    this.props.fetchAllOffers();

    this.setState({ isRefreshing: false });
  }


  renderMapButton(place) {
    let mapUrl;

    switch (place) {
      case HONBUTOMAE:
        mapUrl = 'https://goo.gl/maps/xJReWgcc3au';
        break;

      default:
        // render nothing
        return <View />;
    }

    return (
      <Button
        title="地図"
        color="rgb(0,122,255)"
        buttonStyle={{ backgroundColor: 'transparent' }}
        onPress={() => {
          Alert.alert(
            '',
            `Google mapで「${place}」の場所を確認しますか？`,
            [
              { text: 'キャンセル' },
              {
                text: 'はい',
                onPress: () => Linking.openURL(mapUrl)
              },
              { cancelable: false }
            ]
          );
        }}
      />
    );
  }


  renderSmsButton() {
    // Replace first "0" with "+81" // TODO: Make it more robust
    const phone = `+81${this.props.selectedOffer.driver.phone.substring(1)}`;

    const riderInfo = this.props.riderInfo;
    let body = `[ino] ${riderInfo.major}の${riderInfo.last_name}${riderInfo.first_name}と申します。`;

    // Trim year(frist 5 characters) and second(last 3 characters),
    // and replace hyphens by slashes
    // "2018-10-04 17:00:00" ---> "10/04 17:00"
    const trimedDepartureTime = this.props.selectedOffer.offer.departure_time.substring(5, this.props.selectedOffer.offer.departure_time.length - 3).replace(/-/g, '/');

    body = `${body} ${trimedDepartureTime}の相乗りを予約させて頂きました。よろしくお願いします！`;

    return (
      <Icon
        name='comment'
        type='font-awesome'
        raised
        onPress={() => {
          Linking.openURL(Platform.OS === 'ios' ?
          `sms:${phone}&body=${body}` :
          `sms:${phone}?body=${body}`);
        }}
      />
    );
  }


  renderTelButton() {
    return (
      <Icon
        name='phone'
        type='font-awesome'
        raised
        // Replace first "0" with "+81" // TODO: Make it more robust
        onPress={() => Linking.openURL(`tel:+81${this.props.selectedOffer.driver.phone.substring(1)}`)}
      />
    );
  }


  renderReservedRiders() {
    if (this.props.selectedOffer.reserved_riders.length === 0) {
      return (
        <View style={{ padding: 10 }}>
          <Text style={styles.grayTextStyle}>予約済のライダーはまだいません</Text>
        </View>
      );
    }

    return (
      <View>
        {this.props.selectedOffer.reserved_riders.map((rider, index) => {
          return (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}
              key={index}
            >
              <View style={{ flex: 4, alignItems: 'center' }}>
                <Image
                  style={{
                    width: FACE_IMAGE_SIZE,
                    height: FACE_IMAGE_SIZE,
                    borderRadius: FACE_IMAGE_SIZE / 2
                  }}
                  source={
                    rider.image_url === '' ?
                    require(FACE_IMAGE_PLACEHOLDER) :
                    { uri: rider.image_url }
                  }
                />
              </View>
              <View style={{ flex: 12 }}>
                <Text style={styles.nameTextStyle}>{`${rider.last_name} ${rider.first_name}`}</Text>
                <Text>{`${rider.major}`}</Text>
                <Text>{`${rider.grade}`}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }


  onTipButtonPress = async () => {
    const kyashTipUrl = 'kyash://qr/u/1183086485312027642';

    const alertTitle = 'ウォレットアプリKyashをダウンロード';
    const alertBody =
    `inoではウォレットアプリKyashを使用して募金のお支払いを受け付けております。Kyashは、コンビニなどで事前にチャージすることで
    \n
    ・手数料無料の送金
    ・バーチャルVisaカード
    \n
    が簡単に使えるようになるアプリです。手数料無料の送金は友達同士の割り勘や立替え、バーチャルVisaカードはAmazonやZOZOTOWNなどでのカード払いにも使えて便利です。`;

    if (Platform.OS === 'ios') {
      // If Kyash is installed already,
      try {
        await Linking.openURL(kyashTipUrl);

        // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
        // and make `OfferListScreen` rerender by calling action creators
        this.props.fetchOwnReservations();
        this.props.fetchAllOffers();

        // Escape ReservingScreen and move back to OfferListScreen
        await AsyncStorage.removeItem('reservationInfo');
        this.props.resetSelectedOffer();
        this.props.navigation.navigate('offerList');

      // If Kyash is NOT installed yet,
      } catch (error) {
        console.error(error);
        console.log(`Cannot handle url: ${kyashTipUrl}`);

        Alert.alert(
          alertTitle,
          alertBody,
          [
            {
              text: 'App Storeへ',
              onPress: async () => {
                Linking.openURL('https://itunes.apple.com/jp/app/kyash/id1084264883?l=en&mt=8');
              },
              style: 'cancel'
            },
            { text: 'キャンセル' }
          ]
        );
      }

    // https://facebook.github.io/react-native/docs/linking#opening-external-links
    } else if (Platform.OS === 'android') {
      Linking.canOpenURL(kyashTipUrl).then(async (supported) => {
        // If Kyash is installed already,
        if (supported) {
          Linking.openURL(kyashTipUrl);

          // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
          // and make `OfferListScreen` rerender by calling action creators
          this.props.fetchOwnReservations();
          this.props.fetchAllOffers();

          // Escape ReservingScreen and move back to OfferListScreen
          await AsyncStorage.removeItem('reservationInfo');
          this.props.resetSelectedOffer();
          this.props.navigation.navigate('offerList');

        // If Kyash is NOT installed yet,
        } else {
          console.log(`Cannot handle url: ${kyashTipUrl}`);

          Alert.alert(
            alertTitle,
            alertBody,
            [
              {
                text: 'Google Playへ',
                onPress: async () => {
                  Linking.openURL('https://play.google.com/store/apps/details?id=co.kyash&hl=en');
                },
                style: 'cancel'
              },
              { text: 'キャンセル' }
            ]
          );
        }
      }).catch((error) => {
        console.error('An error occurred', error);
      });
    }
  }


  onSkipButtonPress = async () => {
    Alert.alert(
      'チップの支払いをスキップしますか？',
      'チップは任意ですが、ドライバーさん達がまた明日オファーを出すやる気に繋がります。',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: 'スキップする',
          onPress: async () => {
            // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
            // and make `OfferListScreen` rerender by calling action creators
            this.props.fetchOwnReservations();
            this.props.fetchAllOffers();

            // Escape ReservingScreen and move back to OfferListScreen
            await AsyncStorage.removeItem('reservationInfo');
            this.props.resetSelectedOffer();
            this.props.navigation.navigate('offerList');
          }
        }
      ]
    );
  }


  onCancelReservationButtonPress = () => {
    const departureTime = new Date(this.props.selectedOffer.offer.departure_time.replace(/-/g, '/'));

    // If the departure time is passed,
    // `departureTime` < `new Date()`
    if (departureTime < new Date()) {
      Alert.alert(
        '',
        '出発時刻を過ぎているのでキャンセルできません。画面を更新します。',
        [
          {
            text: 'OK',
            onPress: () => this.onScrollViewRefresh()
          }
        ]
      );

    // `new Date()` < `departureTime`
    } else {
      Alert.alert(
        '予約をキャンセルしてもよろしいですか？',
        'ドライバーには通知が行きます。',
        [
          { text: 'いいえ' },
          {
            text: 'はい',
            onPress: async () => {
              // GET corresponding reservation id
              let reservationId;
              try {
                let reservationResponse = await fetch(`https://inori.work/reservations?rider_id=${this.props.riderInfo.id}`);

                if (parseInt(reservationResponse.status / 100, 10) === 2) {
                  let reservationResponseJson = await reservationResponse.json();

                  reservationResponseJson.reservations.forEach((reservation) => {
                    if (reservation.offer_id === this.props.selectedOffer.offer.id) {
                      reservationId = reservation.id;
                    }
                  });

                // if failed to GET own reservations,
                } else if (
                  parseInt(reservationResponse.status / 100, 10) === 4 ||
                  parseInt(reservationResponse.status / 100, 10) === 5
                ) {
                  console.log('Failed to GET own reservations...');

                  Alert.alert(
                    'エラーが発生しました。',
                    '電波の良いところで後ほどお試しください。',
                    [{ text: 'OK' }]
                  );
                }

              // if cannot access reservaions api,
              } catch (error) {
                console.error(error);
                console.log('Cannot access reservations api...');

                Alert.alert(
                  'エラーが発生しました。',
                  '電波の良いところで後ほどお試しください。',
                  [{ text: 'OK' }]
                );
              }

              //console.log(`[debug] reservationId = ${reservationId}`);

              // DELETE the selected reservation
              try {
                let deleteResponse = await fetch(`https://inori.work/reservations/${reservationId}`, {
                  method: 'DELETE',
                });

                // If succeeded to DELETE the selected reservation,
                if (parseInt(deleteResponse.status / 100, 10) === 2) {
                  // Cancel the scheduled local notification
                  let stringifiedLocalNotifications = await AsyncStorage.getItem('localNotifications');
                  let localNotifications = JSON.parse(stringifiedLocalNotifications);

                  const newLocalNotifications = [];
                  localNotifications.forEach(async (eachLocalNotification) => {
                    if (eachLocalNotification.offer_id === this.props.selectedOffer.offer.id) {
                      await Notifications.cancelScheduledNotificationAsync(eachLocalNotification.local_notification_id);
                    } else {
                      newLocalNotifications.push(eachLocalNotification);
                    }
                  });

                  await AsyncStorage.setItem('localNotifications', JSON.stringify(newLocalNotifications));

                  // Reflesh `this.props.driverInfo` in `OfferListScreen`
                  // and make `OfferListScreen` rerender by calling action creators
                  this.props.fetchOwnReservations();
                  this.props.fetchAllOffers();

                  // Escape ReservingScreen and move back to OfferListScreen
                  await AsyncStorage.removeItem('reservationInfo');
                  this.props.resetSelectedOffer();
                  this.props.navigation.navigate('offerList');

                // If failed to DELETE the selected reservation,
                } else if (
                  parseInt(deleteResponse.status / 100, 10) === 4 ||
                  parseInt(deleteResponse.status / 100, 10) === 5
                ) {
                  console.log('Failed to DELETE the selected reservation...');

                  Alert.alert(
                    '予約をキャンセルできませんでした。',
                    '電波の良いところで後ほどお試しください。',
                    [{ text: 'OK' }]
                  );
                }

              // If cannot access reservaions api,
              } catch (error) {
                console.error(error);
                console.log('Cannot access reservations api...');

                Alert.alert(
                  '予約をキャンセルできませんでした。',
                  '電波の良いところで後ほどお試しください。',
                  [{ text: 'OK' }]
                );
              }
            },
            style: 'destructive'
          }
        ],
        { cancelable: false }
      );
    }
  }


  renderActionButton() {
    const departureTime = new Date(this.props.selectedOffer.offer.departure_time.replace(/-/g, '/'));

    // If the departure time is passed,
    // `departureTime` < `new Date()`
    if (departureTime < new Date()) {
      return (
        <View style={{ paddingTop: 20, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'flex-end' }}
              onPress={this.onTipButtonPress}
            >
              <Image
                style={{ width: KYASH_IMAGE_SIZE, height: KYASH_IMAGE_SIZE, borderRadius: KYASH_IMAGE_SIZE / 2 }}
                source={require(KYASH_IMAGE)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 4 }}
              onPress={this.onTipButtonPress}
            >
              <Button
                title="Kyashでチップ"
                color="white"
                buttonStyle={{ backgroundColor: 'skyblue', borderRadius: 20 }}
                onPress={this.onTipButtonPress}
              />
            </TouchableOpacity>
          </View>
          <Button
            title="スキップ"
            color="gray"
            buttonStyle={{ backgroundColor: 'transparent' }}
            onPress={this.onSkipButtonPress}
          />
        </View>
      );
    }

    return (
      <View style={{ padding: 20, backgroundColor: 'white' }}>
        <Button
          // If the departure time is passed, inactivate the button (just in case)
          disabled={departureTime < new Date()}
          title="予約をキャンセル"
          color="white"
          buttonStyle={{ backgroundColor: 'red' }}
          onPress={this.onCancelReservationButtonPress}
        />
      </View>
    );
  }


  render() {
    //console.log(`[ReservingScreen] JSON.stringify(this.props.selectedOffer) = ${JSON.stringify(this.props.selectedOffer)}`);

    // Wait to GET the selected item
    if (this.props.selectedOffer === null) {
      return <AppLoading />;
    }

    console.log(`[ReservingScreen] this.props.selectedOffer.isCanceld = ${this.props.selectedOffer.isCanceld}`);
    console.log(`[ReservingScreen] isCancelAlertShown = ${isCancelAlertShown}`);

    // If failed to reGET the selected offer,
    // (e.g. the driver has already canceled the selected offer)
    if (this.props.selectedOffer.isCanceld) {
      if (!isCancelAlertShown) {
        isCancelAlertShown = true;

        Alert.alert(
          '',
          '[ReservingScreen] このオファーは既にキャンセルされました。',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
                // and make `OfferListScreen` rerender by calling action creators
                this.props.fetchOwnReservations();
                this.props.fetchAllOffers();

                // Escape ReservingScreen and move back to OfferListScreen
                await AsyncStorage.removeItem('reservationInfo');
                console.log('[ReservingScreen] navigate(offerList)');
                this.props.resetSelectedOffer();
                this.props.navigation.navigate('offerList');
              },
            }
          ],
          { cancelable: false }
        );
      }

      return <AppLoading />;
    }

    // Trim year(frist 5 characters) and second(last 3 characters),
    // and replace hyphens by slashes
    // "2018-10-04 17:00:00" ---> "10/04 17:00"
    const trimedDepartureTime = this.props.selectedOffer.offer.departure_time.substring(5, this.props.selectedOffer.offer.departure_time.length - 3).replace(/-/g, '/');

    return (
      <View style={{ flex: 1 }}>
        <Header
          statusBarProps={{ barStyle: 'light-content' }}
          backgroundColor="black"
          centerComponent={{ text: '予約完了', style: styles.headerStyle }}
        />

        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onScrollViewRefresh}
            />
          }
        >
          <View>
            <Text style={styles.grayTextStyle}>情報</Text>

            <View style={{ paddingLeft: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ paddingLeft: 3, paddingRight: 3, justifyContent: 'center' }} >
                  <Icon name='map-marker' type='font-awesome' size={15} />
                </View>
                <Text style={styles.infoTextStyle}>{`集合：${this.props.selectedOffer.offer.start}`}</Text>
                {this.renderMapButton(this.props.selectedOffer.offer.start)}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name='flag-checkered' type='font-awesome' size={15} />
                <Text style={styles.infoTextStyle}>{`到着：${this.props.selectedOffer.offer.goal}`}</Text>
                {this.renderMapButton(this.props.selectedOffer.offer.goal)}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='timer' /*type='font-awesome'*/ size={15} />
                <Text style={styles.infoTextStyle}>{`出発時刻：${trimedDepartureTime}`}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ paddingTop: 5 }}>
                  <Icon name='car' type='font-awesome' size={15} />
                </View>
                <View>
                  <Text style={styles.infoTextStyle}>{`空席数：${this.props.selectedOffer.reserved_riders.length} / ${this.props.selectedOffer.offer.rider_capacity}人`}</Text>
                  <Text style={styles.infoTextStyle}>{`車の色：${this.props.selectedOffer.driver.car_color}`}</Text>
                  <Text style={styles.infoTextStyle}>{`ナンバー：${this.props.selectedOffer.driver.car_number}`}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>ドライバー</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 4, alignItems: 'center' }}>
                <Image
                  style={{
                    width: FACE_IMAGE_SIZE,
                    height: FACE_IMAGE_SIZE,
                    borderRadius: FACE_IMAGE_SIZE / 2
                  }}
                  source={
                    this.props.selectedOffer.driver.image_url === '' ?
                    require(FACE_IMAGE_PLACEHOLDER) :
                    { uri: this.props.selectedOffer.driver.image_url }
                  }
                />
              </View>
              <View style={{ flex: 6 }}>
                <Text style={styles.nameTextStyle}>{`${this.props.selectedOffer.driver.last_name} ${this.props.selectedOffer.driver.first_name}`}</Text>
                <Text>{`${this.props.selectedOffer.driver.major}`}</Text>
                <Text>{`${this.props.selectedOffer.driver.grade}`}</Text>
              </View>
              <View style={{ flex: 3 }}>
                {this.renderTelButton()}
              </View>
              <View style={{ flex: 3 }}>
                {this.renderSmsButton()}
              </View>
            </View>
          </View>

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>ライダー</Text>

            {this.renderReservedRiders()}

          </View>
        </ScrollView>

        {this.renderActionButton()}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  headerStyle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  grayTextStyle: {
    color: 'gray',
    padding: 10,
  },
  infoTextStyle: {
    padding: 5,
  },
  nameTextStyle: {
    paddingBottom: 5
  },
});


const mapStateToProps = (state) => {
  return {
    riderInfo: state.riderReducer.riderInfo,
    ownReservations: state.riderReducer.ownReservations,
    allOffers: state.riderReducer.allOffers,
    selectedOffer: state.riderReducer.selectedOffer,
  };
};


export default connect(mapStateToProps, actions)(ReservingScreen);
