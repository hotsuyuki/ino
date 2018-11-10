import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
  AsyncStorage,
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { AppLoading } from 'expo';

import * as actions from '../actions';


class ProfileScreen extends React.Component {
  async componentWillMount() {
    // Call an action creator
    this.props.fetchDriverInfo();
  }


  render() {
    // Wait to fetch own driver's info
    if ((typeof this.props.driverInfo.phone) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <Icon name='person' size={100} style={{ justifyContent: 'center', padding: 30 }} />

          <Text style={styles.itemTextStyle}>氏名</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.last_name} ${this.props.driverInfo.first_name}`}</Text>

          <Text style={styles.itemTextStyle}>学類/専攻</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.major}`}</Text>

          <Text style={styles.itemTextStyle}>学年</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.grade}`}</Text>

          <Text style={styles.itemTextStyle}>メールアドレス</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.mail}`}</Text>

          <Text style={styles.itemTextStyle}>電話番号</Text>
          {/* //Replace "+81" to "0" // TODO: Make it more robust */}
          <Text style={styles.contentTextStyle}>{`0${this.props.driverInfo.phone.substring(3)}`}</Text>

          <Text style={styles.itemTextStyle}>車の色とナンバー</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.car_color} ${this.props.driverInfo.car_number}`}</Text>

          <View style={{ padding: 20 }}>
            <Button
              title="Reset `isRegistered` in AsyncStorage"
              buttonStyle={{ backgroundColor: 'red' }}
              onPress={async () => {
                await AsyncStorage.removeItem('isRegistered');

                Alert.alert(
                  'Reset',
                  '`isRegistered` in AsyncStorage has been removed.',
                  [
                    { text: 'OK' },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </View>

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  itemTextStyle: {
    fontSize: 18,
    color: 'gray',
    padding: 10,
  },
  contentTextStyle: {
    fontSize: 18,
    color: 'black',
    paddingLeft: 30,
  },
});


const mapStateToProps = (state) => {
  return {
    driverInfo: state.driverReducer.driverInfo
  };
};


export default connect(mapStateToProps, actions)(ProfileScreen);
