import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Picker,
  LayoutAnimation, UIManager, AsyncStorage
} from 'react-native';
import { Header, Button, FormLabel, FormInput, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { AppLoading } from 'expo';

import * as actions from '../actions';

// TODO: Use API
import { driverIdTmp } from '../assets/tmpData';


const INITIAL_STATE = {
  // for <Picker />
  gradePickerVisible: false,
  //majorPickerVisible: false,

  // for drive's info
  initialDriverInfo: {
    id: 0,
    first_name: '---',
    last_name: '---',
    grade: '---',
    major: '---',
    mail: '---',
    phone: '---',
    car_color: '---',
    car_number: '---'
  },
  editedDriverInfo: {
    id: 0,
    first_name: '---',
    last_name: '---',
    grade: '---',
    major: '---',
    mail: '---',
    phone: '---',
    car_color: '---',
    car_number: '---'
  },
};


class EditProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  async componentWillMount() {
    // Call an action creator
    this.props.fetchDriverInfo();

    const driverInfo = this.props.driverInfo;
    // Replace "+81" to "0" // TODO: Make it more robust
    driverInfo.phone = `0${driverInfo.phone.substring(3)}`;
    // Truncate "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    driverInfo.mail = driverInfo.mail.replace('@stu.kanazawa-u.ac.jp', '');

    this.setState({
      initialDriverInfo: driverInfo,
      editedDriverInfo: driverInfo,
    });
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
          selectedValue={this.state.editedDriverInfo.grade}
          onValueChange={(itemValue) => this.setState({
            editedDriverInfo: {
              ...this.state.editedDriverInfo,
              grade: itemValue
            },
          })}
        >
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


  onDoneButtonPress = () => {
    Alert.alert(
      '編集内容を保存しますか？',
      '',
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            const editedDriverInfo = this.state.editedDriverInfo;
            // Elace hyphens (just in case)
            editedDriverInfo.phone = editedDriverInfo.phone.replace(/-/g, '');
            // Replace "0" to "+81" // TODO: Make it more robust
            editedDriverInfo.phone = `+81${editedDriverInfo.phone.substring(1)}`;

            // TODO: PUT
            // PUT the edited profile
            try {
              let response = await fetch('https://inori.work/drivers', {
                method: 'PUT',
                headers: {},
                body: JSON.stringify({ editedDriverInfo }),
              });

              // TODO: Save responded `driverInfo` into `AsyncStorage`
              //let responseJson = await response.json();
              try {
                //await AsyncStorage.setItem('driverInfo', JSON.stringify(responseJson.driver));
                await AsyncStorage.setItem('driverInfo', JSON.stringify(editedDriverInfo));
              } catch (error) {
                console.warn(error);
              }

              // Reflesh `this.props.driverInfo` in `ProfileScreen`
              // and make `ProfileScreen` rerender by calling an action creator
              this.props.fetchDriverInfo();

              this.props.navigation.pop();
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


  renderDoneButton() {
    // `this.state.editedDriverInfo` is default or not
    let isDefault = true;
    // If at least one of `editedDriverInfo` is NOT default value,
    Object.keys(this.state.editedDriverInfo).forEach((key) => {
      if (this.state.editedDriverInfo[key] !== this.state.initialDriverInfo[key]) {
        isDefault = false;
      }
    });

    const doneButtonTitle = '完了';

    // If all pickers are closed and `this.state.editedDriverInfo` is not default,
    if (!this.state.gradePickerVisible &&
        //!this.state.majorPickerVisible &&
        !isDefault) {
      return (
        // Activate the offer button
        <View style={{ padding: 20 }}>
          <Button
            title={doneButtonTitle}
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onDoneButtonPress}
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
    // Wait to fetch own driver's info
    if ((typeof this.props.driverInfo.phone) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <Header
          statusBarProps={{ barStyle: 'light-content' }}
          backgroundColor="gray"
          leftComponent={{
            icon: 'close',
            color: 'white',
            onPress: () => {
              Alert.alert(
                'プロフィール編集を中止しますか？',
                '入力された内容は保存されません。',
                [
                  { text: 'いいえ' },
                  {
                    text: 'はい',
                    onPress: () => this.props.navigation.pop(),
                    style: 'destructive'
                  }
                ],
                { cancelable: false }
              );
            }
          }}
          centerComponent={{ text: 'プロフィール編集', style: styles.headerStyle }}
        />

        <ScrollView style={{ flex: 1 }}>
          <FormLabel>姓：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.editedDriverInfo.last_name}
            onChangeText={(inputValue) => {
              this.setState({
                editedDriverInfo: {
                  ...this.state.editedDriverInfo,
                  last_name: inputValue
                }
              });
            }}
          />

          <FormLabel>名：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.editedDriverInfo.first_name}
            onChangeText={(inputValue) => {
              this.setState({
                editedDriverInfo: {
                  ...this.state.editedDriverInfo,
                  first_name: inputValue
                }
              });
            }}
          />

          <ListItem
            title="学年："
            subtitle={`${this.state.editedDriverInfo.grade}`}
            rightIcon={{ name: this.state.gradePickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
            onPress={() => this.setState({
              gradePickerVisible: !this.state.gradePickerVisible,
            })}
          />

          {this.renderGradePicker()}

          {/* TODO: Change major form input to major picker */}
          <FormLabel>学類/専攻：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.editedDriverInfo.major}
            onChangeText={(inputValue) => {
              this.setState({
                editedDriverInfo: {
                  ...this.state.editedDriverInfo,
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
                value={this.state.editedDriverInfo.mail}
                onChangeText={(inputValue) => {
                  this.setState({
                    editedDriverInfo: {
                      ...this.state.editedDriverInfo,
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
            value={this.state.editedDriverInfo.phone}
            onChangeText={(inputValue) => {
              this.setState({
                editedDriverInfo: {
                  ...this.state.editedDriverInfo,
                  phone: inputValue
                }
              });
            }}
          />

          <FormLabel>車の色：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.editedDriverInfo.car_color}
            onChangeText={(inputValue) => {
              this.setState({
                editedDriverInfo: {
                  ...this.state.editedDriverInfo,
                  car_color: inputValue
                }
              });
            }}
          />

          <FormLabel>車のナンバー：</FormLabel>
          <FormInput
            autoCapitalize="none"
            keyboardType="numeric"
            value={this.state.editedDriverInfo.car_number}
            onChangeText={(inputValue) => {
              this.setState({
                editedDriverInfo: {
                  ...this.state.editedDriverInfo,
                  car_number: inputValue
                }
              });
            }}
          />

          {this.renderDoneButton()}

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


const mapStateToProps = (state) => {
  return {
    driverInfo: state.driverReducer.driverInfo
  };
};


export default connect(mapStateToProps, actions)(EditProfileScreen);
