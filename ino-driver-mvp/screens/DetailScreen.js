import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
  LayoutAnimation, UIManager, RefreshControl, Linking,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { AppLoading } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const INITIAL_STATE = {
  // for <ScrollView />
  isRefreshing: false,

  // for selected item,
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


  componentWillMount() {
    // This is not an acntion creator
    // Just GET the offer info from the server and store into `this.state`
    this.fetchSelectedOffer();

    // Reflesh `this.props.ownOffers` in `OfferScreen`
    // and make `OfferScreen` rerender by calling action creators
    this.props.fetchOwnOffers();
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

      // Get own driver info
      this.props.getDriverInfo();

      selectedItem.driver = this.props.driverInfo;
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
          let riderResponseJson = await riderResponse.json();

          reservedRidersInfo.push(riderResponseJson.rider);

        // If cannot access riders api,
        } catch (error) {
          console.error(error);
          console.log('Cannot access riders api...');
        }
      });

      await Promise.all(promiseArray);

      selectedItem.reserved_riders = reservedRidersInfo;
      // for debug
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

    // Reflesh `this.props.ownOffers` in `OfferScreen`
    // and make `OfferScreen` rerender by calling action creators
    this.props.fetchOwnOffers();

    this.setState({ isRefreshing: false });
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
              <View style={{ flex: 2 }}>
                <Text style={styles.nameTextStyle}>{`${rider.last_name} ${rider.first_name}`}</Text>
                <Text style={{ /*fontSize: 18*/ }}>{`${rider.major}`}</Text>
                <Text style={{ /*fontSize: 18*/ }}>{`${rider.grade}`}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Icon
                  name='comment'
                  type='font-awesome'
                  raised
                  // Replace first "0" with "+81" // TODO: Make it more robust
                  onPress={() => Linking.openURL(`sms:+81${rider.phone.substring(1)}`)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Icon
                  name='phone'
                  type='font-awesome'
                  raised
                  // Replace first "0" with "+81" // TODO: Make it more robust
                  onPress={() => Linking.openURL(`tel:+81${rider.phone.substring(1)}`)}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  }


  onCancelOfferButtonPress = () => {
    Alert.alert(
      '相乗りオファーをキャンセルしてもよろしいですか？',
      '既に予約されたライダー達には通知が行きます。',
      [
        { text: 'いいえ' },
        {
          text: 'はい',
          onPress: async () => {
            // The params passed from the previous page
            const selectedOfferId = this.props.navigation.getParam('selectedOfferId', 'default_value');

            // DELETE the selected offer
            try {
              let deleteResponse = await fetch(`https://inori.work/offers/${selectedOfferId}`, {
                method: 'DELETE',
                //headers: {},
                //body: {},
              });
              let deleteResponseJson = await deleteResponse.json();
              console.log(deleteResponseJson);
            } catch (error) {
              console.error(error);
            }

            // Reflesh `this.props.ownOffers` in `OfferScreen`
            // and make `OfferScreen` rerender by calling action creators
            this.props.fetchOwnOffers();
            this.props.navigation.pop();
          },
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  }


  render() {
    if (this.state.selectedItem === INITIAL_STATE.selectedItem) {
      return <AppLoading />;
    }

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

            <View style={{ paddingLeft: 30 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingLeft: 3, paddingRight: 3, justifyContent: 'center' }} >
                  <Icon name='map-marker' type='font-awesome' size={15} />
                </View>
                <Text style={styles.infoTextStyle}>{`${this.state.selectedItem.offer.start}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='flag-checkered' type='font-awesome' size={15} />
                <Text style={styles.infoTextStyle}>{`${this.state.selectedItem.offer.goal}`}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name='timer' /*type='font-awesome'*/ size={15} />
                <Text style={styles.infoTextStyle}>{`${trimedDepartureTime}`}</Text>
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
            <Text style={styles.grayTextStyle}>ライダー</Text>

            {this.renderReservedRiders()}

          </View>

          <View style={{ padding: 20 }}>
            <Button
              title="相乗りオファーをキャンセル"
              color="white"
              buttonStyle={{ backgroundColor: 'red' }}
              onPress={this.onCancelOfferButtonPress}
            />
          </View>

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  grayTextStyle: {
    /*fontSize: 18,*/
    color: 'gray',
    padding: 10,
  },
  infoTextStyle: {
    /*fontSize: 18,*/
    padding: 5,
  },
  nameTextStyle: {
    /*fontSize: 18,*/
    paddingBottom: 5
  },
});


const mapStateToProps = (state) => {
  return {
    driverInfo: state.driverReducer.driverInfo,
    ownOffers: state.driverReducer.ownOffers,
  };
};


export default connect(mapStateToProps, actions)(DetailScreen);
