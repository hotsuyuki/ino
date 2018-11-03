import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Linking
} from 'react-native';
import { Button, Icon } from 'react-native-elements';

// TODO: Use API
import { riderPhoneTmp } from '../assets/tmpData';

const INITIAL_STATE = {
  selectedOffer: {
    start: '-----',
    goal: '-----',
    departure_time: '-/-  --:--',
    rider_capacity: '---',
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
    const offerId = this.props.navigation.getParam('offerId', '0');

    // Reget the selected offer
    try {
      let response = await fetch(`https://inori.work/offers/${offerId}`);
      let responseJson = await response.json();
      this.setState({
        selectedOffer: responseJson.offer
      });
    } catch (error) {
      console.error(error);
    }
  }


  onCancelOfferButtonPress = () => {
    Alert.alert(
      '相乗りオファーをキャンセルしてよろしいですか？',
      '既に予約されたライダー達には通知が行きます。',
      [
        { text: 'いいえ' },
        {
          text: 'はい',
          onPress: async () => {
            // The params passed from the previous page
            const offerId = this.props.navigation.getParam('offerId', '0');

            // DELETE the selected offer
            try {
              let response = await fetch(`https://inori.work/offers/${offerId}`);
              let responseJson = await response.json();
              console.log(responseJson);
            } catch (error) {
              console.error(error);
            }

            this.props.navigation.pop();
          },
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  }


  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>

          <View>
            <Text style={styles.textStyle}>情報</Text>

            <View style={{ alignItems: 'center' }}>
              <View>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name='map-marker' type='font-awesome' size={30} />
                  <Text style={{ padding: 5, fontSize: 25 }}>{`${this.state.selectedOffer.start}`}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name='flag-checkered' type='font-awesome' size={20} />
                  <Text style={{ padding: 5, fontSize: 25 }}>{`${this.state.selectedOffer.goal}`}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name='timer' /*type='font-awesome'*/ size={20} />
                  <Text style={{ padding: 5, fontSize: 25 }}>{`${this.state.selectedOffer.departure_time}`}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name='car' type='font-awesome' size={20} />
                  <Text style={{ padding: 5, fontSize: 25 }}>{`${this.state.selectedOffer.reserved_riders.length} / ${this.state.selectedOffer.rider_capacity}人`}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ paddingTop: 10 }}>
            <Text style={styles.textStyle}>ライダー</Text>

            {this.state.selectedOffer.reserved_riders.map((rider, index) => {
              return (
                <View
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  key={index}
                >
                  <View style={{ flex: 1 }}>
                    <Icon name='person' />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={{ fontSize: 25, paddingBottom: 5 }}>{`${rider.last_name} ${rider.first_name}`}</Text>
                    <Text style={{ fontSize: 18 }}>{`${rider.major}`}</Text>
                    <Text style={{ fontSize: 18 }}>{`${rider.grade}`}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Icon
                      name='comment'
                      type='font-awesome'
                      raised
                      //onPress={() => Linking.openURL(`sms:${rider.phone}`)}
                      onPress={() => Linking.openURL(`sms:${riderPhoneTmp}`)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Icon
                      name='phone'
                      type='font-awesome'
                      raised
                      //onPress={() => Linking.openURL(`tel:${rider.phone}`)}
                      onPress={() => Linking.openURL(`tel:${riderPhoneTmp}`)}
                    />
                  </View>
                </View>
              );
            })}
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
  textStyle: {
    fontSize: 18,
    color: 'gray',
    padding: 10,
  },
});


export default DetailScreen;
