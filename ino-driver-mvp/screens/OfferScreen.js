import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Picker, DatePickerIOS, Alert,
  LayoutAnimation, UIManager
} from 'react-native';
import { Button, ButtonGroup, ListItem, Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../actions';

// TODO: Use API
import { driverIdTmp } from '../assets/tmpData';


const TOKO = 0;
const GEKO = 1;

const VDRUG = 'Vドラッグ';
const SHIZEN3ENTER_KOKUSAIKAIKAN = '自然研3号入口経由留学生会館';
const SHIZEN3ENTER = '自然研3号入口';
const KOKUSAIKAIKAN_SHIZEN3PARK = '留学生会館経由自然研3号駐車場';
const SHIZEN3PARK = '自然研3号駐車場';

const INITIAL_STATE = {
  // for <ButtonGroup />
  togekoIndex: TOKO,

  // for <Picker />
  startPickerVisible: false,
  goalPickerVisible: false,
  departureTimePickerVisible: false,
  riderCapacityPickerVisible: false,
  chosenDepartureTime: new Date(),

  // for driver's own offers
  offerDetail: {
    start: VDRUG,
    goal: KOKUSAIKAIKAN_SHIZEN3PARK,
    departure_time: '-/-  --:--',
    rider_capacity: '---',
    reserved_riders: [],
  },
  ownOffers: []
};


class OfferScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // Call an action creator
    this.props.fetchDriverInfo();

    // GET own offers
    try {
      let response = await fetch(`https://inori.work/offers?driver_id=${driverIdTmp}`);

      let responseJson = await response.json();
      this.setState({
        ownOffers: responseJson.offers
      });
    } catch (error) {
      console.error(error);
    }
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
  }


  renderStartPicker() {
    if (this.state.startPickerVisible) {
      if (this.state.togekoIndex === TOKO) {
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
      } else if (this.state.togekoIndex === GEKO) {
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
      if (this.state.togekoIndex === TOKO) {
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
      } else if (this.state.togekoIndex === GEKO) {
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
            <Picker.Item label={`${VDRUG}`} value={`${VDRUG}`} />
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
            const departureTimeText = dateTime.toLocaleString('ja-JP-u-ca-japanese');
            this.setState({
              offerDetail: {
                ...this.state.offerDetail,
                // Substring the "Japanese Calendar" and "seconds" part
                departure_time: departureTimeText.substring(3, departureTimeText.length - 3)
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
          <Picker.Item label="1人" value="1" />
          <Picker.Item label="2人" value="2" />
        </Picker>
      );
    }
  }


  onOfferButtonPress = () => {
    Alert.alert(
      '相乗りをオファーしますか？',
      '',
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            // Escape initializing `this.state.ownOffers`
            const ownOffers = this.state.ownOffers;

            // TODO: POST
            // POST the new offer
            //ownOffers.push(this.state.offerDetail);
            try {
              let response = await fetch('https://inori.work/offers', {
                method: 'POST',
                headers: {},
                body: JSON.stringify({
                  driver_id: driverIdTmp,
                  ...this.state.offerDetail,
                }),
              });

              let responseJson = await response.json();
              ownOffers.push(responseJson.offer);
            } catch (error) {
              console.error(error);
            }


            // TODO: GET
            // GET own offers
            this.setState({
              ...INITIAL_STATE,
              ownOffers
            });
            /*
            try {
              let response = await fetch(`https://inori.work/offers?driver_id=${driverIdTmp}`);

              let responseJson = await response.json();
              this.setState({
                ...INITIAL_STATE,
                ownOffers: responseJson.offers
              });
            } catch (error) {
              console.error(error);
            }
            */
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


  onListItemPress = (selectedOffer) => {
    // Nvigate to `DetailScreen` with params `offerId`
    this.props.navigation.navigate('detail', {
      offerId: selectedOffer.id,
    });
  }


  renderOwnOffers() {
    return (
      <View>
        {this.state.ownOffers.map((offer, index) => {
          return (
            <ListItem
              key={index}
              leftIcon={{ name: 'person', color: 'black' }}
              title={
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={{ flex: 2 }}>
                    <Text>{`${this.props.driverInfo.last_name} ${this.props.driverInfo.first_name}`}</Text>
                    <Text>{`${this.props.driverInfo.major}`}</Text>
                    <Text>{`${this.props.driverInfo.grade}`}</Text>
                    <Text>{`${this.props.driverInfo.car_color} ${this.props.driverInfo.car_number}`}</Text>
                  </View>

                  <View style={{ flex: 3 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name='map-marker' type='font-awesome' size={15} />
                      <Text style={{ paddingLeft: 5 }}>{`${offer.start}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name='flag-checkered' type='font-awesome' size={10} />
                      <Text style={{ paddingLeft: 5 }}>{`${offer.goal}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name='timer' /*type='font-awesome'*/ size={10} />
                      <Text style={{ paddingLeft: 5 }}>{`${offer.departure_time}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <Icon name='car' type='font-awesome' size={10} />
                      <Text style={{ paddingLeft: 5 }}>{`${offer.reserved_riders.length} / ${offer.rider_capacity}人`}</Text>
                    </View>
                  </View>
                </View>
              }
              onPress={() => this.onListItemPress(offer)}
            />
          );
        })}
      </View>
    );
  }


  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>

          <ButtonGroup
            buttons={[
              '登校',
              '下校'
            ]}
            selectedIndex={this.state.togekoIndex}
            onPress={(selectedIndex) =>
              this.setState({
                togekoIndex: selectedIndex,
                offerDetail: {
                  ...this.state.offerDetail,
                  start: selectedIndex===TOKO ? VDRUG : SHIZEN3ENTER_KOKUSAIKAIKAN,
                  goal: selectedIndex===TOKO ? KOKUSAIKAIKAN_SHIZEN3PARK : VDRUG,
                }
              })
            }
          />

          // Start picker
          <ListItem
            title={
              <View style={{ flexDirection: 'row' }}>
                <Icon name='map-marker' type='font-awesome' color='gray' />
                <Text style={styles.textStyle}>集合: </Text>
              </View>
            }
            subtitle={
              <View style={styles.listItemStyle}>
                <Text style={{ fontSize: 18 }}>
                  {this.state.offerDetail.start}
                </Text>
              </View>
            }
            rightIcon={{ name: this.state.startPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
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
                <Icon name='flag-checkered' type='font-awesome' color='gray' />
                <Text style={styles.textStyle}>到着: </Text>
              </View>
            }
            subtitle={
              <View style={styles.listItemStyle}>
                <Text style={{ fontSize: 18 }}>
                  {this.state.offerDetail.goal}
                </Text>
              </View>
            }
            rightIcon={{ name: this.state.goalPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
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
                    <Icon name='timer' /*type='font-awesome'*/ color='gray' />
                    <Text style={styles.textStyle}>出発時刻: </Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: this.state.offerDetail.departure_time === INITIAL_STATE.offerDetail.departure_time ? 'gray' : 'black'
                      }}
                    >
                      {this.state.offerDetail.departure_time}
                    </Text>
                  </View>

                }
                rightIcon={{ name: this.state.departureTimePickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
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
                    <Icon name='car' type='font-awesome' color='gray' />
                    <Text style={styles.textStyle}>空席: </Text>
                  </View>
                }
                subtitle={
                  <View style={styles.listItemStyle}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: this.state.offerDetail.rider_capacity === INITIAL_STATE.offerDetail.rider_capacity ? 'gray' : 'black'
                      }}
                    >
                      {this.state.offerDetail.rider_capacity}
                    </Text>
                  </View>
                }
                rightIcon={{ name: this.state.riderCapacityPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
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

          <Text style={styles.textStyle}>
            オファー中
          </Text>

          {this.renderOwnOffers()}

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  textStyle: {
    fontSize: 18,
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
    driverInfo: state.driverReducer.driverInfo
  };
};


export default connect(mapStateToProps, actions)(OfferScreen);
