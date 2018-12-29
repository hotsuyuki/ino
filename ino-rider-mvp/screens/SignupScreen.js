import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
  LayoutAnimation, UIManager, AsyncStorage, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Button, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';


const INITIAL_STATE = {
  // for rider info
  riderInfo: {
    first_name: '',
    last_name: '',
    grade: '学年を選択して下さい',
    major: '学類/専攻を選択して下さい',
    mail: '',
    phone: ''
  }
};

// for form validation
const formValidation = {
  //isMailValid: null, // TODO: Create email address validaiton
  isPhoneValid: null,
};


class SignupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  componentWillUpdate() {
    // On Android, UIManager animation will affect ModalSelector
    // https://github.com/moschan/react-native-simple-radio-button/issues/83#issuecomment-428003428
    if (Platform.OS === 'ios') {
      // Ease in & Ease out animation
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
      LayoutAnimation.easeInEaseOut();
    }
  }


  renderGradePicker() {
    let index = 0;
    const data = [
      { key: index++, label: '学部1年' },
      { key: index++, label: '学部2年' },
      { key: index++, label: '学部3年' },
      { key: index++, label: '学部4年' },

      { key: index++, label: '修士1年' },
      { key: index++, label: '修士2年' },

      { key: index++, label: '博士1年' },
      { key: index++, label: '博士2年' },
      { key: index++, label: '博士3年' },
    ];

    return (
      <ModalSelector
        data={data}
        initValue={INITIAL_STATE.riderInfo.grade}
        onChange={(item) => this.setState({
          riderInfo: {
            ...this.state.riderInfo,
            grade: item.label
          },
        })}
        selectTextStyle={{ fontSize: 12, color: 'gray' }}
        cancelText="キャンセル"
        //animationType="fade"
        backdropPressToClose
      />
    );
  }


  renderMajorPicker() {
    let index = 0;
    let data = [];

    const gradeCourse = this.state.riderInfo.grade.slice(0, 2);
    if (gradeCourse === '学部') {
      data = [
        { key: index++, label: '人文学類' },
        { key: index++, label: '法学類' },
        { key: index++, label: '経済学類' },
        { key: index++, label: '学校教育学類' },
        { key: index++, label: '地域創造学類' },
        { key: index++, label: '国際学類' },

        { key: index++, label: '数物科学類' },
        { key: index++, label: '物質化学類' },
        { key: index++, label: '機械工学類' },
        { key: index++, label: 'フロンティア工学類' },
        { key: index++, label: '電子情報通信学類' },
        { key: index++, label: '地球社会基盤学類' },
        { key: index++, label: '生命理工学類' },

        { key: index++, label: '医学類' },
        { key: index++, label: '薬学類・創薬科学類' },
        { key: index++, label: '保険学類' },

        { key: index++, label: 'その他' },
      ];
    } else if (gradeCourse === '修士') {
      data = [
        { key: index++, label: '人文学専攻' },
        { key: index++, label: '法学・政治学専攻' },
        { key: index++, label: '経済学専攻' },
        { key: index++, label: '地域創造学専攻' },
        { key: index++, label: '国際学専攻' },

        { key: index++, label: '数物科学専攻' },
        { key: index++, label: '物質化学専攻' },
        { key: index++, label: '機械科学専攻' },
        { key: index++, label: '電子情報科学専攻' },
        { key: index++, label: '環境デザイン学専攻' },
        { key: index++, label: '自然システム学専攻' },
        { key: index++, label: '融合科学共同専攻' },

        { key: index++, label: '医科学専攻' },
        { key: index++, label: '創薬科学・薬学専攻' },
        { key: index++, label: '保険学専攻' },

        { key: index++, label: '先進予防医学研究科' },
        { key: index++, label: '連合小児発達学研究科' },
        { key: index++, label: '法務研究科(法科大学院)' },
        { key: index++, label: '教職実践研究科' },

        { key: index++, label: 'その他' },
      ];
    } else if (gradeCourse === '博士') {
      data = [
        { key: index++, label: '人文学コース' },
        { key: index++, label: '法学・政治学コース' },
        { key: index++, label: '社会経済学コース' },

        { key: index++, label: '数物科学専攻' },
        { key: index++, label: '物質化学専攻' },
        { key: index++, label: '機械科学専攻' },
        { key: index++, label: '電子情報科学専攻' },
        { key: index++, label: '環境デザイン学専攻' },
        { key: index++, label: '自然システム学専攻' },
        { key: index++, label: '融合科学共同専攻' },

        { key: index++, label: '医科学専攻' },
        { key: index++, label: '創薬科学・薬学専攻' },
        { key: index++, label: '保険学専攻' },

        { key: index++, label: '先進予防医学研究科' },
        { key: index++, label: '連合小児発達学研究科' },
        { key: index++, label: '法務研究科(法科大学院)' },
        { key: index++, label: '教職実践研究科' },

        { key: index++, label: 'その他' },
      ];
    } else {
      data = [
        { key: index++, label: INITIAL_STATE.riderInfo.major },
      ];
    }

    return (
      <ModalSelector
        data={data}
        initValue={INITIAL_STATE.riderInfo.major}
        onChange={(item) => this.setState({
          riderInfo: {
            ...this.state.riderInfo,
            major: item.label
          },
        })}
        selectTextStyle={{ fontSize: 12, color: 'gray' }}
        cancelText="キャンセル"
        //animationType="fade"
        backdropPressToClose
      />
    );
  }

  /*
  renderMailValid() {
    // TODO: Create email address validaiton
  }
  */


  renderPhoneValid() {
    const phone = this.state.riderInfo.phone;
    const regex = /0[789]0[0-9]{4}[0-9]{4}/;

    if (phone !== INITIAL_STATE.riderInfo.phone) {
      if (regex.test(phone) && phone.length === 11) {
        formValidation.isPhoneValid = true;
        return;
      }

      formValidation.isPhoneValid = false;
      return (
        <FormValidationMessage>070/080/090から始まる11桁の数字で入力して下さい</FormValidationMessage>
      );
    }
  }


  onOkButtonPress = async () => {
    const riderInfo = this.state.riderInfo;

    // Add temporary `id`
    riderInfo.id = 0;
    // Truncate whitespaces and add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    riderInfo.mail = `${riderInfo.mail.replace(/\s/g, '').toLowerCase()}@stu.kanazawa-u.ac.jp`;
    // Truncate whitespaces and elace hyphens (just in case)
    riderInfo.phone = riderInfo.phone.replace(/[^0-9]/g, '');

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
        this.props.navigation.pop();
        this.props.navigation.navigate('root');

      // If cannot signup with the input rider info,
      } else if (parseInt(response.status / 100, 10) === 4 ||
                 parseInt(response.status / 100, 10) === 5) {
        console.log('Manual signup with the input rider info failed...');

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
      電話番号：${this.state.riderInfo.phone.replace(/[^0-9]/g, '')} \n
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

    // All forms are valid or invalid,
    let isValid = true;
    // If one of `formValidation` is false,
    Object.keys(formValidation).forEach((key) => {
      if (formValidation[key] === false) {
        isValid = false;
      }
    });

    return (
      <View style={{ padding: 20 }}>
        <Button
          // If `this.state.riderInfo` is not completed or one of the forms is invalid,
          // inactivate the button
          disabled={!isCompleted || !isValid}
          title="新規登録"
          color="white"
          buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
          onPress={this.onSignupButtonPress}
        />
      </View>
    );
  }


  render() {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 /*, justifyContent: 'center'*/ }}
        behavior="padding"
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
            containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
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
            containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
          />

          <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10, paddingRight: 20 }}>
            <FormLabel>学年：</FormLabel>
            <View style={{ flex: 1 }}>
              {this.renderGradePicker()}
            </View>
          </View>

          <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10, paddingRight: 20 }}>
            <FormLabel>学類/専攻：</FormLabel>
            <View style={{ flex: 1 }}>
              {this.renderMajorPicker()}
            </View>
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
                containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
              />
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12 }}>@stu.kanazawa-u.ac.jp</Text>
            </View>
          </View>
          {/*this.renderMailValid() TODO: Create email address validaiton */}

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
            containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
          />
          {this.renderPhoneValid()}

          {this.renderSignupButton()}

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}


const styles = StyleSheet.create({
});


export default SignupScreen;
