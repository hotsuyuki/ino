import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Linking
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { AppLoading } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const INITIAL_STATE = {
  // for selected offer,
  selectedItem: {
    driver: {},
    offer: {},
    reserved_riders: [],
  },
};


class DetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // The params passed from the previous page
    const selectedOfferId = this.props.navigation.getParam('selectedOfferId', 'default_value');

    // Reget the selected item
    try {
      let offerResponse = await fetch(`https://inori.work/offers/${selectedOfferId}`);
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

      // Trim year(frist 5 characters) and second(last 3 characters),
      // and replace hyphens by slashes
      //selectedItem.departure_time = selectedItem.departure_time.substring(5, selectedItem.departure_time.length - 3).replace(/-/g, '/');

      // GET corresponding driver info
      try {
        let driverResponse = await fetch(`https://inori.work/drivers/${selectedItem.offer.driver_id}`);
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
            phone:
            car_color:,,
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
            let riderResponseJson = await riderResponse.json();

            reservedRidersInfo.push(riderResponseJson.rider);
          } catch (error) {
            console.error(error);
          }
        });

        await Promise.all(promiseArray);

        selectedItem.reserved_riders = reservedRidersInfo;
        //console.log(`JSON.stringify(selectedItem) = ${JSON.stringify(selectedItem)}`);
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
          selectedItem
        });

      // If cannot access drivers api,
      } catch (error) {
        console.error(error);
        console.log('Cannot access drivers api...');
      }
    // If cannot access offers api,
    } catch (error) {
      console.error(error);
      console.log('Cannot access offers api...');
    }
  }


  renderSmsButton() {
    // The params passed from the previous page
    const isReservation = this.props.navigation.getParam('isReservation', 'default_value');

    if (isReservation) {
      return (
        <Icon
          name='comment'
          type='font-awesome'
          raised
          // Replace first "0" with "+81" // TODO: Make it more robust
          onPress={() => Linking.openURL(`sms:+81${this.state.selectedItem.driver.phone.substring(1)}`)}
        />
      );
    }
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
      '相乗りを予約しますか？',
      '',
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
              rider_id: riderId
            };

            // POST new reservation
            try {
              let response = await fetch('https://inori.work/reservations', {
                method: 'POST',
                headers: {},
                body: JSON.stringify(reserveOfferBody),
              });
              let responseJson = await response.json();
              console.log(responseJson);

            // If cannot access reservations api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access reservations api...');
            }

            // Reflesh `this.props.driverInfo` in `OfferListScreen`
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
              let reservationResponseJson = await reservationResponse.json();
              reservationResponseJson.reservations.forEach((reservation) => {
                if (reservation.offer_id === selectedOfferId) {
                  reservationId = reservation.id;
                }
              })
            } catch (error) {
              console.error(error);
            }

            // for debug
            console.log(`reservationId = ${reservationId}`)

            // DELETE the selected reservation
            try {
              let deleteResponse = await fetch(`https://inori.work/reservations/${reservationId}`, {
                method: 'DELETE',
              });
              let deleteResponseJson = await deleteResponse.json();
              console.log(deleteResponseJson);
            } catch (error) {
              console.error(error);
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
              style={{ flexDirection: 'row', alignItems: 'center' }}
              key={index}
            >
              <View style={{ flex: 1 }}>
                <Icon name='person' />
              </View>
              <View style={{ flex: 4 }}>
                <Text style={{ fontSize: 18, paddingBottom: 5 }}>{`${rider.last_name} ${rider.first_name}`}</Text>
                <Text style={{ fontSize: 18 }}>{`${rider.major}`}</Text>
                <Text style={{ fontSize: 18 }}>{`${rider.grade}`}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }


  renderReserveOrCancelButton() {
    // The params passed from the previous page
    const isReservation = this.props.navigation.getParam('isReservation', 'default_value');

    // If it is Offer
    if (!isReservation) {
      return (
        <View style={{ padding: 20 }}>
          <Button
            title="相乗りオファーを予約"
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onReserveOfferButtonPress}
          />
        </View>
      );
    // If it is Reservation
    } else {
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
    if (this.state.selectedItem === INITIAL_STATE.selectedItem) {
      return <AppLoading />;
    }

    const trimedDepartureTime = this.state.selectedItem.offer.departure_time.substring(5, this.state.selectedItem.offer.departure_time.length - 3).replace(/-/g, '/')

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>

          <View>
            <Text style={styles.grayTextStyle}>情報</Text>
            <View style={{ paddingLeft: 30 }}>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='map-marker' type='font-awesome' size={25} />
                <Text style={{ padding: 5, fontSize: 18 }}>{`${this.state.selectedItem.offer.start}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='flag-checkered' type='font-awesome' size={15} />
                <Text style={{ padding: 5, fontSize: 18 }}>{`${this.state.selectedItem.offer.goal}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='timer' /*type='font-awesome'*/ size={15} />
                <Text style={{ padding: 5, fontSize: 18 }}>{`${trimedDepartureTime}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='car' type='font-awesome' size={15} />
                <Text style={{ padding: 5, fontSize: 18 }}>{`${this.state.selectedItem.reserved_riders.length} / ${this.state.selectedItem.offer.rider_capacity}人`}</Text>
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
                <Text style={{ fontSize: 18, paddingBottom: 5 }}>{`${this.state.selectedItem.driver.last_name} ${this.state.selectedItem.driver.first_name}`}</Text>
                <Text style={{ fontSize: 18 }}>{`${this.state.selectedItem.driver.major}`}</Text>
                <Text style={{ fontSize: 18 }}>{`${this.state.selectedItem.driver.grade}`}</Text>
                <Text style={{ fontSize: 18 }}>{`${this.state.selectedItem.driver.car_color} ${this.state.selectedItem.driver.car_number}`}</Text>
              </View>
              <View style={{ flex: 1 }}>
                {this.renderSmsButton()}
              </View>
              <View style={{ flex: 1 }}>
                {this.renderTelButton()}
              </View>
            </View>
          </View>

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.grayTextStyle}>ライダー</Text>

            {this.renderReservedRiders()}

          </View>

          {this.renderReserveOrCancelButton()}

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  grayTextStyle: {
    fontSize: 18,
    color: 'gray',
    padding: 10,
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