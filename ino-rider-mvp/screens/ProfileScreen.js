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
  componentWillMount() {
    // Call action creators
    this.props.fetchRiderInfo();
  }


  render() {
    // for debug
    console.log(`typeof this.props.riderInfo.id = ${typeof this.props.riderInfo.id}`);

    // Wait to fetch own rider info
    if ((typeof this.props.riderInfo.id) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <Icon name='person' size={100} style={{ justifyContent: 'center', padding: 30 }} />

          <Text style={styles.grayTextStyle}>氏名</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.riderInfo.last_name} ${this.props.riderInfo.first_name}`}</Text>

          <Text style={styles.grayTextStyle}>学類/専攻</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.riderInfo.major}`}</Text>

          <Text style={styles.grayTextStyle}>学年</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.riderInfo.grade}`}</Text>

          <Text style={styles.grayTextStyle}>メールアドレス</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.riderInfo.mail}`}</Text>

          <Text style={styles.grayTextStyle}>電話番号</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.riderInfo.phone}`}</Text>

          <View style={{ padding: 20 }}>
            <Button
              title="Reset `isLogedin` and `riderInfo` in AsyncStorage"
              buttonStyle={{ backgroundColor: 'red' }}
              onPress={async () => {
                //await AsyncStorage.removeItem('isLogedin');
                await AsyncStorage.removeItem('riderInfo');

                Alert.alert(
                  'Reset',
                  '`riderInfo` in AsyncStorage has been removed.',
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
  grayTextStyle: {
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
    riderInfo: state.riderReducer.riderInfo
  };
};


export default connect(mapStateToProps, actions)(ProfileScreen);
