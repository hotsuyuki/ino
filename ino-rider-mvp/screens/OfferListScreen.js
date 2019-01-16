import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, RefreshControl, Alert, Image, StatusBar,
  LayoutAnimation, UIManager, AsyncStorage,
} from 'react-native';
import { ListItem, Icon, Button } from 'react-native-elements';
import { AppLoading, Permissions, Notifications } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const INITIAL_STATE = {
  // for <ScrollView />
  isRefreshing: false
};

const FACE_IMAGE_SIZE = 60;
const FACE_IMAGE_PLACEHOLDER = '../assets/face_image_placeholder.png';

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


  async componentDidMount() {
    // Add navigation listener of changing the StatusBar configuration
    // https://reactnavigation.org/docs/en/status-bar.html#tabnavigator
    this.navigationListener = this.props.navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      //isAndroid && StatusBar.setBackgroundColor('white');
    });
  }


  componentWillUnmount() {
    // Remove navigation listener of changing the StatusBar configuration
    // https://reactnavigation.org/docs/en/status-bar.html#tabnavigator
    this.navigationListener.remove();
  }


  onScrollViewRefresh = async () => {
    this.setState({ isRefreshing: true });

    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Rerender the screen
    this.props.getRiderInfo();
    this.props.fetchOwnReservations();
    this.props.fetchAllOffers();

    // Navigate to ReservingScreen or not
    let stringifiedReservationInfo = await AsyncStorage.getItem('reservationInfo');
    console.log(`[OfferListScreen] stringifiedReservationInfo = ${stringifiedReservationInfo}`);

    if (stringifiedReservationInfo === null) {
      this.setState({ isRefreshing: false });
    } else {
      const reservationInfo = JSON.parse(stringifiedReservationInfo);

      // If the scheduling time (1 hour before the departure time) is NOT passed yet,
      if (new Date() < new Date(reservationInfo.scheduling_time)) {
        this.setState({ isRefreshing: false });
      } else {
        this.setState({ isRefreshing: false });
        console.log('[OfferListScreen] navigate(reserving) in onScrollViewRefresh()');
        this.props.navigation.navigate('reserving');
      }
    }
  }


  onListItemPress = (selectedOfferId, isReservation) => {
    this.props.fetchSelectedOffer(selectedOfferId, isReservation);
    this.props.navigation.navigate('detail');
  }


  renderOwnReservations() {
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
          // Set the disappearing time to 30 minutes later from the departure time
          const disappearingTime = new Date(item.offer.departure_time.replace(/-/g, '/'));
          disappearingTime.setMinutes(disappearingTime.getMinutes() + 30);

          // If the disappearing time is passed,
          // `departureTime` < `disappearingTime` < `new Date()`
          if (disappearingTime < new Date()) {
            // render nothing
            return <View key={index} />;
          }

          const isReservation = true;
          const departureTime = new Date(item.offer.departure_time.replace(/-/g, '/'));

          // If the departure time is passed,
          // `departureTime` < `new Date()` < `disappearingTime`
          if (departureTime < new Date()) {
            // Render a ListItem with Kyash button
            return (
              <ListItem
                key={index}
                title={
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={{ flex: 3, alignItems: 'center' }}>
                      <Image
                        style={{ width: FACE_IMAGE_SIZE, height: FACE_IMAGE_SIZE, borderRadius: FACE_IMAGE_SIZE / 2 }}
                        source={
                          item.driver.image_url === '' ?
                          require(FACE_IMAGE_PLACEHOLDER) :
                          { uri: item.driver.image_url }
                        }
                      />
                    </View>

                    <View style={{ flex: 7 }}>
                      <Button
                        title="Kyashでチップ"
                        color="white"
                        buttonStyle={{ backgroundColor: 'skyblue', borderRadius: 20 }}
                        onPress={() => this.onListItemPress(item.offer.id, isReservation)}
                      />
                    </View>
                  </View>
                }
                onPress={() => this.onListItemPress(item.offer.id, isReservation)}
              />
            );
          }

          // Trim year(frist 5 characters) and second(last 3 characters), and replace hyphens by slashes
          // "2018-10-04 17:00:00" ---> "10/04 17:00"
          const trimedDepartureTime = item.offer.departure_time.substring(5, item.offer.departure_time.length - 3).replace(/-/g, '/');

          // `new Date()` < `departureTime` < `disappearingTime`
          return (
            <ListItem
              key={index}
              title={
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                  <View style={{ flex: 3, alignItems: 'center' }}>
                    <Image
                      style={{ width: FACE_IMAGE_SIZE, height: FACE_IMAGE_SIZE, borderRadius: FACE_IMAGE_SIZE / 2 }}
                      source={
                        item.driver.image_url === '' ?
                        require(FACE_IMAGE_PLACEHOLDER) :
                        { uri: item.driver.image_url }
                      }
                    />
                  </View>

                  <View style={{ flex: 7, justifyContent: 'space-between' }}>
                    <Text>{`${item.driver.last_name} ${item.driver.first_name}`}</Text>
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
              onPress={() => this.onListItemPress(item.offer.id, isReservation)}
            />
          );
        })}
      </View>
    );
  }


  renderAllOffers() {
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

          // Set the reservation deadline time to 1 hour before the departure time
          const reservationDeadline = new Date(item.offer.departure_time.replace(/-/g, '/'));
          reservationDeadline.setHours(reservationDeadline.getHours() - 1);

          // If this offer is not reservation and before the deadline,
          // `new Date()` < `reservationDeadline`
          if (!isReservation && new Date() < reservationDeadline) {
            // Trim year(frist 5 characters) and second(last 3 characters), and replace hyphens by slashes
            // "2018-10-04 17:00:00" ---> "10/04 17:00"
            const trimedDepartureTime = item.offer.departure_time.substring(5, item.offer.departure_time.length - 3).replace(/-/g, '/');

            return (
              <ListItem
                key={index}
                title={
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={{ flex: 3, alignItems: 'center' }}>
                      <Image
                        style={{ width: FACE_IMAGE_SIZE, height: FACE_IMAGE_SIZE, borderRadius: FACE_IMAGE_SIZE / 2 }}
                        source={
                          item.driver.image_url === '' ?
                          require(FACE_IMAGE_PLACEHOLDER) :
                          { uri: item.driver.image_url }
                        }
                      />
                    </View>

                    <View style={{ flex: 7, justifyContent: 'space-between' }}>
                      <Text>{`${item.driver.last_name} ${item.driver.first_name}`}</Text>
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
                onPress={() => this.onListItemPress(item.offer.id, isReservation)}
              />
            );
          }

          // If it is reservation or after the deadline, render nothing
          // `reservationDeadline` < `new Date()`
          return <View key={index} />;
        })}
      </View>
    );
  }


  render() {
    // for debug
    //console.log(`(typeof this.props.riderInfo.id) = ${(typeof this.props.riderInfo.id)}`);
    //console.log(`this.props.ownReservations = ${this.props.ownReservations}`);
    //console.log(`this.props.allOffers = ${this.props.allOffers}`);

    // Wait to fetch own rider info, own reservations, and all offers
    if (
      (typeof this.props.riderInfo.id) === 'undefined' ||
      this.props.ownReservations === null ||
      this.props.allOffers === null
    ) {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
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
    allOffers: state.riderReducer.allOffers,
    selectedOffer: state.riderReducer.selectedOffer,
  };
};


export default connect(mapStateToProps, actions)(OfferListScreen);
