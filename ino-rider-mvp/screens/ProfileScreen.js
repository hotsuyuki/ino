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
  componentWillMount() {
    // Reset the badge number to zero (iOS only)
    Notifications.setBadgeNumberAsync(0);

    // Call action creators
    this.props.getRiderInfo();
  }


  render() {
    // Wait to fetch own rider info
    if ((typeof this.props.riderInfo.id) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', padding: 10 }}>
            <Image
              style={{
                width: FACE_IMAGE_SIZE,
                height: FACE_IMAGE_SIZE,
                borderRadius: FACE_IMAGE_SIZE / 2
              }}
              source={
                this.props.riderInfo.image_url === '' ?
                require('../assets/face_image_placeholder.png') :
                { uri: this.props.riderInfo.image_url }
              }
            />
          </View>

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
                        await AsyncStorage.removeItem('riderInfo');

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
  grayTextStyle: {
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
    riderInfo: state.riderReducer.riderInfo
  };
};


export default connect(mapStateToProps, actions)(ProfileScreen);
