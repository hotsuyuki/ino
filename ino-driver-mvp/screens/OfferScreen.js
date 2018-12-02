import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, RefreshControl, Picker, DatePickerIOS, Alert,
  LayoutAnimation, UIManager, Platform, Linking,
} from 'react-native';
import { Button, ButtonGroup, ListItem, Icon } from 'react-native-elements';
import { AppLoading, Permissions, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


// for TOKO
const TOKO = 0;
const VDRUG = 'Vドラッグ';
const HONBUTOMAE = '金沢大学本部棟前';

// for GEKO
const GEKO = 1;
const YAMAYA = 'やまや';

// for push notifications handler
const RESERVED_OFFER = 'reserved_offer';
const CANCELED_RESERVATION = 'canceled_reservation';
const RESERVATION_DEADLINE = 'reservation_deadline';

const INITIAL_STATE = {
  // for <ScrollView />
  isRefreshing: false,

  // for <ButtonGroup />
  togekoFlag: TOKO,

  // for <Picker />
  startPickerVisible: false,
  goalPickerVisible: false,
  departureTimePickerVisible: false,
  chosenDepartureTime: new Date(),
  riderCapacityPickerVisible: false,

  // for driver's own offers
  offerDetail: {
    start: VDRUG,
    goal: HONBUTOMAE,
    departure_time: '-/-  --:--',
    rider_capacity: '---',
  },
};


class OfferScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Call action creators
    this.props.getDriverInfo();
    this.props.fetchOwnOffers();
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
  }

  // Get push notifications token and permissions
  // https://docs.expo.io/versions/latest/guides/push-notifications
  async componentDidMount() {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app install,
      // so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // for debug
    console.log(`existingStatus = ${existingStatus}`);
    console.log(`finalStatus = ${finalStatus}`);

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let pushNotificationsToken = await Notifications.getExpoPushTokenAsync();

    // for debug
    console.log(`JSON.stringify(pushNotificationsToken) = ${JSON.stringify(pushNotificationsToken)}`);

    // POST the push notification token
    try {
      let response = await fetch('https://inori.work/tokens/push/drivers', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.props.driverInfo.id,
          token: pushNotificationsToken
        }),
      });

      // for debug
      console.log(`response.status = ${response.status}`);
      let responseJson = await response.json();
      console.log(`JSON.stringify(responseJson) = ${JSON.stringify(responseJson)}`);

      // If failed to POST the push notification token,
      if (parseInt(response.status / 100, 10) === 4 ||
          parseInt(response.status / 100, 10) === 5) {
        console.log('POSTing the push notification token failed...');

        Alert.alert(
          'プッシュ通知の設定に失敗しました。',
          '電波の良いところで後ほどアプリを再起動して下さい。',
          [
            { text: 'OK' },
          ]
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
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
  }


  handleNotification = (notification) => {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // for debug
    //console.log(`JSON.stringify(notification) = ${JSON.stringify(notification)}`);

    switch (notification.data.type) {
      // When someone reserved my offer,
      // When some reserved riders canceled thier reservation,
      // When the reservation deadline has come,
      case RESERVED_OFFER || CANCELED_RESERVATION || RESERVATION_DEADLINE:
        // If foregrounded by selecting the push notification,
        if (notification.origin === 'selected') {
          this.props.navigation.navigate('detail', {
            selectedOfferId: notification.data.offer_id,
          });
        // If received the push notification while the app is already foreground, (iOS only)
        } else if (notification.origin === 'received' && Platform.OS === 'ios') {
          Alert.alert(
            '',
            `${notification.data.message_title}`,
            [
              {
                text: 'OK',
                onPress: () => this.props.navigation.navigate('detail', {
                  selectedOfferId: notification.data.offer_id,
                }),
              }
            ],
            { cancelable: false }
          );
        }
        break;

      default:
        break;
    }
  };


  onScrollViewRefresh = async () => {
    this.setState({ isRefreshing: true });

    await this.props.fetchOwnOffers();

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
        buttonStyle={{ backgroundColor: 'transparent' /*, borderRadius: 30*/ }}
        onPress={() => {
          Alert.alert(
            '',
            'Google mapで場所を確認しますか？',
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


  renderStartPicker() {
    if (this.state.startPickerVisible) {
      if (this.state.togekoFlag === TOKO) {
        return (
          <Picker
            selectedValue={this.state.offerDetail.start}
            onValueChange={(itemValue) => this.setState({
              offerDetail: {
                ...this.state.offerDetail,
                start: itemValue
              },
            })}
          >
            <Picker.Item label={`${VDRUG}`} value={`${VDRUG}`} />
          </Picker>
        );
      } else if (this.state.togekoFlag === GEKO) {
        return (
          <Picker
            selectedValue={this.state.offerDetail.start}
            onValueChange={(itemValue) => this.setState({
              offerDetail: {
                ...this.state.offerDetail,
                start: itemValue
              },
            })}
          >
            <Picker.Item label={`${HONBUTOMAE}`} value={`${HONBUTOMAE}`} />
          </Picker>
        );
      }
    }
  }


  renderGoalPicker() {
    if (this.state.goalPickerVisible) {
      if (this.state.togekoFlag === TOKO) {
        return (
          <Picker
            selectedValue={this.state.offerDetail.goal}
            onValueChange={(itemValue) => this.setState({
              offerDetail: {
                ...this.state.offerDetail,
                goal: itemValue
              },
            })}
          >
            <Picker.Item label={`${HONBUTOMAE}`} value={`${HONBUTOMAE}`} />
          </Picker>
        );
      } else if (this.state.togekoFlag === GEKO) {
        return (
          <Picker
            selectedValue={this.state.offerDetail.goal}
            onValueChange={(itemValue) => this.setState({
              offerDetail: {
                ...this.state.offerDetail,
                goal: itemValue
              },
            })}
          >
            <Picker.Item label={`${YAMAYA}`} value={`${YAMAYA}`} />
          </Picker>
        );
      }
    }
  }


  renderDepartureTimePicker() {
    if (this.state.departureTimePickerVisible) {
      return (
        <DatePickerIOS
          mode="datetime"
          minuteInterval={15}
          date={this.state.chosenDepartureTime}
          onDateChange={(dateTime) => {
            const departureTimeText = dateTime.toLocaleString('ja');

            this.setState({
              offerDetail: {
                ...this.state.offerDetail,
                // Trim year(first 5 characters) and second(last 3 characters)
                // "2018/10/04 17:00:00" ---> "10/04 17:00"
                departure_time: departureTimeText.substring(5, departureTimeText.length - 3)
              },
              chosenDepartureTime: dateTime,
            });
          }}
        />
      );
    }
  }


  renderRiderCapacityPicker() {
    if (this.state.riderCapacityPickerVisible) {
      return (
        <Picker
          selectedValue={this.state.offerDetail.rider_capacity}
          onValueChange={(itemValue) => this.setState({
            offerDetail: {
              ...this.state.offerDetail,
              rider_capacity: itemValue
            },
          })}
        >
          <Picker.Item label="---" value="---" />
          <Picker.Item label="1人" value="1人" />
          <Picker.Item label="2人" value="2人" />
        </Picker>
      );
    }
  }


  onOfferButtonPress = () => {
    Alert.alert(
      'この内容で相乗りをオファーしますか？',
      `
      集合：${this.state.offerDetail.start} \n
      到着：${this.state.offerDetail.goal} \n
      出発時刻：${this.state.offerDetail.departure_time} \n
      空席数：${this.state.offerDetail.rider_capacity} \n
      `,
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            // Replace srashes by hyphens
            // "2018/10/04 17:00:00" ---> "2018-10-04 17:00:00"
            const replacedDepartureTime = this.state.chosenDepartureTime.toLocaleString('ja').replace(/\//g, '-');

            // Trim "人" at the last character
            const trimedRiderCapacity = parseInt(this.state.offerDetail.rider_capacity.substring(0, this.state.offerDetail.rider_capacity.length - 1));

            const offerDetail = {
              id: 0, // for convenience to the server
              driver_id: this.props.driverInfo.id,
              start: this.state.offerDetail.start,
              goal: this.state.offerDetail.goal,
              departure_time: replacedDepartureTime,
              rider_capacity: trimedRiderCapacity,
            };

            // for debug
            console.log(`JSON.stringify(offerDetail) = ${JSON.stringify(offerDetail)}`);

            // POST the new offer
            try {
              let offerResponse = await fetch('https://inori.work/offers', {
                method: 'POST',
                headers: {},
                body: JSON.stringify(offerDetail),
              });

              let offerResponseJson = await offerResponse.json();

              // Set the schedule local notification message
              const messageTitle = 'オファーした出発時刻の1時間前です。';
              const messageBody = '予約受付を締め切りました。予約したライダーさんがいるか最終確認しましょう。';
              const localNotification = {
                title: messageTitle,
                body: messageBody,
                data: {
                  type: RESERVATION_DEADLINE,
                  offer_id: offerResponseJson.id,
                  message_title: messageTitle,
                  message_body: messageBody
                },
                ios: {
                  sound: true
                }
              };

              // Set the schedule time to 1 hour earlier from the departure time
              // (same as reservation deadline)
              const schedulingTime = new Date(this.state.chosenDepartureTime.toLocaleString('ja'));
              schedulingTime.setHours(schedulingTime.getHours() - 1);

              const schedulingOptions = {
                time: schedulingTime
              };


              // Set the schedule local notification
              // TODO: Add `localNotificationId` into the corresponding offer in `this.props.ownOffers`
              // TODO: to do `Notifications.cancelScheduledNotificationAsync(localNotificationId)`
              // TODO: when the offer is canceled
              let localNotificationId = Notifications.scheduleLocalNotificationAsync(localNotification, schedulingOptions);

              // If failed to POST a new offer (create a new offer),
              if (parseInt(offerResponse.status / 100, 10) === 4 ||
                  parseInt(offerResponse.status / 100, 10) === 5) {
                console.log('Create an offer failed...');

                Alert.alert(
                  '相乗りをオファーできませんでした。',
                  '電波の良いところで後ほどお試しください。',
                  [
                    { text: 'OK' },
                  ]
                );
              }

            // If cannot access offers api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access offers api...');

              Alert.alert(
                '相乗りをオファーできませんでした。',
                '電波の良いところで後ほどお試しください。',
                [
                  { text: 'OK' },
                ]
              );
            }

            // Reset input form
            this.setState({ ...INITIAL_STATE });

            // ReGET own offers
            this.props.fetchOwnOffers();
          }
        }
      ],
      { cancelable: false }
    );
  }


  renderOfferButton() {
    // `this.state.offerDetail` is completed or not
    let isCompleted = false;
    // If both `departure_time` and `rider_capacity` are NOT default value,
    if (this.state.offerDetail.departure_time !== INITIAL_STATE.offerDetail.departure_time &&
        this.state.offerDetail.rider_capacity !== INITIAL_STATE.offerDetail.rider_capacity) {
      isCompleted = true;
    }

    const offerButtonTitle = '相乗りをオファー';

    // If all pickers are closed and `this.state.offerDetail` is completed,
    if (!this.state.startPickerVisible &&
        !this.state.goalPickerVisible &&
        !this.state.departureTimePickerVisible &&
        !this.state.riderCapacityPickerVisible &&
        isCompleted) {
      return (
        // Activate the offer button
        <View style={{ padding: 20 }}>
          <Button
            title={offerButtonTitle}
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onOfferButtonPress}
          />
        </View>
      );
    }

    return (
      <View style={{ padding: 20 }}>
        <Button
          title={offerButtonTitle}
          color="white"
        />
      </View>
    );
  }


  onListItemPress = (selectedItem) => {
    // Nvigate to `DetailScreen` with params
    this.props.navigation.navigate('detail', {
      selectedOfferId: selectedItem.offer.id,
    });
  }


  renderOwnOffers() {
    // for debug
    console.log(`this.props.ownOffers.length = ${this.props.ownOffers.length}`);

    // TODO: Search whole departure time in the array whether it's passed the disappearing time or not
    if (this.props.ownOffers.length === 0) {
      return (
        <View style={{ padding: 10 }}>
          <Text style={styles.grayTextStyle}>オファー中の相乗りはまだありません</Text>
        </View>
      );
    }

    return (
      <View>
        {this.props.ownOffers.map((item, index) => {
          // Set the disappearing time to 1 hour later from the departure time
          const disappearingTime = new Date(item.offer.departure_time.replace(/-/g, '/'));
          disappearingTime.setHours(disappearingTime.getHours() + 1);

          // If the disappearing time is passed,
          if (disappearingTime < new Date()) {
            // render nothing
            return <View key={index} />;
          }

          // Trim year(frist 5 characters) and second(last 3 characters),
          // and replace hyphens by slashes
          // "2018-10-04 17:00:00" ---> "10/04 17:00"
          const trimedDepartureTime = item.offer.departure_time.substring(5, item.offer.departure_time.length - 3).replace(/-/g, '/');

          return (
            <ListItem
              key={index}
              title={
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                  <View style={{ flex: 3, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Icon name='person' />
                    <Text>{`${item.driver.last_name} ${item.driver.first_name}`}</Text>
                  </View>

                  <View style={{ flex: 7, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ paddingLeft: 3, paddingRight: 3, justifyContent: 'center' }} >
                        <Icon name='map-marker' type='font-awesome' size={10} />
                      </View>
                      <Text numberOfLines={1} style={{ paddingLeft: 5 }}>{`${item.offer.start}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name='flag-checkered' type='font-awesome' size={10} />
                      <Text numberOfLines={1} style={{ paddingLeft: 5 }}>{`${item.offer.goal}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Icon name='timer' /*type='font-awesome'*/ size={10} />
                        <Text numberOfLines={1} style={{ paddingLeft: 5 }}>{`${trimedDepartureTime}`}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
                        <Icon name='car' type='font-awesome' size={10} />
                        <Text numberOfLines={1} style={{ paddingLeft: 5 }}>{`${item.reserved_riders.length} / ${item.offer.rider_capacity}人`}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              }
              onPress={() => this.onListItemPress(item)}
            />
          );
        })}
      </View>
    );
  }


  render() {
    // for debug
    console.log(`(typeof this.props.driverInfo.id) = ${(typeof this.props.driverInfo.id)}`);
    console.log(`_.isNull(this.props.ownOffers) = ${_.isNull(this.props.ownOffers)}`);

    // Wait to fetch own rider info, own reservations, and all offers
    if ((typeof this.props.driverInfo.id) === 'undefined' ||
        _.isNull(this.props.ownOffers)) {
      return <AppLoading />;
    }

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

          // Start picker
          <ListItem
            title={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ paddingLeft: 3, paddingRight: 3, justifyContent: 'center' }} >
                  <Icon name='map-marker' type='font-awesome' color='gray' size={15} />
                </View>
                <Text style={styles.grayTextStyle}>集合：</Text>
                <Text numberOfLines={1}>{this.state.offerDetail.start}</Text>
                {this.renderMapButton(this.state.offerDetail.start)}
              </View>
            }
            rightIcon={
              !this.state.startPickerVisible ?
              { name: 'keyboard-arrow-down' } :
              { name: 'check', color: 'rgb(0,122,255)' }
            }
            onPress={() => this.setState({
              startPickerVisible: !this.state.startPickerVisible,
              goalPickerVisible: false,
              departureTimePickerVisible: false,
              riderCapacityPickerVisible: false,
            })}
          />

          {this.renderStartPicker()}

          // Goal picker
          <ListItem
            title={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name='flag-checkered' type='font-awesome' color='gray' size={15} />
                <Text style={styles.grayTextStyle}>到着：</Text>
                <Text numberOfLines={1}>{this.state.offerDetail.goal}</Text>
                {this.renderMapButton(this.state.offerDetail.goal)}
              </View>
            }
            rightIcon={
              !this.state.goalPickerVisible ?
              { name: 'keyboard-arrow-down' } :
              { name: 'check', color: 'rgb(0,122,255)' }
            }
            onPress={() => this.setState({
              startPickerVisible: false,
              goalPickerVisible: !this.state.goalPickerVisible,
              departureTimePickerVisible: false,
              riderCapacityPickerVisible: false,
            })}
          />

          {this.renderGoalPicker()}

          <ButtonGroup
            buttons={['登校', '下校']}
            selectedIndex={this.state.togekoFlag}
            onPress={(selectedIndex) =>
              this.setState({
                togekoFlag: selectedIndex,
                offerDetail: {
                  ...this.state.offerDetail,
                  start: selectedIndex === TOKO ? VDRUG : HONBUTOMAE,
                  goal: selectedIndex === TOKO ? HONBUTOMAE : YAMAYA,
                }
              })
            }
            selectedButtonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            selectedTextStyle={{ color: 'white' }}
          />

          // Departure time picker
          <View style={{ flexDirection: 'row' }}>
            // Departure time picker
            <View style={{ flex: 1 }}>
              <ListItem
                title={
                  <View style={{ flexDirection: 'row' }}>
                    <Icon name='timer' /*type='font-awesome'*/ color='gray' size={15} />
                    <Text style={styles.grayTextStyle}>出発時刻：</Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text
                      style={{
                        color: this.state.offerDetail.departure_time === INITIAL_STATE.offerDetail.departure_time ? 'gray' : 'black'
                      }}
                    >
                      {this.state.offerDetail.departure_time}
                    </Text>
                  </View>

                }
                rightIcon={
                  !this.state.departureTimePickerVisible ?
                  { name: 'keyboard-arrow-down' } :
                  { name: 'check', color: 'rgb(0,122,255)' }
                }
                onPress={() => this.setState({
                  startPickerVisible: false,
                  goalPickerVisible: false,
                  departureTimePickerVisible: !this.state.departureTimePickerVisible,
                  riderCapacityPickerVisible: false,
                })}
              />
            </View>

            // Rider capacity picker
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <ListItem
                title={
                  <View style={{ flexDirection: 'row' }}>
                    <Icon name='car' type='font-awesome' color='gray' size={15} />
                    <Text style={styles.grayTextStyle}>空席数：</Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text
                      style={{
                        color: this.state.offerDetail.rider_capacity === INITIAL_STATE.offerDetail.rider_capacity ? 'gray' : 'black'
                      }}
                    >
                      {this.state.offerDetail.rider_capacity}
                    </Text>
                  </View>
                }
                rightIcon={
                  !this.state.riderCapacityPickerVisible ?
                  { name: 'keyboard-arrow-down' } :
                  { name: 'check', color: 'rgb(0,122,255)' }
                }
                onPress={() => this.setState({
                  startPickerVisible: false,
                  goalPickerVisible: false,
                  departureTimePickerVisible: false,
                  riderCapacityPickerVisible: !this.state.riderCapacityPickerVisible,
                })}
              />
            </View>
          </View>

          {this.renderDepartureTimePicker()}

          {this.renderRiderCapacityPicker()}

          {this.renderOfferButton()}

          <Text style={styles.grayTextStyle}>オファー中</Text>

          {this.renderOwnOffers()}

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  grayTextStyle: {
    color: 'gray',
    padding: 10
  },
  listItemStyle: {
    paddingTop: 5,
    paddingLeft: 20
  },
});


const mapStateToProps = (state) => {
  return {
    driverInfo: state.driverReducer.driverInfo,
    ownOffers: state.driverReducer.ownOffers
  };
};


export default connect(mapStateToProps, actions)(OfferScreen);
