import React from 'react';
import {
  StyleSheet, Text, View, Alert,
  AsyncStorage
} from 'react-native';
import { Button, FormLabel, FormInput } from 'react-native-elements';
import { AppLoading } from 'expo';


const INITIAL_STATE = {
  // for skipping this screen or not
  isLogedin: null,

  // for driver info
  driverInfo: {
    mail: '',
  }
};


class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // Get stored driver info
    try {
      let stringifiedDriverInfo = await AsyncStorage.getItem('driverInfo');
      let mail = JSON.parse(stringifiedDriverInfo).mail;

      // Try access login api
      try {
        let response = await fetch('https://inori.work/drivers/signin', {
        //let response = await fetch('https://inori.work/drivers/login', { TODO: Change URL
          method: 'POST',
          headers: {},
          body: JSON.stringify({ mail }),
        });

        // for debug
        //console.log('mail = ' + JSON.stringify({ mail }));

        // If succeed to login with the stored email address,
        if (parseInt(response.status / 100, 10) === 2) {
          let responseJson = await response.json();
          const driverInfo = responseJson.driver;

          // for debug
          console.log('JSON.stringify(driverInfo) = ' + JSON.stringify(driverInfo));

          await AsyncStorage.setItem('driverInfo', JSON.stringify(driverInfo));

          console.log('Automatic login with the stored email address is succeeded!!!');
          this.setState({ isLogedin: true });
          this.props.navigation.navigate('offerList');

        // If failed login with the stored email address,
        } else if (parseInt(response.status / 100, 10) === 4 ||
                   parseInt(response.status / 100, 10) === 5) {
          console.log('Automatic login with the stored email address failed...');
          this.setState({ isLogedin: false });
        }
      // If cannot access the login api,
      } catch (error) {
        console.warn(error);
        console.log('Cannot access the login api...');
        this.setState({ isLogedin: false });
      }
    // If cannot get stored driver info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored driver info...');
      this.setState({ isLogedin: false });
    }
  }


  onLoginButtonPress = async () => {
    // Truncate whitespaces and add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    const mail = `${this.state.driverInfo.mail.replace(/\s/g, '').toLowerCase()}@stu.kanazawa-u.ac.jp`;

    // Try access login api
    try {
      let response = await fetch('https://inori.work/drivers/signin', {
      //let response = await fetch('https://inori.work/drivers/login', { TODO: Change URL
        method: 'POST',
        headers: {},
        body: JSON.stringify({ mail }),
      });

      // for debug
      //console.log('mail = ' + JSON.stringify({ mail }));

      // If succeed login with the stored email address,
      if (parseInt(response.status / 100, 10) === 2) {
        let responseJson = await response.json();
        const driverInfo = responseJson.driver;

        // for debug
        console.log('JSON.stringify(driverInfo) = ' + JSON.stringify(driverInfo));

        await AsyncStorage.setItem('driverInfo', JSON.stringify(driverInfo));

        console.log('Manual login with the input email address is succeeded!!!');
        this.setState({ isLogedin: true });
        this.props.navigation.navigate('offerList');

      // If failed to login with the stored email address,
      } else if (parseInt(response.status / 100, 10) === 4 ||
                 parseInt(response.status / 100, 10) === 5) {
        console.log('Manual login with the input email address failed...');

        Alert.alert(
          'アカウントを確認できませんでした。',
          'アカウントを新規登録をするかもしくは電波の良いところで後ほどお試しください。',
          [
            { text: 'OK' },
          ]
        );
      }
    // If cannot access the login api,
    } catch (error) {
      console.warn(error);
      console.log('Cannot access the login api...');

      Alert.alert(
        'エラーが発生しました。',
        '電波の良いところで後ほどお試しください。',
        [
          { text: 'OK' },
        ]
      );
    }
  }


  renderLoginButton() {
    return (
      <View style={{ padding: 20 }}>
        <Button
          // If email is not entered, inactivate the button
          disabled={this.state.driverInfo.mail === INITIAL_STATE.driverInfo.mail}
          title="ログイン"
          color="white"
          buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
          onPress={this.onLoginButtonPress}
        />
      </View>
    );
  }


  render() {
    //if (_.isNull(this.state.isLogedin)) {
    if (this.state.isLogedin === INITIAL_STATE.isLogedin) {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 2, justifyContent: 'center' }}>
          <FormLabel>メールアドレス：</FormLabel>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 3 }}>
              <FormInput
                autoCapitalize="none"
                keyboardType="email-address"
                value={this.state.driverInfo.mail}
                onChangeText={(inputValue) => {
                  this.setState({
                    driverInfo: {
                      mail: inputValue
                    }
                  });
                }}
                //containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
              />
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12 }}>@stu.kanazawa-u.ac.jp</Text>
            </View>
          </View>

          {this.renderLoginButton()}

        </View>

        <View style={{ flex: 3 }}>
          <View style={{ alignItems: 'center' }}>
            <Text>もしくは新規登録はこちら</Text>
          </View>

          <View style={{ padding: 20 }}>
            <Button
              title="新規登録"
              color="white"
              buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
              onPress={() => this.props.navigation.navigate('signup')}
            />
          </View>
        </View>

      </View>
    );
  }
}


const styles = StyleSheet.create({
});


export default LoginScreen;
