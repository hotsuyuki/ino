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

  // for rider info
  riderInfo: {
    mail: '',
  }
};


class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // Get stored rider info
    try {
      let stringifiedRiderInfo = await AsyncStorage.getItem('riderInfo');
      let mail = JSON.parse(stringifiedRiderInfo).mail;

      // Try access login api
      try {
        let response = await fetch('https://inori.work/riders/signin', {
        //let response = await fetch('https://inori.work/riders/login', { TODO: Change URL
          method: 'POST',
          headers: {},
          body: JSON.stringify({ mail }),
        });

        // for debug
        //console.log('mail = ' + JSON.stringify({ mail }));

        // If succeed login with the stored email address,
        if (parseInt(response.status / 100, 10) === 2) {
          let responseJson = await response.json();
          const riderInfo = responseJson.rider;

          // for debug
          console.log('JSON.stringify(riderInfo) = ' + JSON.stringify(riderInfo));

          await AsyncStorage.setItem('riderInfo', JSON.stringify(riderInfo));

          console.log('Automatic login with the stored email address is succeeded!!!');
          this.setState({ isLogedin: true });
          this.props.navigation.navigate('offerList');

        // If cannot login with the stored email address,
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
    // If cannot get stored rider info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored rider info...');
      this.setState({ isLogedin: false });
    }
  }


  onLoginButtonPress = async () => {
    // Truncate whitespaces and add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    const mail = `${this.state.riderInfo.mail.replace(/\s/g, '').toLowerCase()}@stu.kanazawa-u.ac.jp`;

    // Try access login api
    try {
      let response = await fetch('https://inori.work/riders/signin', {
      //let response = await fetch('https://inori.work/riders/login', { TODO: Change URL
        method: 'POST',
        headers: {},
        body: JSON.stringify({ mail }),
      });

      // for debug
      //console.log('mail = ' + JSON.stringify({ mail }));

      // If succeed login with the stored email address,
      if (parseInt(response.status / 100, 10) === 2) {
        let responseJson = await response.json();
        const riderInfo = responseJson.rider;

        // for debug
        console.log('JSON.stringify(riderInfo) = ' + JSON.stringify(riderInfo));

        await AsyncStorage.setItem('riderInfo', JSON.stringify(riderInfo));

        console.log('Manual login with the input email address is succeeded!!!');
        this.setState({ isLogedin: true });
        this.props.navigation.navigate('offerList');

      // If cannot login with the stored email address,
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
    const loginButtonTitle = 'ログイン';

    // If email is entered
    if (this.state.riderInfo.mail !== INITIAL_STATE.riderInfo.mail) {
      return (
        // Activate the offer button
        <View style={{ padding: 20 }}>
          <Button
            title={loginButtonTitle}
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onLoginButtonPress}
          />
        </View>
      );
    }

    return (
      <View style={{ padding: 20 }}>
        <Button
          title={loginButtonTitle}
          color="white"
        />
      </View>
    );
  }


  render() {
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
                value={this.state.riderInfo.mail}
                onChangeText={(inputValue) => {
                  this.setState({
                    riderInfo: {
                      mail: inputValue
                    }
                  });
                }}
              />
            </View>
            <View style={{ flex: 2, justifyContent: 'flex-end' }}>
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
