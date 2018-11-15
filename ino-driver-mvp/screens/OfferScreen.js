import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Picker, DatePickerIOS, Alert,
  LayoutAnimation, UIManager, RefreshControl,
} from 'react-native';
import { Button, ButtonGroup, ListItem, Icon } from 'react-native-elements';
import { AppLoading } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const TOKO = 0;
const GEKO = 1;

// for TOKO
const VDRUG = 'Vドラッグ';
const KOKUSAIKAIKAN_SHIZEN3PARK = '国際交流会館前 経由 自然研3号館駐車場';
const SHIZEN3PARK = '自然研3号館駐車場';

// for GEKO
const SHIZEN3ENTER_KOKUSAIKAIKAN = '自然研3号館入口 経由 国際交流会館前';
const SHIZEN3ENTER = '自然研3号館入口';
const YAMAYA = 'やまや';

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
    goal: KOKUSAIKAIKAN_SHIZEN3PARK,
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
    // Call action creators
    this.props.getDriverInfo();
    this.props.fetchOwnOffers();
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
  }


  onScrollViewRefresh = async () => {
    this.setState({ isRefreshing: true });

    await this.props.fetchOwnOffers();

    this.setState({ isRefreshing: false });
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
            <Picker.Item label={`${SHIZEN3ENTER_KOKUSAIKAIKAN}`} value={`${SHIZEN3ENTER_KOKUSAIKAIKAN}`} />
            <Picker.Item label={`${SHIZEN3ENTER}`} value={`${SHIZEN3ENTER}`} />
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
            <Picker.Item label={`${KOKUSAIKAIKAN_SHIZEN3PARK}`} value={`${KOKUSAIKAIKAN_SHIZEN3PARK}`} />
            <Picker.Item label={`${SHIZEN3PARK}`} value={`${SHIZEN3PARK}`} />
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
                // and replace hyphens by slashes
                departure_time: departureTimeText.substring(5, departureTimeText.length - 3).replace(/-/g, '/')
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
      空席：${this.state.offerDetail.rider_capacity} \n
      `,
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            // Replace srashes by hyphens
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
              let response = await fetch('https://inori.work/offers', {
                method: 'POST',
                headers: {},
                body: JSON.stringify(offerDetail),
              });

              //let responseJson = await response.json();

              // If cannot create an offer,
              if (parseInt(response.status / 100, 10) === 4 ||
                  parseInt(response.status / 100, 10) === 5) {
                console.log('Create an offer is failed...');

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
          // Trim year(frist 5 characters) and second(last 3 characters),
          // and replace hyphens by slashes
          const trimedDepartureTime = item.offer.departure_time.substring(5, item.offer.departure_time.length - 3).replace(/-/g, '/');

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

          <ButtonGroup
            buttons={[
              '登校',
              '下校'
            ]}
            selectedIndex={this.state.togekoFlag}
            onPress={(selectedIndex) =>
              this.setState({
                togekoFlag: selectedIndex,
                offerDetail: {
                  ...this.state.offerDetail,
                  start: selectedIndex===TOKO ? VDRUG : SHIZEN3ENTER_KOKUSAIKAIKAN,
                  goal: selectedIndex===TOKO ? KOKUSAIKAIKAN_SHIZEN3PARK : YAMAYA,
                }
              })
            }
          />

          // Start picker
          <ListItem
            title={
              <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingLeft: 3, paddingRight: 3, justifyContent: 'center' }} >
                  <Icon name='map-marker' type='font-awesome' color='gray' size={15} />
                </View>
                <Text style={styles.grayTextStyle}>集合：</Text>
              </View>
            }
            subtitle={
              <View style={styles.listItemStyle}>
                <Text numberOfLines={1} style={{ /*fontSize: 18*/ }}>
                  {this.state.offerDetail.start}
                </Text>
              </View>
            }
            rightIcon={{ name: !this.state.startPickerVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-up' }}
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
              <View style={{ flexDirection: 'row' }}>
                <Icon name='flag-checkered' type='font-awesome' color='gray' size={15} />
                <Text style={styles.grayTextStyle}>到着：</Text>
              </View>
            }
            subtitle={
              <View style={styles.listItemStyle}>
                <Text numberOfLines={1} style={{ /*fontSize: 18*/ }}>
                  {this.state.offerDetail.goal}
                </Text>
              </View>
            }
            rightIcon={{ name: !this.state.goalPickerVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-up' }}
            onPress={() => this.setState({
              startPickerVisible: false,
              goalPickerVisible: !this.state.goalPickerVisible,
              departureTimePickerVisible: false,
              riderCapacityPickerVisible: false,
            })}
          />

          {this.renderGoalPicker()}

          <View style={{ flexDirection: 'row' }}>
            // Departure time picker
            <View style={{ flex: 3 }}>
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
                        /*fontSize: 18,*/
                        color: this.state.offerDetail.departure_time === INITIAL_STATE.offerDetail.departure_time ? 'gray' : 'black'
                      }}
                    >
                      {this.state.offerDetail.departure_time}
                    </Text>
                  </View>

                }
                rightIcon={{ name: !this.state.departureTimePickerVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-up' }}
                onPress={() => this.setState({
                  startPickerVisible: false,
                  goalPickerVisible: false,
                  departureTimePickerVisible: !this.state.departureTimePickerVisible,
                  riderCapacityPickerVisible: false,
                })}
              />
            </View>

            // Rider capacity picker
            <View style={{ flex: 2, paddingLeft: 10 }}>
              <ListItem
                title={
                  <View style={{ flexDirection: 'row' }}>
                    <Icon name='car' type='font-awesome' color='gray' size={15} />
                    <Text style={styles.grayTextStyle}>空席：</Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text
                      style={{
                        /*fontSize: 18,*/
                        color: this.state.offerDetail.rider_capacity === INITIAL_STATE.offerDetail.rider_capacity ? 'gray' : 'black'
                      }}
                    >
                      {this.state.offerDetail.rider_capacity}
                    </Text>
                  </View>
                }
                rightIcon={{ name: !this.state.riderCapacityPickerVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-up' }}
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
    driverInfo: state.driverReducer.driverInfo,
    ownOffers: state.driverReducer.ownOffers
  };
};


export default connect(mapStateToProps, actions)(OfferScreen);
