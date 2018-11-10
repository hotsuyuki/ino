import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Picker,
  LayoutAnimation, UIManager, AsyncStorage, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Button, FormLabel, FormInput, ListItem } from 'react-native-elements';


const INITIAL_STATE = {
  // for <Picker />
  gradePickerVisible: false,
  majorPickerVisible: false,

  // for rider's info
  riderInfo: {
    first_name: '',
    last_name: '',
    grade: '学年を選択して下さい',
    major: '学類/専攻を選択して下さい',
    mail: '',
    phone: '',
  }
};


class SignupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
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
          selectedValue={this.state.riderInfo.grade}
          onValueChange={(itemValue) => this.setState({
            riderInfo: {
              ...this.state.riderInfo,
              grade: itemValue
            },
          })}
        >
          <Picker.Item label={INITIAL_STATE.riderInfo.grade} value={INITIAL_STATE.riderInfo.grade} />

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


  renderMajorPicker() {
    if (this.state.majorPickerVisible) {
      const gradeCourse = this.state.riderInfo.grade.slice(0, 2);

      if (gradeCourse === '学部') {
        return (
          <Picker
            selectedValue={this.state.riderInfo.major}
            onValueChange={(itemValue) => this.setState({
              riderInfo: {
                ...this.state.riderInfo,
                major: itemValue
              },
            })}
          >
            <Picker.Item label={INITIAL_STATE.riderInfo.major} value={INITIAL_STATE.riderInfo.major} />

            <Picker.Item label="人文学類" value="人文学類" />
            <Picker.Item label="法学類" value="法学類" />
            <Picker.Item label="経済学類" value="経済学類" />
            <Picker.Item label="学校教育学類" value="学校教育学類" />
            <Picker.Item label="地域創造学類" value="地域創造学類" />
            <Picker.Item label="国際学類" value="国際学類" />

            <Picker.Item label="数物科学類" value="数物科学類" />
            <Picker.Item label="物質化学類" value="物質化学類" />
            <Picker.Item label="機械工学類" value="機械工学類" />
            <Picker.Item label="フロンティア工学類" value="フロンティア工学類" />
            <Picker.Item label="電子情報通信学類" value="電子情報通信学類" />
            <Picker.Item label="地球社会基盤学類" value="地球社会基盤学類" />
            <Picker.Item label="生命理工学類" value="生命理工学類" />

            <Picker.Item label="医学類" value="医学類" />
            <Picker.Item label="薬学類・創薬科学類" value="薬学類・創薬科学類" />
            <Picker.Item label="保険学類" value="保険学類" />

            <Picker.Item label="その他" value="その他" />
          </Picker>
        );
      } else if (gradeCourse === '修士') {
        return (
          <Picker
            selectedValue={this.state.riderInfo.major}
            onValueChange={(itemValue) => this.setState({
              riderInfo: {
                ...this.state.riderInfo,
                major: itemValue
              },
            })}
          >
            <Picker.Item label={INITIAL_STATE.riderInfo.major} value={INITIAL_STATE.riderInfo.major} />

            <Picker.Item label="人文学専攻" value="人文学専攻" />
            <Picker.Item label="法学・政治学専攻" value="法学・政治学専攻" />
            <Picker.Item label="経済学専攻" value="経済学専攻" />
            <Picker.Item label="地域創造学専攻" value="地域創造学専攻" />
            <Picker.Item label="国際学専攻" value="国際学専攻" />

            <Picker.Item label="数物科学専攻" value="数物科学専攻" />
            <Picker.Item label="物質化学専攻" value="物質化学専攻" />
            <Picker.Item label="機械科学専攻" value="機械科学専攻" />
            <Picker.Item label="電子情報科学専攻" value="電子情報科学専攻" />
            <Picker.Item label="環境デザイン学専攻" value="環境デザイン学専攻" />
            <Picker.Item label="自然システム学専攻" value="自然システム学専攻" />
            <Picker.Item label="融合科学共同専攻" value="融合科学共同専攻" />

            <Picker.Item label="医科学専攻" value="医科学専攻" />
            <Picker.Item label="創薬科学・薬学専攻" value="創薬科学・薬学専攻" />
            <Picker.Item label="保険学専攻" value="保険学専攻" />

            <Picker.Item label="先進予防医学研究科" value="先進予防医学研究科" />
            <Picker.Item label="連合小児発達学研究科" value="連合小児発達学研究科" />
            <Picker.Item label="法務研究科（法科大学院）" value="法務研究科（法科大学院）" />
            <Picker.Item label="教職実践研究科" value="教職実践研究科" />

            <Picker.Item label="その他" value="その他" />
          </Picker>
        );
      } else if (gradeCourse === '博士') {
        return (
          <Picker
            selectedValue={this.state.riderInfo.major}
            onValueChange={(itemValue) => this.setState({
              riderInfo: {
                ...this.state.riderInfo,
                major: itemValue
              },
            })}
          >
            <Picker.Item label={INITIAL_STATE.riderInfo.major} value={INITIAL_STATE.riderInfo.major} />

            <Picker.Item label="人文学コース" value="人文学コース" />
            <Picker.Item label="法学・政治学コース" value="法学・政治学コース" />
            <Picker.Item label="社会経済学コース" value="社会経済学コース" />

            <Picker.Item label="数物科学専攻" value="数物科学専攻" />
            <Picker.Item label="物質化学専攻" value="物質化学専攻" />
            <Picker.Item label="機械科学専攻" value="機械科学専攻" />
            <Picker.Item label="電子情報科学専攻" value="電子情報科学専攻" />
            <Picker.Item label="環境デザイン学専攻" value="環境デザイン学専攻" />
            <Picker.Item label="自然システム学専攻" value="自然システム学専攻" />
            <Picker.Item label="融合科学共同専攻" value="融合科学共同専攻" />

            <Picker.Item label="医科学専攻" value="医科学専攻" />
            <Picker.Item label="創薬科学・薬学専攻" value="創薬科学・薬学専攻" />
            <Picker.Item label="保険学専攻" value="保険学専攻" />

            <Picker.Item label="先進予防医学研究科" value="先進予防医学研究科" />
            <Picker.Item label="連合小児発達学研究科" value="連合小児発達学研究科" />
            <Picker.Item label="法務研究科（法科大学院）" value="法務研究科（法科大学院）" />
            <Picker.Item label="教職実践研究科" value="教職実践研究科" />

            <Picker.Item label="その他" value="その他" />
          </Picker>
        );
      } else {
        return (
          <Picker
            selectedValue={this.state.riderInfo.major}
            onValueChange={(itemValue) => this.setState({
              riderInfo: {
                ...this.state.riderInfo,
                major: itemValue
              },
            })}
          >
            <Picker.Item label={INITIAL_STATE.riderInfo.major} value={INITIAL_STATE.riderInfo.major} />
          </Picker>
        );
      }
    }
  }


  onOkButtonPress = async () => {
    const riderInfo = this.state.riderInfo;

    // Add temporary `id`
    riderInfo.id = 0;
    // Add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    riderInfo.mail = `${riderInfo.mail}@stu.kanazawa-u.ac.jp`;
    // Elace hyphens (just in case)
    riderInfo.phone = riderInfo.phone.replace(/-/g, '');

    // Try access signup api
    try {
      let response = await fetch('https://inori.work/riders/signup', {
        method: 'POST',
        headers: {},
        body: JSON.stringify(riderInfo),
      });

      // If succeed signup with the input rider info,
      if (parseInt(response.status / 100, 10) === 2) {
        let responseJson = await response.json();
        riderInfo.id = responseJson.id;

        // for debug
        //console.log('responseJson = ' + JSON.stringify(responseJson));
        console.log('riderInfo = ' + JSON.stringify(riderInfo));

        await AsyncStorage.setItem('riderInfo', JSON.stringify(riderInfo));

        console.log('Manual signup with the input rider info is succeeded!!!');
        this.props.navigation.navigate('root');

      // If cannot signup with the input rider info,
      } else if (parseInt(response.status / 100, 10) === 4 ||
                 parseInt(response.status / 100, 10) === 5) {
        console.log('Manual signup with the input rider info is failed...');

        Alert.alert(
          'エラーが発生しました。',
          '編集内容は保存されていません。電波の良いところで後ほどお試しください。',
          [
            { text: 'OK' },
          ]
        );
      }
    // If cannot access the signup api,
    } catch (error) {
      console.error(error);
      console.log('Cannot access the signup api...');

      Alert.alert(
        'エラーが発生しました。',
        '編集内容は保存されていません。電波の良いところで後ほどお試しください。',
        [
          { text: 'OK' },
        ]
      );
    }
  }


  onSignupButtonPress = () => {
    Alert.alert(
      'この内容で登録しますか？',
      `
      氏名：${this.state.riderInfo.last_name} ${this.state.riderInfo.first_name} \n
      学年：${this.state.riderInfo.grade} \n
      学類/専攻：${this.state.riderInfo.major} \n
      メールアドレス：${this.state.riderInfo.mail}@stu.kanazawa-u.ac.jp \n
      電話番号：${this.state.riderInfo.phone.replace(/-/g, '')} \n
      `,
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: this.onOkButtonPress
        }
      ],
      { cancelable: false }
    );
  }


  renderSignupButton() {
    // `this.state.riderInfo` is completed or not
    let isCompleted = true;
    // If at least one of `riderInfo` is default value,
    Object.keys(this.state.riderInfo).forEach((key) => {
      if (this.state.riderInfo[key] === INITIAL_STATE.riderInfo[key]) {
        isCompleted = false;
      }
    });

    const signupButtonTitle = '新規登録';

    // If all pickers are closed and `this.state.riderInfo` is completed,
    if (!this.state.gradePickerVisible &&
        !this.state.majorPickerVisible &&
        isCompleted) {
      return (
        // Activate the offer button
        <View style={{ padding: 20 }}>
          <Button
            title={signupButtonTitle}
            color="white"
            buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
            onPress={this.onSignupButtonPress}
          />
        </View>
      );
    }

    return (
      <View style={{ padding: 20 }}>
        <Button
          title={signupButtonTitle}
          color="white"
        />
      </View>
    );
  }


  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 /*, justifyContent: 'center'*/ }}
        behavior={Platform.OS === 'ios' ? 'padding' : ''}
      >
        <ScrollView style={{ flex: 1 }}>
          <FormLabel>姓：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.riderInfo.last_name}
            onChangeText={(inputValue) => {
              this.setState({
                riderInfo: {
                  ...this.state.riderInfo,
                  last_name: inputValue
                }
              });
            }}
          />

          <FormLabel>名：</FormLabel>
          <FormInput
            autoCapitalize="none"
            value={this.state.riderInfo.first_name}
            onChangeText={(inputValue) => {
              this.setState({
                riderInfo: {
                  ...this.state.riderInfo,
                  first_name: inputValue
                }
              });
            }}
          />

          <View style={{ padding: 10 }}>
            <ListItem
              title="学年："
              subtitle={`${this.state.riderInfo.grade}`}
              rightIcon={{ name: this.state.gradePickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
              onPress={() => this.setState({
                gradePickerVisible: !this.state.gradePickerVisible,
                majorPickerVisible: false
              })}
            />

            {this.renderGradePicker()}

          </View>

          <View style={{ padding: 10 }}>
            <ListItem
              title="学類/専攻："
              subtitle={`${this.state.riderInfo.major}`}
              rightIcon={{ name: this.state.majorPickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
              onPress={() => this.setState({
                gradePickerVisible: false,
                majorPickerVisible: !this.state.majorPickerVisible,
              })}
            />

            {this.renderMajorPicker()}

          </View>

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
                      ...this.state.riderInfo,
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
            value={this.state.riderInfo.phone}
            onChangeText={(inputValue) => {
              this.setState({
                riderInfo: {
                  ...this.state.riderInfo,
                  phone: inputValue
                }
              });
            }}
          />

          {this.renderSignupButton()}

          {/*<View style={{ height: 60 }} />*/}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}


const styles = StyleSheet.create({
});


export default SignupScreen;
