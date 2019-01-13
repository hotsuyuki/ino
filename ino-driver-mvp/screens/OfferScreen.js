import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Picker, DatePickerIOS, Alert,
  LayoutAnimation, UIManager, Platform, Linking, AsyncStorage,
} from 'react-native';
import { Button, ButtonGroup, ListItem, Icon, FormValidationMessage } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import PureChart from 'react-native-pure-chart';
import { AppLoading, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


// for push notifications handler
const RESERVATION_DEADLINE = 'reservation_deadline';

// for data of <PureChart />
const DUMMY = ' ';

const SUN = 0;
const MON = 1;
const TUE = 2;
const WED = 3;
const THU = 4;
const FRI = 5;
const SAT = 6;

// for SCHOOL
const SCHOOL = 0;
const SCHOOLCOLOR = 'skyblue';
const VDRUG = 'Vドラッグ';
const HONBUTOMAE = '金沢大学本部棟前';

// for HOME
const HOME = 1;
const HOMECOLOR = 'orange';
//const HONBUTOMAE = '金沢大学本部棟前';
const YAMAYA = 'やまや';

// for form validation
const formValidation = {
  isDepartureTimeValid: null,
};

const INITIAL_STATE = {
  // for aggregated demand schedule
  schoolDayId: SUN,
  homeDayId: SUN,
  demandSchedule: {
    school: [{ // next day's info
      data: [
        { x: DUMMY, y: -1 }, // dummy
        { x: '8:00', y: -1 }, { x: '8:15', y: -1 }, { x: '8:30', y: -1 }, { x: '8:45', y: -1 },
        { x: '9:00', y: -1 }, { x: '9:15', y: -1 }, { x: '9:30', y: -1 }, { x: '9:45', y: -1 },
        { x: '10:00', y: -1 }, { x: '10:15', y: -1 }, { x: '10:30', y: -1 }, { x: '10:45', y: -1 },
        { x: '11:00', y: -1 }, { x: '11:15', y: -1 }, { x: '11:30', y: -1 }, { x: '11:45', y: -1 },
        { x: '12:00', y: -1 }, { x: '12:15', y: -1 }, { x: '12:30', y: -1 }, { x: '12:45', y: -1 },
        { x: '13:00', y: -1 }, { x: '13:15', y: -1 }, { x: '13:30', y: -1 }, { x: '13:45', y: -1 },
        { x: '14:00', y: -1 }, { x: '14:15', y: -1 }, { x: '14:30', y: -1 }, { x: '14:45', y: -1 },
      ],
      color: SCHOOLCOLOR,
    }],
    home: [{ // today's info
      data: [
        { x: DUMMY, y: -1 }, // dummy
        { x: '12:00', y: -1 }, { x: '12:15', y: -1 }, { x: '12:30', y: -1 }, { x: '12:45', y: -1 },
        { x: '13:00', y: -1 }, { x: '13:15', y: -1 }, { x: '13:30', y: -1 }, { x: '13:45', y: -1 },
        { x: '14:00', y: -1 }, { x: '14:15', y: -1 }, { x: '14:30', y: -1 }, { x: '14:45', y: -1 },
        { x: '15:00', y: -1 }, { x: '15:15', y: -1 }, { x: '15:30', y: -1 }, { x: '15:45', y: -1 },
        { x: '16:00', y: -1 }, { x: '16:15', y: -1 }, { x: '16:30', y: -1 }, { x: '16:45', y: -1 },
        { x: '17:00', y: -1 }, { x: '17:15', y: -1 }, { x: '17:30', y: -1 }, { x: '17:45', y: -1 },
        { x: '18:00', y: -1 }, { x: '18:15', y: -1 }, { x: '18:30', y: -1 }, { x: '18:45', y: -1 },
      ],
      color: HOMECOLOR,
    }]
  },

  // for <ButtonGroup />
  direction: SCHOOL,

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
    rider_capacity: '2人',
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

    // This is not an acntion creator
    // Just GET the aggregated demand schedule from the server and store into `this.state`
    this.fetchAgrDemandSchedule(INITIAL_STATE.direction);

    // Call action creators
    this.props.getDriverInfo();
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
  }


  // Just GET the aggregated demand schedule from the server and store into `this.state`
  async fetchAgrDemandSchedule(direction) {
    // for debug
    //console.log(`[Before] JSON.stringify(this.state.demandSchedule) = ${JSON.stringify(this.state.demandSchedule)}`);

    const directionString = (direction === SCHOOL) ? 'school' : 'home';

    // GET the own demand schedule
    try {
      let agrDemandResponse = await fetch(`https://inori.work/demand/aggregate/${directionString}`);

      // If succeeded to GET the own demand schedule,
      if (parseInt(agrDemandResponse.status / 100, 10) === 2) {
        let agrDemandResponseJson = await agrDemandResponse.json();

        // for debug
        //console.log(`JSON.stringify(agrDemandResponseJson) = ${JSON.stringify(agrDemandResponseJson)}`);

        const todayId = new Date().getDay();

        let schoolDayId;
        let homeDayId;
        switch (todayId) {
          case FRI:
            schoolDayId = MON;
            homeDayId = FRI;
            break;

          case SAT:
          case SUN:
            schoolDayId = MON;
            homeDayId = MON;
            break;

          default:
            schoolDayId = todayId + 1;
            homeDayId = todayId;
            break;
        }

        if (direction === SCHOOL) {
          const demandScheduleSchool = this.state.demandSchedule.school[0];
          demandScheduleSchool.data.forEach((item, index) => {
            if (item.x === DUMMY) {
              demandScheduleSchool.data[index].y = 0;
            } else {
              const timeId = this.timeString2Id(item.x);
              demandScheduleSchool.data[index].y = agrDemandResponseJson.days[schoolDayId][timeId];
            }
          });

          this.setState({
            schoolDayId,
            homeDayId,
            demandSchedule: {
              ...this.state.demandSchedule,
              school: [demandScheduleSchool]
            }
          });
        } else if (direction === HOME) {
          const demandScheduleHome = this.state.demandSchedule.home[0];
          demandScheduleHome.data.forEach((item, index) => {
            if (item.x === DUMMY) {
              demandScheduleHome.data[index].y = 0;
            } else {
              const timeId = this.timeString2Id(item.x);
              demandScheduleHome.data[index].y = agrDemandResponseJson.days[homeDayId][timeId];
            }
          });

          this.setState({
            schoolDayId,
            homeDayId,
            demandSchedule: {
              ...this.state.demandSchedule,
              home: [demandScheduleHome]
            }
          });
        }

        // for debug
        //console.log(`[After] JSON.stringify(this.state.demandSchedule) = ${JSON.stringify(this.state.demandSchedule)}`);

      // If failed to GET the own demand schedule,
      } else if (parseInt(agrDemandResponse.status / 100, 10) === 4 ||
                 parseInt(agrDemandResponse.status / 100, 10) === 5) {
        console.log('Failed to GET the demand schedule...');

        Alert.alert(
          'グラフデータを取得することができませんでした。',
          '電波の良いところで後ほどお試しください。相乗りオファーを出すことは可能です。',
          [{ text: 'OK' }]
        );
      }

    // If cannot access demand api,
    } catch (error) {
      console.error(error);
      console.log('Cannot access demand api...');

      Alert.alert(
        'グラフデータを取得することができませんでした。',
        '電波の良いところで後ほどお試しください。相乗りオファーを出すことは可能です。',
        [{ text: 'OK' }]
      );
    }
  }


  dayId2String(dayId) {
    switch (dayId) {
      case MON:
        return '（月）';

      case TUE:
        return '（火）';

      case WED:
        return '（水）';

      case THU:
        return '（木）';

      case FRI:
        return '（金）';

      default:
        return '';
    }
  }


  timeString2Id(timeString) {
    // `timeString` = "2:45" ---> `timeArray` = [2, 45]
    const timeArray = timeString.split(':');

    // `timeArray` = [2, 45] ---> `timeId` = 11
    const timeId = (timeArray[0] * 4) + (timeArray[1] / 15);

    return timeId;
  }


  setDepartureTime(xAxisIndex) {
    // `timeString` = "8:00"
    let timeString = this.state.direction === SCHOOL ?
    this.state.demandSchedule.school[0].data[xAxisIndex].x :
    this.state.demandSchedule.home[0].data[xAxisIndex].x;

    // Add second (last 3 characters)
    // "8:00" ---> "8:00:00"
    timeString = `${timeString}:00`;

    // `today` = "2018/10/04 17:00:00"
    const today = new Date().toLocaleString('ja');

    let departureDate = new Date(today);
    switch (new Date().getDay()) {
      case FRI:
        if (this.state.direction === SCHOOL) {
          departureDate.setDate(departureDate.getDate() + 3);
        }
        departureDate = departureDate.toLocaleString('ja');
        break;

      case SAT:
        departureDate.setDate(departureDate.getDate() + 2);
        departureDate = departureDate.toLocaleString('ja');
        break;

      case SUN:
        departureDate.setDate(departureDate.getDate() + 1);
        departureDate = departureDate.toLocaleString('ja');
        break;

      default:
        if (this.state.direction === SCHOOL) {
          departureDate.setDate(departureDate.getDate() + 1);
        }
        departureDate = departureDate.toLocaleString('ja');
        break;
    }

    // Overwrite date (with correctly incremented date) and time (with selected time)
    // `today` = "2018/10/04 17:00:00" ---> `departureTimeString` = "2018/10/05 8:00:00"
    const departureTimeString = `${departureDate.split(' ')[0]} ${timeString}`;
    //console.log(`departureTimeString = ${departureTimeString}`);

    this.setState({
      offerDetail: {
        ...this.state.offerDetail,
        // Trim year (first 5 characters) and second (last 3 characters)
        // "2018/10/05 8:00:00" ---> "10/05 8:00"
        departure_time: departureTimeString.substring(5, departureTimeString.length - 3)
      },
      chosenDepartureTime: departureTimeString,
    });
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
      if (this.state.direction === SCHOOL) {
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
      } else if (this.state.direction === HOME) {
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
      if (this.state.direction === SCHOOL) {
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
      } else if (this.state.direction === HOME) {
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
    reservationDeadline.setHours(reservationDeadline.getHours() - 1);

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
      availavleDepartureTime.setHours(availavleDepartureTime.getHours() + 1);

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
              const departureTimeString = dateTime.toLocaleString('ja');

              this.setState({
                offerDetail: {
                  ...this.state.offerDetail,
                  // Trim year (first 5 characters) and second (last 3 characters)
                  // "2018/10/04 17:00:00" ---> "10/04 17:00"
                  departure_time: departureTimeString.substring(5, departureTimeString.length - 3)
                },
                chosenDepartureTime: departureTimeString,
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
                  const departureTimeString = departureTime.replace(/-/g, '/');

                  this.setState({
                    offerDetail: {
                      ...this.state.offerDetail,
                      // Trim year (first 5 characters) and second (last 3 characters)
                      // "2018/10/04 17:00:00" ---> "10/04 17:00"
                      departure_time: departureTimeString.substring(5, departureTimeString.length - 3)
                    },
                    chosenDepartureTime: departureTimeString,
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
              {/*<Picker.Item label="---" value="---" />*/}
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
            const trimedRiderCapacity = parseInt(this.state.offerDetail.rider_capacity.replace(/人/g, ''), 10);

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
              const messageTitle = '出発時刻の1時間前です。';
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

              // Set the scheduled time for local push notification to 1 hour earlier from the departure time
              // (same as reservation deadline)
              const schedulingTime = new Date(this.state.chosenDepartureTime);
              schedulingTime.setHours(schedulingTime.getHours() - 1);
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
        //this.state.offerDetail.rider_capacity !== INITIAL_STATE.offerDetail.rider_capacity &&
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
            /*
            this.state.startPickerVisible ||
            this.state.goalPickerVisible ||
            this.state.departureTimePickerVisible ||
            this.state.riderCapacityPickerVisible ||
            */
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

    // Wait to fetch own driver info and aggregated demand schedule (to school)
    if ((typeof this.props.driverInfo.id) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.grayTextStyle}>
            {this.dayId2String(this.state.direction === SCHOOL ? this.state.schoolDayId : this.state.homeDayId)}の人気時間帯
          </Text>
          <PureChart
            type="line"
            data={this.state.direction === SCHOOL ? this.state.demandSchedule.school : this.state.demandSchedule.home}
            //height={100}
            gap={15} // Space between each x values
            backgroundColor="#efefef"
            xAxisGridLineColor="#bfbfbf"
            yAxisGridLineColor="transparent"
            //hidePoints
            onPress={(xAxisIndex) => this.setDepartureTime(xAxisIndex)}
          />

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
              <Text style={{ color: 'rgb(0,122,255)' }}>閉じる</Text>
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
              <Text style={{ color: 'rgb(0,122,255)' }}>閉じる</Text>
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
            selectedIndex={this.state.direction}
            onPress={(selectedIndex) => {
              this.fetchAgrDemandSchedule(selectedIndex);

              this.setState({
                direction: selectedIndex,
                offerDetail: {
                  ...this.state.offerDetail,
                  start: selectedIndex === SCHOOL ? VDRUG : HONBUTOMAE,
                  goal: selectedIndex === SCHOOL ? HONBUTOMAE : YAMAYA,
                }
              });
            }}
            selectedButtonStyle={{ backgroundColor: this.state.direction === SCHOOL ? SCHOOLCOLOR : HOMECOLOR }}
            selectedTextStyle={{ color: 'white' }}
          />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 4 }}>
              <ListItem
                title={
                  <View style={{ flexDirection: 'row' }}>
                    <Icon name='timer' /*type='font-awesome'*/ color='gray' size={15} />
                    <Text style={styles.grayTextStyle}>出発時刻：</Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text style={{ color: this.state.offerDetail.departure_time === INITIAL_STATE.offerDetail.departure_time ? 'gray' : 'black' }}>
                      {this.state.offerDetail.departure_time}
                    </Text>
                  </View>

                }
                rightIcon={
                  !this.state.departureTimePickerVisible ?
                  { name: 'keyboard-arrow-down' } :
                  <Text style={{ color: 'rgb(0,122,255)' }}>閉じる</Text>
                }
                onPress={() => this.setState({
                  startPickerVisible: false,
                  goalPickerVisible: false,
                  departureTimePickerVisible: !this.state.departureTimePickerVisible,
                  riderCapacityPickerVisible: false,
                })}
              />
            </View>

            <View style={{ flex: 3, paddingLeft: 10 }}>
              <ListItem
                title={
                  <View style={{ flexDirection: 'row' }}>
                    <Icon name='car' type='font-awesome' color='gray' size={15} />
                    <Text style={styles.grayTextStyle}>空席数：</Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text>
                      {this.state.offerDetail.rider_capacity}
                    </Text>
                  </View>
                }
                rightIcon={
                  !this.state.riderCapacityPickerVisible ?
                  { name: 'keyboard-arrow-down' } :
                  <Text style={{ color: 'rgb(0,122,255)' }}>閉じる</Text>
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
