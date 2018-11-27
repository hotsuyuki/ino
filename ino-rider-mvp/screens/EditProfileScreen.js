import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
  LayoutAnimation, UIManager, AsyncStorage, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Header, Button, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';
import { AppLoading } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const INITIAL_STATE = {
  // for rider info
  initialRiderInfo: {
    id: 0,
    first_name: '',
    last_name: '',
    grade: '',
    major: '',
    mail: '',
    phone: '',
  },
  editedRiderInfo: {
    id: 0,
    first_name: '',
    last_name: '',
    grade: '',
    major: '',
    mail: '',
    phone: '',
  }
};

// for form validation
const formValidation = {
  //isMailValid: null, // TODO: Create email address validaiton
  isPhoneValid: null,
};


class EditProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  componentWillMount() {
    // Call action creators
    this.props.getRiderInfo();

    const riderInfo = this.props.riderInfo;
    // Truncate "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
    riderInfo.mail = riderInfo.mail.replace('@stu.kanazawa-u.ac.jp', '');

    this.setState({
      initialRiderInfo: riderInfo,
      editedRiderInfo: riderInfo,
    });
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
        initValue={this.state.initialRiderInfo.grade}
        onChange={(itemValue) => this.setState({
          editedRiderInfo: {
            ...this.state.editedRiderInfo,
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

    const gradeCourse = this.state.editedRiderInfo.grade.slice(0, 2);
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
        { key: index++, label: '学年が正しく選択されているか確認して下さい' },
      ];
    }

    return (
      <ModalSelector
        data={data}
        initValue={this.state.initialRiderInfo.major}
        //initValue={this.state.editedRiderInfo.major}
        onChange={(itemValue) => this.setState({
          editedRiderInfo: {
            ...this.state.editedRiderInfo,
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


  /*
  renderMailValid() {
    // TODO: Create email address validaiton
  }
  */


  renderPhoneValid() {
    const phone = this.state.editedRiderInfo.phone;
    const regex = /0[89]0[0-9]{4}[0-9]{4}/;

    if (regex.test(phone) && phone.length === 11) {
      formValidation.isPhoneValid = true;
      return;
    }

    formValidation.isPhoneValid = false;
    return (
      <FormValidationMessage>080もしくは090から始まる11桁の数字で入力して下さい</FormValidationMessage>
    );
  }


  onDoneButtonPress = () => {
    Alert.alert(
      '',
      '編集内容を保存しますか？',
      [
        { text: 'キャンセル' },
        {
          text: 'はい',
          onPress: async () => {
            const editedRiderInfo = this.state.editedRiderInfo;

            // Truncate whitespaces and add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
            editedRiderInfo.mail = `${editedRiderInfo.mail.replace(/\s/g, '').toLowerCase()}@stu.kanazawa-u.ac.jp`;
            // Truncate whitespaces and elace hyphens (just in case)
            editedRiderInfo.phone = editedRiderInfo.phone.replace(/[^0-9]/g, '');

            // for debug
            console.log(`JSON.stringify(editedRiderInfo) = ${JSON.stringify(editedRiderInfo)}`);

            // PUT the edited profile
            try {
              let response = await fetch(`https://inori.work/riders/${this.props.riderInfo.id}`, {
                method: 'PUT',
                headers: {},
                body: JSON.stringify(editedRiderInfo),
              });

              if (parseInt(response.status / 100, 10) === 2) {
                let responseJson = await response.json();

                try {
                  await AsyncStorage.setItem('riderInfo', JSON.stringify(responseJson.rider));
                } catch (error) {
                  console.warn(error);
                }

                // Reflesh `this.props.riderInfo` in `ProfileScreen`
                // and make `ProfileScreen` rerender by calling action creators
                this.props.getRiderInfo();
                this.props.navigation.pop();

              // if failed to PUT the edited driver info,
              } else if (parseInt(response.status / 100, 10) === 4 ||
                         parseInt(response.status / 100, 10) === 5) {
                Alert.alert(
                  '電波の良いところで後ほどお試しください。',
                  '編集内容は保存されていません。',
                  [
                    { text: 'OK' },
                  ]
                );
              }

            // If cannot access riders api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access riders api...');

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
    // `this.state.editedRiderInfo` is default or not
    let isDefault = true;
    // If at least one of `this.state.editedRiderInfo` is NOT default value,
    Object.keys(this.state.editedRiderInfo).forEach((key) => {
      if (this.state.editedRiderInfo[key] !== this.state.initialRiderInfo[key]) {
        isDefault = false;
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
          // If `this.state.editedRiderInfo` is default or one of the forms is invalid,
          // inactivate the button
          disabled={isDefault || !isValid}
          title="完了"
          color="white"
          buttonStyle={{ backgroundColor: 'rgb(0,122,255)' }}
          onPress={this.onDoneButtonPress}
        />
      </View>
    );
  }


  render() {
    // for debug
    //console.log(`typeof this.props.riderInfo.id = ${typeof this.props.riderInfo.id}`);

    // Wait to fetch own rider info
    if ((typeof this.props.riderInfo.id) === 'undefined') {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>
        <Header
          statusBarProps={{ barStyle: 'light-content' }}
          backgroundColor="white"
          leftComponent={{
            icon: 'close',
            color: 'gray',
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

        <KeyboardAvoidingView
          style={{ flex: 1 /*, justifyContent: 'center'*/ }}
          behavior={Platform.OS === 'ios' ? 'padding' : ''}
        >
          <ScrollView style={{ flex: 1 }}>
            <FormLabel>姓：</FormLabel>
            <FormInput
              autoCapitalize="none"
              value={this.state.editedRiderInfo.last_name}
              onChangeText={(inputValue) => {
                this.setState({
                  editedRiderInfo: {
                    ...this.state.editedRiderInfo,
                    last_name: inputValue
                  }
                });
              }}
            />

            <FormLabel>名：</FormLabel>
            <FormInput
              autoCapitalize="none"
              value={this.state.editedRiderInfo.first_name}
              onChangeText={(inputValue) => {
                this.setState({
                  editedRiderInfo: {
                    ...this.state.editedRiderInfo,
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

            <FormLabel>メールアドレス：</FormLabel>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 3 }}>
                <FormInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={this.state.editedRiderInfo.mail}
                  onChangeText={(inputValue) => {
                    this.setState({
                      editedRiderInfo: {
                        ...this.state.editedRiderInfo,
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
            {/*this.renderMailValid() TODO: Create email address validaiton */}

            <FormLabel>電話番号（ハイフンなし）：</FormLabel>
            <FormInput
              autoCapitalize="none"
              keyboardType="numeric"
              value={this.state.editedRiderInfo.phone}
              onChangeText={(inputValue) => {
                this.setState({
                  editedRiderInfo: {
                    ...this.state.editedRiderInfo,
                    phone: inputValue
                  }
                });
              }}
            />
            {this.renderPhoneValid()}

            {this.renderDoneButton()}

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  headerStyle: {
    color: 'gray',
    fontSize: 18,
    fontWeight: 'bold'
  },
});


const mapStateToProps = (state) => {
  return {
    riderInfo: state.riderReducer.riderInfo
  };
};


export default connect(mapStateToProps, actions)(EditProfileScreen);
