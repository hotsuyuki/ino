import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, RefreshControl, Alert,
  LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { AppLoading, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


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


  componentDidMount() {
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
    console.log(`JSON.stringify(notification) = ${JSON.stringify(notification)}`);

    // When the driver canceled the offer which already reserved,
    if (notification.data.type === 'canceled_offer') {
      // If foregrounded by selecting the push notification,
      if (notification.origin === 'selected') {
        // Rerender the screen
        this.props.fetchOwnReservations();
        this.props.fetchAllOffers();
      // If received the push notification while the app is already foreground, (iOS only)
      } else if (notification.origin === 'received' && Platform.OS === 'ios') {
        Alert.alert(
          '',
          '予約済みのオファーがキャンセルされました。', //`${notification.data.message_body}`
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
          // Trim year(frist 5 characters) and second(last 3 characters),
          // and replace hyphens by slashes
          const trimedDepartureTime = item.offer.departure_time.substring(5, item.offer.departure_time.length - 3).replace(/-/g, '/');

          const isReservation = true;

          return (
            <ListItem
              key={index}
              //leftIcon={{ name: 'person', color: 'black' }}
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
          // Trim year(frist 5 characters) and second(last 3 characters),
          // and replace hyphens by slashes
          const trimedDepartureTime = item.offer.departure_time.substring(5, item.offer.departure_time.length - 3).replace(/-/g, '/');

          // Whether this offer(`item`) is reservation or not
          let isReservation = false;
          item.reserved_riders.forEach((reservedRiderId) => {
            if (reservedRiderId === this.props.riderInfo.id) {
              isReservation = true;
            }
          });

          if (!isReservation) {
            return (
              <ListItem
                key={index}
                //leftIcon={{ name: 'person', color: 'black' }}
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
    /*fontSize: 18,*/
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
