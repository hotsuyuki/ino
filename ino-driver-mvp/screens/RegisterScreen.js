import _ from 'lodash';
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Picker,
  LayoutAnimation, UIManager, AsyncStorage
} from 'react-native';
import { Header, Button, FormLabel, FormInput, ListItem } from 'react-native-elements';
import { AppLoading } from 'expo';


const INITIAL_STATE = {
  // for skipping this screen or not
  isRegistered: null,

  // for <Picker />
  gradePickerVisible: false,
  //majorPickerVisible: false,

  // for drive's info
  driverInfo: {
    first_name: '',
    last_name: '',
    grade: '学年を選択して下さい',
    major: '',
    mail: '',
    phone: '',
    car_color: '',
    car_number: ''
  }
};


class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    let isRegisteredString = await AsyncStorage.getItem('isRegistered');

    if (isRegisteredString === 'true') {
      this.setState({ isRegistered: true });
      this.props.navigation.navigate('root');
    } else {
      this.setState({ isRegistered: false });
    }
  }


  componentWillUpdate() {
    // Ease in & Ease out animation
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.easeInEaseOut();
  }


  renderGradePicker() {
    if (this.state.gradePickerVisible) {
      return (
        <Picker
          selectedValue={this.state.driverInfo.grade}
          onValueChange={(itemValue) => this.setState({
            driverInfo: {
              ...this.state.driverInfo,
              grade: itemValue
            },
          })}
        >
          <Picker.Item label={INITIAL_STATE.driverInfo.grade} value={INITIAL_STATE.driverInfo.grade} />
          <Picker.Item label="学部1年" value="学部1年" />
          <Picker.Item label="学部2年" value="学部2年" />
          <Picker.Item label="学部3年" value="学部3年" />
          <Picker.Item label="学部4年" value="学部4年" />
          <Picker.Item label="修士1年" value="修士1年" />
          <Picker.Item label="修士2年" value="修士2年" />
          <Picker.Item label="博士1年" value="博士1年" />
          <Picker.Item label="博士2年" value="博士2年" />
          <Picker.Item label="博士3年" value="博士3年" />
        </Picker>
      );
    }
  }


  onRegisterButtonPress = () => {
    Alert.alert(
      'この内容で登録しますか？',
      '',
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            const driverInfo = this.state.driverInfo;
            // Elace hyphens (just in case)
            driverInfo.phone = driverInfo.phone.replace(/-/g, '');
            // Replace "0" to "+81" // TODO: Make it more robust
            driverInfo.phone = `+81${driverInfo.phone.substring(1)}`;
            // Add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
            driverInfo.mail = `${driverInfo.mail}@stu.kanazawa-u.ac.jp`;

            // TODO: POST
            // POST the input profile
            try {
              let response = await fetch('https://inori.work/drivers', {
                method: 'POST',
                headers: {},
                body: JSON.stringify({ driverInfo }),
              });

              // TODO: Save responded `driverInfo` into `AsyncStorage`
              //let responseJson = await response.json();
              try {
                //await AsyncStorage.setItem('driverInfo', JSON.stringify(responseJson.driver));
                await AsyncStorage.setItem('driverInfo', JSON.stringify(driverInfo));
              } catch (error) {
                console.warn(error);
              }

              // AsyncStorage can't store boolean, so use string instead
              await AsyncStorage.setItem('isRegistered', 'true');

              this.props.navigation.navigate('root');
            } catch (error) {
              console.error(error);

              Alert.alert(
                '電波の良いところで後ほどお試しください。',
                '編集内容は保存されていません。',
                [
                  { text: 'OK' },
                ]
              );
            }
          }
        }
      ],
      { cancelable: false }
    );
  }


  renderRegisterButton() {
    // `this.state.driverInfo` is completed or not
    let isCompleted = true;
    // If at least one of `driverInfo` is default value,
    Object.keys(this.state.driverInfo).forEach((key) => {
      if (this.state.driverInfo[key] === INITIAL_STATE.driverInfo[key]) {
        isCompleted = false;
      }
    });

    const doneButtonTitle = '新規登録';

    // If all pickers are closed and `this.state.driverInfo` is completed,
    if (!this.state.gradePickerVisible &&
        //!this.state.majorPickerVisible &&
        isCompleted) {
      return (
        // Activate the offer button
        <View style={{ padding: 20 }}>
          <Button
            title={doneButtonTitle}
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onRegisterButtonPress}
          />
        </View>
      );
    }

    return (
      <View style={{ padding: 20 }}>
        <Button
          title={doneButtonTitle}
          color="white"
        />
      </View>
    );
  }


  render() {
    if (_.isNull(this.state.isRegistered)) {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <Header
          statusBarProps={{ barStyle: 'light-content' }}
          backgroundColor="gray"
          centerComponent={{ text: '新規登録', style: styles.headerStyle }}
        />

        <ScrollView style={{ flex: 1 }}>
          <FormLabel>姓：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.driverInfo.last_name}
            onChangeText={(inputValue) => {
              this.setState({
                driverInfo: {
                  ...this.state.driverInfo,
                  last_name: inputValue
                }
              });
            }}
          />

          <FormLabel>名：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.driverInfo.first_name}
            onChangeText={(inputValue) => {
              this.setState({
                driverInfo: {
                  ...this.state.driverInfo,
                  first_name: inputValue
                }
              });
            }}
          />

          <ListItem
            title="学年："
            subtitle={`${this.state.driverInfo.grade}`}
            rightIcon={{ name: this.state.startPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
            onPress={() => this.setState({
              gradePickerVisible: !this.state.gradePickerVisible,
            })}
          />

          {this.renderGradePicker()}

          {/* TODO: Change major form input to major picker */}
          <FormLabel>学類/専攻：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.driverInfo.major}
            onChangeText={(inputValue) => {
              this.setState({
                driverInfo: {
                  ...this.state.driverInfo,
                  major: inputValue
                }
              });
            }}
          />

          <FormLabel>メールアドレス：</FormLabel>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 3 }}>
              <FormInput
                autoCapitalize="none"
                value={this.state.driverInfo.mail}
                onChangeText={(inputValue) => {
                  this.setState({
                    driverInfo: {
                      ...this.state.driverInfo,
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

          <FormLabel>電話番号（ハイフンなし）：</FormLabel>
          <FormInput
            autoCapitalize="none"
            keyboardType="numeric"
            value={this.state.driverInfo.phone}
            onChangeText={(inputValue) => {
              this.setState({
                driverInfo: {
                  ...this.state.driverInfo,
                  phone: inputValue
                }
              });
            }}
          />

          <FormLabel>車の色：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.driverInfo.car_color}
            onChangeText={(inputValue) => {
              this.setState({
                driverInfo: {
                  ...this.state.driverInfo,
                  car_color: inputValue
                }
              });
            }}
          />

          <FormLabel>車のナンバー：</FormLabel>
          <FormInput
            autoCapitalize="none"
            keyboardType="numeric"
            value={this.state.driverInfo.car_number}
            onChangeText={(inputValue) => {
              this.setState({
                driverInfo: {
                  ...this.state.driverInfo,
                  car_number: inputValue
                }
              });
            }}
          />

          {this.renderRegisterButton()}

        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  headerStyle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
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


export default RegisterScreen;
