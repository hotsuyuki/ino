import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Image,
  AsyncStorage,
} from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { AppLoading, Notifications } from 'expo';

import * as actions from '../actions';


const FACE_IMAGE_SIZE = 120;


class ProfileScreen extends React.Component {
  async componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Call action creators
    this.props.getDriverInfo();
  }


  render() {
    // Wait to fetch own driver info
    if ((typeof this.props.driverInfo.id) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', padding: 10 }}>
            <Image
              style={{ width: FACE_IMAGE_SIZE, height: FACE_IMAGE_SIZE, borderRadius: FACE_IMAGE_SIZE / 2 }}
              source={
                this.props.driverInfo.image_url === '' ?
                require('../assets/face_image_placeholder.png') :
                { uri: this.props.driverInfo.image_url }
              }
            />
          </View>

          <Text style={styles.itemTextStyle}>氏名</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.last_name} ${this.props.driverInfo.first_name}`}</Text>

          <Text style={styles.itemTextStyle}>学類/専攻</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.major}`}</Text>

          <Text style={styles.itemTextStyle}>学年</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.grade}`}</Text>

          <Text style={styles.itemTextStyle}>車の色とナンバー</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.car_color} ${this.props.driverInfo.car_number}`}</Text>

          <Text style={styles.itemTextStyle}>メールアドレス</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.mail}`}</Text>

          <Text style={styles.itemTextStyle}>電話番号</Text>
          <Text style={styles.contentTextStyle}>{`${this.props.driverInfo.phone}`}</Text>

          <View style={{ padding: 20 }}>
            <Button
              title="ログアウト"
              buttonStyle={{ backgroundColor: 'red' }}
              onPress={() => {
                Alert.alert(
                  '',
                  'ログアウトしてもよろしいですか？',
                  [
                    { text: 'いいえ' },
                    {
                      text: 'はい',
                      onPress: async () => {
                        await AsyncStorage.removeItem('driverInfo');

                        this.props.navigation.pop();
                        this.props.navigation.navigate('login');
                      },
                      style: 'destructive'
                     },
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
    color: 'gray',
    padding: 10,
  },
  contentTextStyle: {
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
