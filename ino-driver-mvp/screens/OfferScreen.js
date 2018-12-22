import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Picker, DatePickerIOS, Alert,
  LayoutAnimation, UIManager, Platform, Linking, AsyncStorage,
} from 'react-native';
import { Button, ButtonGroup, ListItem, Icon, FormValidationMessage } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import { AppLoading, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


// for push notifications handler
const RESERVATION_DEADLINE = 'reservation_deadline';

// for TOKO
const TOKO = 0;
const VDRUG = 'Vドラッグ';
const HONBUTOMAE = '金沢大学本部棟前';

// for GEKO
const GEKO = 1;
//const HONBUTOMAE = '金沢大学本部棟前';
const YAMAYA = 'やまや';

// for form validation
const formValidation = {
  isDepartureTimeValid: null,
};

const INITIAL_STATE = {
  // for <ButtonGroup />
  togekoFlag: TOKO,

  // for <Picker />
  startPickerVisible: false,
  goalPickerVisible: false,
  departureTimePickerVisible: false,
  chosenDepartureTime: new Date().toLocaleString('ja'),
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
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
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


  renderDepartureTimeValid() {
    // Set the reservation deadline time to 1 hour earlier from the departure time
    const reservationDeadline = new Date(this.state.chosenDepartureTime);
    //reservationDeadline.setHours(reservationDeadline.getHours() - 1);
    reservationDeadline.setMinutes(reservationDeadline.getMinutes() - 30);

    if (this.state.offerDetail.departure_time !== INITIAL_STATE.offerDetail.departure_time) {
      if (new Date() < reservationDeadline) {
        formValidation.isDepartureTimeValid = true;
        return;
      }

      formValidation.isDepartureTimeValid = false;
      return (
        //<FormValidationMessage>1時間後以降の時刻を指定して下さい</FormValidationMessage>
        <FormValidationMessage>30分後以降の時刻を指定して下さい</FormValidationMessage>
      );
    }
  }


  renderDepartureTimePicker() {
    if (this.state.departureTimePickerVisible) {
      // Set the available departure time to 1 hour later from the current time
      const availavleDepartureTime = new Date();
      //availavleDepartureTime.setHours(availavleDepartureTime.getHours() + 1);
      availavleDepartureTime.setMinutes(availavleDepartureTime.getMinutes() + 30);

      if (Platform.OS === 'ios') {
        return (
          <DatePickerIOS
            mode="datetime"
            minuteInterval={15}
            minimumDate={availavleDepartureTime}
            date={new Date(this.state.chosenDepartureTime)}
            onDateChange={(dateTime) => {
              // `dateTime` = "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)"
              //console.log(`[iOS] dateTime = ${dateTime}`);

              // "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)" ---> "2018/10/04 17:00:00"
              const departureTimeText = dateTime.toLocaleString('ja');

              this.setState({
                offerDetail: {
                  ...this.state.offerDetail,
                  // Trim year (first 5 characters) and second (last 3 characters)
                  // "2018/10/04 17:00:00" ---> "10/04 17:00"
                  departure_time: departureTimeText.substring(5, departureTimeText.length - 3)
                },
                chosenDepartureTime: departureTimeText,
              });
            }}
          />
        );
      } else if (Platform.OS === 'android') {
        return (
          <View style={{ flex: 1, flexDirection: 'row' }} >
            <View style={{ flex: 1, alignItems: 'center' }}>
              <DatePicker
                mode="datetime"
                date={new Date(this.state.chosenDepartureTime)}
                format="YYYY-MM-DD HH:mm"
                is24Hour
                minDate={availavleDepartureTime}
                confirmBtnText="OK"
                cancelBtnText="キャンセル"
                onDateChange={(dateTime) => {
                  // `dateTime` = "2018-10-04 17:00"
                  //console.log(`[Android] dateTime = ${dateTime}`);

                  // Add second (last 3 characters)
                  // "2018-10-04 17:00" ---> "2018-10-04 17:00:00"
                  const departureTime = `${dateTime}:00`;

                  // Replace hyphens by slashes
                  // "2018-10-04 17:00:00" ---> "2018/10/04 17:00:00"
                  const departureTimeText = departureTime.replace(/-/g, '/');

                  this.setState({
                    offerDetail: {
                      ...this.state.offerDetail,
                      // Trim year (first 5 characters) and second (last 3 characters)
                      // "2018/10/04 17:00:00" ---> "10/04 17:00"
                      departure_time: departureTimeText.substring(5, departureTimeText.length - 3)
                    },
                    chosenDepartureTime: departureTimeText,
                  });
                }}
              />
            </View>

            <View style={{ flex: 1 }} />
          </View>
        );
      }
    }
  }


  renderRiderCapacityPicker() {
    if (this.state.riderCapacityPickerVisible) {
      return (
        <View style={{ flex: 1, flexDirection: 'row' }} >
          <View style={{ flex: 1 }} />

          <View style={{ flex: 1 }}>
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
          </View>
        </View>
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
            // "Thu Oct 04 2018 17:00:00 GMT+0900 (JST)" ---> "2018/10/04 17:00:00" ---> "2018-10-04 17:00:00"
            const replacedDepartureTime = this.state.chosenDepartureTime.replace(/\//g, '-');

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
            //console.log(`JSON.stringify(offerDetail) = ${JSON.stringify(offerDetail)}`);

            // POST the new offer
            try {
              let offerResponse = await fetch('https://inori.work/offers', {
                method: 'POST',
                headers: {},
                body: JSON.stringify(offerDetail),
              });

              let offerResponseJson = await offerResponse.json();

              // Set the schedule local notification message
              //const messageTitle = 'オファーした出発時刻の1時間前です。';
              const messageTitle = 'オファーした出発時刻の30分前です。';
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
              const schedulingTime = new Date(this.state.chosenDepartureTime);
              //schedulingTime.setHours(schedulingTime.getHours() - 1);
              schedulingTime.setMinutes(schedulingTime.getMinutes() - 30);
              const schedulingOptions = {
                time: schedulingTime
              };

              // Set the schedule local notification
              let localNotificationId = await Notifications.scheduleLocalNotificationAsync(localNotification, schedulingOptions);

              // Add to local notifications list in order to cancel the local notification when canceling the offer
              let stringifiedLocalNotifications = await AsyncStorage.getItem('localNotifications');
              let localNotifications = JSON.parse(stringifiedLocalNotifications);
              localNotifications.push({
                offer_id: offerResponseJson.id,
                local_notification_id: localNotificationId
              });

              // for debug
              //console.log(`JSON.stringify(localNotifications) = ${JSON.stringify(localNotifications)}`);

              await AsyncStorage.setItem('localNotifications', JSON.stringify(localNotifications));

              // If failed to POST a new offer (create a new offer),
              if (parseInt(offerResponse.status / 100, 10) === 4 ||
                  parseInt(offerResponse.status / 100, 10) === 5) {
                console.log('Failed to create an offer...');

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

            // Reflesh `this.props.ownOffers` and `this.props.allOffers` in `OfferListScreen`
            // and make `OfferListScreen` rerender by calling an action creator
            this.props.fetchOwnOffers();
            this.props.fetchAllOffers();
            this.props.navigation.pop();
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
        this.state.offerDetail.rider_capacity !== INITIAL_STATE.offerDetail.rider_capacity &&
        formValidation.isDepartureTimeValid) {
      isCompleted = true;
    }

    return (
      // Activate the offer button
      <View style={{ padding: 20 }}>
        <Button
          // If one of all pickers is opend or `this.state.offerDetail` is not completed,
          // inactivate the button
          disabled={
            this.state.startPickerVisible ||
            this.state.goalPickerVisible ||
            this.state.departureTimePickerVisible ||
            this.state.riderCapacityPickerVisible ||
            !isCompleted
          }
          title="相乗りをオファー"
          color="white"
          buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
          onPress={this.onOfferButtonPress}
        />
      </View>
    );
  }


  render() {
    // for debug
    //console.log(`(typeof this.props.driverInfo.id) = ${(typeof this.props.driverInfo.id)}`);

    // Wait to fetch own driver info
    if ((typeof this.props.driverInfo.id) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
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

          <View style={{ flexDirection: 'row' }}>
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

          {this.renderDepartureTimeValid()}

          {this.renderDepartureTimePicker()}

          {this.renderRiderCapacityPicker()}

          {this.renderOfferButton()}
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
