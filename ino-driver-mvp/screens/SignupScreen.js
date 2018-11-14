import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
  LayoutAnimation, UIManager, AsyncStorage, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Button, FormLabel, FormInput } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';


const INITIAL_STATE = {
  // for driver info
  driverInfo: {
    first_name: '',
    last_name: '',
    grade: '学年を選択して下さい',
    major: '学類/専攻を選択して下さい',
    car_color: '車の色を選択して下さい',
    car_number: '',
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
        initValue={INITIAL_STATE.driverInfo.grade}
        onChange={(itemValue) => this.setState({
          driverInfo: {
            ...this.state.driverInfo,
            grade: itemValue.label
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

    const gradeCourse = this.state.driverInfo.grade.slice(0, 2);
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
        { key: index++, label: '法務研究科（法科大学院）' },
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
        { key: index++, label: '法務研究科（法科大学院）' },
        { key: index++, label: '教職実践研究科' },

        { key: index++, label: 'その他' },
      ];
    } else {
      data = [
        { key: index++, label: INITIAL_STATE.driverInfo.major },
      ];
    }

    return (
      <ModalSelector
        data={data}
        initValue={INITIAL_STATE.driverInfo.major}
        onChange={(itemValue) => this.setState({
          driverInfo: {
            ...this.state.driverInfo,
            major: itemValue.label
          },
        })}
        selectTextStyle={{ fontSize: 12, color: 'gray' }}
        cancelText="キャンセル"
        //animationType="fade"
        backdropPressToClose
      />
    );
  }


  renderCarColorPicker() {
    let index = 0;
    const data = [
      { key: index++, label: '白系' },
      { key: index++, label: '黒系' },
      { key: index++, label: '銀系' },
      { key: index++, label: '青系' },
      { key: index++, label: '赤系' },
      { key: index++, label: '茶系' },
      { key: index++, label: '灰系' },
      { key: index++, label: '黄系' },
      { key: index++, label: '緑系' },
      { key: index++, label: 'ｵﾚﾝｼﾞ系' },
      { key: index++, label: 'ﾊﾟｰﾌﾟﾙ系' },

      { key: index++, label: 'その他' },
    ];

    return (
      <ModalSelector
        data={data}
        initValue={INITIAL_STATE.driverInfo.car_color}
        onChange={(itemValue) => this.setState({
          driverInfo: {
            ...this.state.driverInfo,
            car_color: itemValue.label
          },
        })}
        selectTextStyle={{ fontSize: 12, color: 'gray' }}
        cancelText="キャンセル"
        //animationType="fade"
        backdropPressToClose
      />
    );
  }


  onOkButtonPress = async () => {
    const driverInfo = this.state.driverInfo;

    // Add temporary `id`
    driverInfo.id = 0;
    // Add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    driverInfo.mail = `${driverInfo.mail}@stu.kanazawa-u.ac.jp`;
    // Elace hyphens (just in case)
    driverInfo.phone = driverInfo.phone.replace(/-/g, '');

    // Try access signup api
    try {
      let response = await fetch('https://inori.work/drivers/signup', {
        method: 'POST',
        headers: {},
        body: JSON.stringify(driverInfo),
      });

      // If succeed signup with the input driver info,
      if (parseInt(response.status / 100, 10) === 2) {
        let responseJson = await response.json();
        driverInfo.id = responseJson.id;

        // for debug
        //console.log('responseJson = ' + JSON.stringify(responseJson));
        console.log('driverInfo = ' + JSON.stringify(driverInfo));

        await AsyncStorage.setItem('driverInfo', JSON.stringify(driverInfo));

        console.log('Manual signup with the input driver info is succeeded!!!');
        this.props.navigation.pop();
        this.props.navigation.navigate('root');

      // If cannot signup with the input driver info,
      } else if (parseInt(response.status / 100, 10) === 4 ||
                 parseInt(response.status / 100, 10) === 5) {
        console.log('Manual signup with the input driver info is failed...');

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
      氏名：${this.state.driverInfo.last_name} ${this.state.driverInfo.first_name} \n
      学年：${this.state.driverInfo.grade} \n
      学類/専攻：${this.state.driverInfo.major} \n
      メールアドレス：${this.state.driverInfo.mail}@stu.kanazawa-u.ac.jp \n
      電話番号：${this.state.driverInfo.phone.replace(/-/g, '')} \n
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
    // `this.state.driverInfo` is completed or not
    let isCompleted = true;
    // If at least one of `driverInfo` is default value,
    Object.keys(this.state.driverInfo).forEach((key) => {
      if (this.state.driverInfo[key] === INITIAL_STATE.driverInfo[key]) {
        isCompleted = false;
      }
    });

    const signupButtonTitle = '新規登録';

    // If `this.state.driverInfo` is completed,
    if (isCompleted) {
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

            <View style={{ flexDirection: 'row', flex: 1, paddingTop: 10, paddingRight: 20 }}>
              <FormLabel>車の色：</FormLabel>
              <View style={{ flex: 1 }}>
                {this.renderCarColorPicker()}
              </View>
            </View>

            <FormLabel>車のナンバー(4桁以下)：</FormLabel>
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
