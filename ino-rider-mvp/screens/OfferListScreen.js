import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, RefreshControl, Alert,
  LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { ListItem, Icon, Button } from 'react-native-elements';
import { AppLoading, Permissions, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


// for push notifications handler
const CANCELED_OFFER = 'canceled_offer';
const RESERVATION_DEADLINE = 'reservation_deadline';

const INITIAL_STATE = {
  // for <ScrollView />
  isRefreshing: false
};


class OfferListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Call action creators
    this.props.getRiderInfo();
    this.props.fetchOwnReservations();
    this.props.fetchAllOffers();
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
    console.log(JSON.stringify(pushNotificationsToken));

    // POST the push notification token
    try {
      let response = await fetch('https://inori.work/tokens/push/riders', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.props.riderInfo.id,
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
      // When the driver canceled the offer which already reserved,
      case CANCELED_OFFER:
        // If foregrounded by selecting the push notification,
        if (notification.origin === 'selected') {
          // Rerender the screen
          this.props.fetchOwnReservations();
          this.props.fetchAllOffers();
        // If received the push notification while the app is already foreground, (iOS only)
        } else if (notification.origin === 'received' && Platform.OS === 'ios') {
          Alert.alert(
            '',
            `${notification.data.message_title}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Rerender the screen
                  this.props.fetchOwnReservations();
                  this.props.fetchAllOffers();
                },
              }
            ],
            { cancelable: false }
          );
        }
        break;

      // When the reservation deadline has come,
      case RESERVATION_DEADLINE:
        // If foregrounded by selecting the push notification,
        if (notification.origin === 'selected') {
          this.props.navigation.navigate('detail', {
            riderId: this.props.riderInfo.id,
            selectedOfferId: notification.data.offer_id,
            isReservation: true
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
                  riderId: this.props.riderInfo.id,
                  selectedOfferId: notification.data.offer_id,
                  isReservation: true
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


  onScrollViewRefresh = () => {
    this.setState({ isRefreshing: true });

    // Rerender the screen
    this.props.fetchOwnReservations();
    this.props.fetchAllOffers();

    this.setState({ isRefreshing: false });
  }


  onListItemPress = (selectedItem, isReservation) => {
    // Nvigate to `DetailScreen` with params
    this.props.navigation.navigate('detail', {
      riderId: this.props.riderInfo.id,
      selectedOfferId: selectedItem.offer.id,
      isReservation
    });
  }


  renderOwnReservations() {
    // for debug
    //console.log(`this.props.ownReservations.length = ${this.props.ownReservations.length}`);

    // TODO: Search whole departure time in the array whether it's passed the disappearing time or not
    if (this.props.ownReservations.length === 0) {
      return (
        <View style={{ padding: 10 }}>
          <Text style={styles.grayTextStyle}>予約済のオファーはまだありません</Text>
        </View>
      );
    }

    return (
      <View>
        {this.props.ownReservations.map((item, index) => {
          // Set the disappearing time to 12 hour later from the departure time
          const disappearingTime = new Date(item.offer.departure_time.replace(/-/g, '/'));
          disappearingTime.setHours(disappearingTime.getHours() + 12);

          // If the disappearing time is passed,
          if (disappearingTime < new Date()) {
            // render nothing
            return <View />;
          }

          const isReservation = true;

          // Set the estimated arrival time to 1 hour later from the departure time
          const estimatedArrivalTime = new Date(item.offer.departure_time.replace(/-/g, '/'));
          estimatedArrivalTime.setHours(estimatedArrivalTime.getHours() + 1);

          // If the carpool is expected to be arrived,
          if (estimatedArrivalTime < new Date()) {
            // render a ListItem with Kyash button
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
                      <Button
                        //icon={<Image source={{ uri: '../assets/kyash_icon.png' }} />}
                        title="Kyashで募金する"
                        color="skyblue"
                        buttonStyle={{ backgroundColor: 'white', borderRadius: 30 }}
                        onPress={() => this.onListItemPress(item, isReservation)}
                      />
                    </View>
                  </View>
                }
                onPress={() => this.onListItemPress(item, isReservation)}
              />
            );
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
              onPress={() => this.onListItemPress(item, isReservation)}
            />
          );
        })}
      </View>
    );
  }


  renderAllOffers() {
    // for debug
    //console.log(`this.props.allOffers.length = ${this.props.allOffers.length}`);

    // TODO: Search whole departure time in the array whether it's passed the deadline time or not
    if (this.props.allOffers.length === 0) {
      return (
        <View style={{ padding: 10 }}>
          <Text style={styles.grayTextStyle}>受付中のオファーはまだありません</Text>
        </View>
      );
    }

    return (
      <View>
        {this.props.allOffers.map((item, index) => {
          // Whether this offer (`item`) is reservation or not
          let isReservation = false;
          item.reserved_riders.forEach((reservedRiderId) => {
            if (reservedRiderId === this.props.riderInfo.id) {
              isReservation = true;
            }
          });

          // Set the reservation deadline time to 1 hour earlier from the departure time
          const reservationDeadline = new Date(item.offer.departure_time.replace(/-/g, '/'));
          reservationDeadline.setHours(reservationDeadline.getHours() - 1);

          // If this offer is not reservation and before the deadline,
          if (!isReservation && new Date() < reservationDeadline) {
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
                onPress={() => this.onListItemPress(item, isReservation)}
              />
            );
          }

          // If it is reservation, render nothing
          return <View key={index} />;
        })}
      </View>
    );
  }


  render() {
    // for debug
    //console.log(`(typeof this.props.riderInfo.id) = ${(typeof this.props.riderInfo.id)}`);
    //console.log(`_.isNull(this.props.ownReservations) = ${_.isNull(this.props.ownReservations)}`);
    //console.log(`_.isNull(this.props.allOffers) = ${_.isNull(this.props.allOffers)}`);

    // Wait to fetch own rider info, own reservations, and all offers
    if ((typeof this.props.riderInfo.id) === 'undefined' ||
        _.isNull(this.props.ownReservations) ||
        _.isNull(this.props.allOffers)) {
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

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>予約済</Text>
          </View>

          {this.renderOwnReservations()}

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>受付中</Text>
          </View>

          {this.renderAllOffers()}

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
    riderInfo: state.riderReducer.riderInfo,
    ownReservations: state.riderReducer.ownReservations,
    allOffers: state.riderReducer.allOffers
  };
};


export default connect(mapStateToProps, actions)(OfferListScreen);
