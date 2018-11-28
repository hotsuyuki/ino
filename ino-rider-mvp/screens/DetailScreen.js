import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
  LayoutAnimation, UIManager, RefreshControl, Linking, Platform,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { AppLoading, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const INITIAL_STATE = {
  // for <ScrollView />
  isRefreshing: false,

  // for Alert
  isCanceld: false,

  // for selected item,
  selectedItem: {
    driver: {},
    offer: {},
    reserved_riders: [],
  },
};

let isCancelAlertShown;


class DetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // This is not an acntion creator
    // Just GET the offer info from the server and store into `this.state`
    this.fetchSelectedOffer();

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


  async fetchSelectedOffer() {
    // The params passed from the previous page
    const selectedOfferId = this.props.navigation.getParam('selectedOfferId', 'default_value');

    // ReGET the selected item
    try {
      let offerResponse = await fetch(`https://inori.work/offers/${selectedOfferId}`);

      // If succeed to reGET the selected offer,
      if (parseInt(offerResponse.status / 100, 10) === 2) {
        let offerResponseJson = await offerResponse.json();
        const selectedItem = offerResponseJson;
        /**********************************
        selectedItem: {
          offer: {
            id:,
            driver_id:,
            start:,
            goal:,
            departure_time:,
            rider_capacity:
          },
          reserved_riders: [`id1`, `id2`, ...]
        }
        **********************************/

        // GET corresponding driver info
        try {
          let driverResponse = await fetch(`https://inori.work/drivers/${selectedItem.offer.driver_id}`);

          if (parseInt(driverResponse.status / 100, 10) === 2) {
            let driverResponseJson = await driverResponse.json();

            selectedItem.driver = driverResponseJson.driver;
            /**********************************
            selectedItem: {
              driver:{
                id:,
                first_name:,
                last_name:,
                grade:,
                major:,
                mail:,
                phone:,
                car_color:,
                car_number:
              },
              offer: {
                id:,
                driver_id:,
                start:,
                goal:,
                departure_time:,
                rider_capacity:
              },
              reserved_riders: [`id1`, `id2`, ...]
            }
            **********************************/

            // GET corresponding reserved riders info
            const reservedRidersInfo = [];

            const promiseArray = selectedItem.reserved_riders.map(async (reservedRiderId) => {
              try {
                let riderResponse = await fetch(`https://inori.work/riders/${reservedRiderId}`);

                if (parseInt(riderResponse.status / 100, 10) === 2) {
                  let riderResponseJson = await riderResponse.json();

                  reservedRidersInfo.push(riderResponseJson.rider);

                // if failed to GET reserved rider info
                } else if (parseInt(riderResponse.status / 100, 10) === 4 ||
                           parseInt(riderResponse.status / 100, 10) === 5) {
                  Alert.alert(
                    'エラーが発生しました。',
                    '電波の良いところで後ほどお試しください。',
                    [
                      { text: 'OK' },
                    ]
                  );
                }

              // If cannot access riders api,
              } catch (error) {
                console.error(error);
                console.log('Cannot access riders api...');

                Alert.alert(
                  'エラーが発生しました。',
                  '電波の良いところで後ほどお試しください。',
                  [
                    { text: 'OK' },
                  ]
                );
              }
            });

            await Promise.all(promiseArray);

            selectedItem.reserved_riders = reservedRidersInfo;
            /**********************************
            selectedItem: {
              driver:{
                id:,
                first_name:,
                last_name:,
                grade:,
                major:,
                mail:,
                phone:,
                car_color:,
                car_number:
              },
              offer: {
                id:,
                driver_id:,
                start:,
                goal:,
                departure_time:,
                rider_capacity:
              },
              reserved_riders: [
                {
                  id: `id1`,
                  first_name:,
                  last_name:,
                  grade:,
                  major:,
                  mail:,
                  phone:
                },
                {
                  id: `id2`,
                  first_name:,
                  last_name:,
                  grade:,
                  major:,
                  mail:,
                  phone:
                },
                ...
              ]
            }
            **********************************/

            this.setState({
              isCanceld: false,
              selectedItem,
            });

          // if failed to GET the corresponding driver info
          } else if (parseInt(driverResponse.status / 100, 10) === 4 ||
                     parseInt(driverResponse.status / 100, 10) === 5) {
            Alert.alert(
              'エラーが発生しました。',
              '電波の良いところで後ほどお試しください。',
              [
                { text: 'OK' },
              ]
            );
          }

        // If cannot access drivers api,
        } catch (error) {
          console.error(error);
          console.log('Cannot access drivers api...');
        }

      // If failed to reGET the selected offer,
      // (e.g. the driver has already canceled the selected offer)
      } else if (parseInt(offerResponse.status / 100, 10) === 4 ||
                 parseInt(offerResponse.status / 100, 10) === 5) {
        console.log('Failed to reGET the selected offer...');

        this.setState({
          isCanceld: true,
          selectedItem: INITIAL_STATE.selectedItem,
        });
      }

    // If cannot access offers api,
    } catch (error) {
      console.error(error);
      console.log('Cannot access offers api...');
    }
  }


  onScrollViewRefresh = () => {
    this.setState({ isRefreshing: true });

    // This is not an acntion creator
    // Just GET the offer info from the server and store into `this.state`
    this.fetchSelectedOffer();

    // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
    // and make `OfferListScreen` rerender by calling action creators
    this.props.fetchOwnReservations();
    this.props.fetchAllOffers();

    this.setState({ isRefreshing: false });
  }


  renderSmsButton() {
    // The params passed from the previous page
    const isReservation = this.props.navigation.getParam('isReservation', 'default_value');

    // Replace first "0" with "+81" // TODO: Make it more robust
    const phone = `+81${this.state.selectedItem.driver.phone.substring(1)}`;

    const riderInfo = this.props.riderInfo;
    let body = `[ino] こんにちは！${riderInfo.major} ${riderInfo.grade}の${riderInfo.last_name}${riderInfo.first_name}と申します。`;

    // Trim year(frist 5 characters) and second(last 3 characters),
    // and replace hyphens by slashes
    // "2018-10-04 17:00:00" ---> "10/04 17:00"
    const trimedDepartureTime = this.state.selectedItem.offer.departure_time.substring(5, this.state.selectedItem.offer.departure_time.length - 3).replace(/-/g, '/');

    if (isReservation) {
      body = `${body} ${trimedDepartureTime}の相乗りを予約させて頂きました。よろしくお願いします！`;
    } else {
      body = `${body} ${trimedDepartureTime}の相乗りについてですが、`;
    }

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
    // The params passed from the previous page
    const isReservation = this.props.navigation.getParam('isReservation', 'default_value');

    if (isReservation) {
      return (
        <Icon
          name='phone'
          type='font-awesome'
          raised
          // Replace first "0" with "+81" // TODO: Make it more robust
          onPress={() => Linking.openURL(`tel:+81${this.state.selectedItem.driver.phone.substring(1)}`)}
        />
      );
    }
  }


  onReserveOfferButtonPress = () => {
    Alert.alert(
      '',
      '相乗りを予約しますか？',
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            // The params passed from the previous page
            const selectedOfferId = this.props.navigation.getParam('selectedOfferId', 'default_value');
            const riderId = this.props.navigation.getParam('riderId', 'default_value');

            const reserveOfferBody = {
              id: 0,
              offer_id: selectedOfferId,
              departure_time: this.state.selectedItem.offer.departure_time,
              rider_id: riderId
            };

            // POST new reservation
            try {
              let response = await fetch('https://inori.work/reservations', {
                method: 'POST',
                headers: {},
                body: JSON.stringify(reserveOfferBody),
              });

              // for debug
              console.log(`JSON.stringify(reserveOfferBody) = ${JSON.stringify(reserveOfferBody)}`);
              console.log(`response.status = ${response.status}`);
              let responseJson = await response.json();
              console.log(`JSON.stringify(responseJson) = ${JSON.stringify(responseJson)}`);

              // If failed to DELETE the selected offer,
              if (parseInt(response.status / 100, 10) === 4 ||
                  parseInt(response.status / 100, 10) === 5) {
                console.log('Failed to DELETE the selected offer...');

                Alert.alert(
                  '相乗りを予約できませんでした。',
                  '電波の良いところで後ほどお試しください。',
                  [
                    { text: 'OK' },
                  ]
                );
              }

            // If cannot access reservations api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access reservations api...');

              Alert.alert(
                '相乗りを予約できませんでした。',
                '電波の良いところで後ほどお試しください。',
                [
                  { text: 'OK' },
                ]
              );
            }

            // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
            // and make `OfferListScreen` rerender by calling action creators
            this.props.fetchOwnReservations();
            this.props.fetchAllOffers();
            this.props.navigation.pop();
          },
        }
      ],
      { cancelable: false }
    );
  }

  onDonateButtonPress = async () => {
    const donateUrl = 'kyash://qr/u/1183086485312027642';

    try {
      await Linking.openURL(donateUrl);

    // If cannot open the url,
    } catch (error) {
      console.error(error);
      console.log('Cannot open the url...');

      Alert.alert(
        'ウォレットアプリKyashをダウンロード',
        `inoではウォレットアプリKyashを使用して募金のお支払いを受け付けております。Kyashは、コンビニなどで事前にチャージすることで
        \n
        ・手数料無料の送金
        ・バーチャルVisaカード
        \n
        が簡単に使えるようになるアプリです。手数料無料の送金は友達同士の割り勘や立替え、バーチャルVisaカードはAmazonやZOZOTOWNなどでのカード払いにも使えて便利です。`,
        [
          {
            text: Platform.OS === 'ios' ? 'App Storeへ' : 'Google Playへ',
            onPress: async () => {
              const kyashDownloadUrl = Platform.OS === 'ios' ?
              'https://itunes.apple.com/jp/app/kyash/id1084264883?l=en&mt=8' :
              'https://play.google.com/store/apps/details?id=co.kyash&hl=en';

              return Linking.openURL(kyashDownloadUrl);
            },
            style: 'cancel'
          },
          { text: 'キャンセル' }
        ]
      );
    }
  }

  onCancelReservationButtonPress = () => {
    Alert.alert(
      '予約をキャンセルしてもよろしいですか？',
      'ドライバーには通知が行きます。',
      [
        { text: 'いいえ' },
        {
          text: 'はい',
          onPress: async () => {
            // The params passed from the previous page
            const riderId = this.props.navigation.getParam('riderId', 'default_value');
            const selectedOfferId = this.props.navigation.getParam('selectedOfferId', 'default_value');

            // GET corresponding reservation id
            let reservationId;
            try {
              let reservationResponse = await fetch(`https://inori.work/reservations?rider_id=${riderId}`);

              if (parseInt(reservationResponse.status / 100, 10) === 2) {
                let reservationResponseJson = await reservationResponse.json();

                reservationResponseJson.reservations.forEach((reservation) => {
                  if (reservation.offer_id === selectedOfferId) {
                    reservationId = reservation.id;
                  }
                });

              // if failed to GET own reservations,
              } else if (parseInt(reservationResponse.status / 100, 10) === 4 ||
                         parseInt(reservationResponse.status / 100, 10) === 5) {
                console.log('Failed to GET own reservations...');

                Alert.alert(
                  'エラーが発生しました。',
                  '電波の良いところで後ほどお試しください。',
                  [
                    { text: 'OK' },
                  ]
                );
              }

            // if cannot access reservaions api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access reservations api...');

              Alert.alert(
                'エラーが発生しました。',
                '電波の良いところで後ほどお試しください。',
                [
                  { text: 'OK' },
                ]
              );
            }

            // for debug
            //console.log(`reservationId = ${reservationId}`);

            // DELETE the selected reservation
            try {
              let deleteResponse = await fetch(`https://inori.work/reservations/${reservationId}`, {
                method: 'DELETE',
                //headers: {},
                //body: {},
              });

              // for debug
              console.log(`deleteResponse.status = ${deleteResponse.status}`);
              let deleteResponseJson = await deleteResponse.json();
              console.log(`JSON.stringify(deleteResponseJson) = ${JSON.stringify(deleteResponseJson)}`);

              // If failed to DELETE the selected reservation,
              if (parseInt(deleteResponse.status / 100, 10) === 4 ||
                  parseInt(deleteResponse.status / 100, 10) === 5) {
                console.log('Failed to DELETE the selected reservation...');

                Alert.alert(
                  '予約をキャンセルできませんでした。',
                  '電波の良いところで後ほどお試しください。',
                  [
                    { text: 'OK' },
                  ]
                );
              }

            // if cannot access reservaions api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access reservations api...');

              Alert.alert(
                '予約をキャンセルできませんでした。',
                '電波の良いところで後ほどお試しください。',
                [
                  { text: 'OK' },
                ]
              );
            }

            // Reflesh `this.props.driverInfo` in `OfferListScreen`
            // and make `OfferListScreen` rerender by calling action creators
            this.props.fetchOwnReservations();
            this.props.fetchAllOffers();
            this.props.navigation.pop();
          },
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  }


  renderReservedRiders() {
    if (this.state.selectedItem.reserved_riders.length === 0) {
      return (
        <View style={{ padding: 10 }}>
          <Text style={styles.grayTextStyle}>予約済のライダーはまだいません</Text>
        </View>
      );
    }

    return (
      <View>
        {this.state.selectedItem.reserved_riders.map((rider, index) => {
          return (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}
              key={index}
            >
              <View style={{ flex: 1 }}>
                <Icon name='person' />
              </View>
              <View style={{ flex: 4 }}>
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


  renderActionButton() {
    // The params passed from the previous page
    const isReservation = this.props.navigation.getParam('isReservation', 'default_value');

    // Set the reservation deadline time to 1 hour earlyer from the departure time
    const reservationDeadline = new Date(this.state.selectedItem.offer.departure_time.replace(/-/g, '/'));
    reservationDeadline.setHours(reservationDeadline.getHours() - 1);

    // If it is Offer
    if (!isReservation) {
      return (
        <View style={{ padding: 20 }}>
          <Button
            // When the offer is full and before the deadline,
            // prevent from reserving (inactivate the button) just in case
            disabled={
              this.state.selectedItem.reserved_riders.length === this.state.selectedItem.offer.rider_capacity ||
              reservationDeadline < new Date()
            }
            title="相乗りオファーを予約"
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onReserveOfferButtonPress}
          />
        </View>
      );

    // If it is Reservation
    } else if (isReservation) {
      // Set the estimated arrival time to 1 hour later from the departure time
      const estimatedArrivalTime = new Date(this.state.selectedItem.offer.departure_time.replace(/-/g, '/'));
      estimatedArrivalTime.setHours(estimatedArrivalTime.getHours() + 1);

      // Set the disappearing time to 12 hour later from the departure time
      const disappearingTime = new Date(item.offer.departure_time.replace(/-/g, '/'));
      disappearingTime.setHours(disappearingTime.getHours() + 12);

      // If the carpool is arrived,
      if (estimatedArrivalTime < new Date()) {
        return (
          <View style={{ padding: 20 }}>
            <Button
              // If the disappearing time is passed, inactivate the button (just in case)
              disabled={disappearingTime < new Date()}
              //icon={<Image source={{ uri: '../assets/kyash_icon.png' }} />}
              title="Kyashで募金する"
              color="skyblue"
              buttonStyle={{ backgroundColor: 'white', borderRadius: 30 }}
              onPress={this.onDonateButtonPress}
            />
          </View>
        );
      }

      return (
        <View style={{ padding: 20 }}>
          <Button
            title="予約をキャンセル"
            color="white"
            buttonStyle={{ backgroundColor: 'red' }}
            onPress={this.onCancelReservationButtonPress}
          />
        </View>
      );
    }
  }


  render() {
    // If failed to reGET the selected offer,
    // (e.g. the driver has already canceled the selected offer)
    if (this.state.isCanceld && !isCancelAlertShown) {
      isCancelAlertShown = true;

      Alert.alert(
        '',
        'このオファーは既にキャンセルされました。',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reflesh `this.props.ownReservations` and `this.props.allOffers` in `OfferListScreen`
              // and make `OfferListScreen` rerender by calling action creators
              this.props.fetchOwnReservations();
              this.props.fetchAllOffers();
              this.props.navigation.pop();
            },
          }
        ],
        { cancelable: false }
      );

      return <AppLoading />;
    }

    // Wait to reGET the selected item
    if (this.state.selectedItem === INITIAL_STATE.selectedItem) {
      return <AppLoading />;
    }

    // Trim year(frist 5 characters) and second(last 3 characters),
    // and replace hyphens by slashes
    // "2018-10-04 17:00:00" ---> "10/04 17:00"
    const trimedDepartureTime = this.state.selectedItem.offer.departure_time.substring(5, this.state.selectedItem.offer.departure_time.length - 3).replace(/-/g, '/');

    return (
      <View style={{ flex: 1 }}>
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
              <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingLeft: 3, paddingRight: 3, justifyContent: 'center' }} >
                  <Icon name='map-marker' type='font-awesome' size={15} />
                </View>
                <Text style={styles.infoTextStyle}>{`集合：${this.state.selectedItem.offer.start}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='flag-checkered' type='font-awesome' size={15} />
                <Text style={styles.infoTextStyle}>{`到着：${this.state.selectedItem.offer.goal}`}</Text>
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
                  <Text style={styles.infoTextStyle}>{`空席数：${this.state.selectedItem.reserved_riders.length} / ${this.state.selectedItem.offer.rider_capacity}人`}</Text>
                  <Text style={styles.infoTextStyle}>{`車の色：${this.state.selectedItem.driver.car_color}`}</Text>
                  <Text style={styles.infoTextStyle}>{`ナンバー：${this.state.selectedItem.driver.car_number}`}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>ドライバー</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Icon name='person' />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.nameTextStyle}>{`${this.state.selectedItem.driver.last_name} ${this.state.selectedItem.driver.first_name}`}</Text>
                <Text>{`${this.state.selectedItem.driver.major}`}</Text>
                <Text>{`${this.state.selectedItem.driver.grade}`}</Text>
              </View>
              <View style={{ flex: 1 }}>
                {this.renderTelButton()}
              </View>
              <View style={{ flex: 1 }}>
                {this.renderSmsButton()}
              </View>
            </View>
          </View>

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>ライダー</Text>

            {this.renderReservedRiders()}

          </View>

          {this.renderActionButton()}

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
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
    allOffers: state.riderReducer.allOffers
  };
};


export default connect(mapStateToProps, actions)(DetailScreen);
