import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity, Image,
  LayoutAnimation, UIManager, AsyncStorage, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Header, Button, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';
import { AppLoading, Permissions, ImagePicker } from 'expo';
import { connect } from 'react-redux';

import * as actions from '../actions';


const riderInfoTemplate = {
  id: 0,
  first_name: '',
  last_name: '',
  grade: '',
  major: '',
  mail: '',
  phone: '',
  image_url: '',
};

const INITIAL_STATE = {
  // for rider info
  initialRiderInfo: riderInfoTemplate,
  editedRiderInfo: riderInfoTemplate
};

const FACE_IMAGE_SIZE = 120;

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
    // On Android, UIManager animation will affect ModalSelector
    // https://github.com/moschan/react-native-simple-radio-button/issues/83#issuecomment-428003428
    if (Platform.OS === 'ios') {
      // Ease in & Ease out animation
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
      LayoutAnimation.easeInEaseOut();
    }
  }


  onImagePress = async () => {
    let cameraRollPermission = await AsyncStorage.getItem('cameraRollPermission');

    if (cameraRollPermission !== 'granted') {
      let permission = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (permission.status !== 'granted') {
        return;
      }

      await AsyncStorage.setItem('cameraRollPermission', permission.status);
    }

    let imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true
    });

    if (!imageResult.cancelled) {
      // Rerender with the new uploaded face image
      this.setState({
        editedRiderInfo: {
          ...this.state.editedRiderInfo,
          image_url: imageResult.uri
        }
      });
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
        initValue={this.state.initialRiderInfo.grade}
        onChange={(option) => this.setState({
          editedRiderInfo: {
            ...this.state.editedRiderInfo,
            grade: option.label
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
        onChange={(option) => this.setState({
          editedRiderInfo: {
            ...this.state.editedRiderInfo,
            major: option.label
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
    const regex = /0[789]0[0-9]{4}[0-9]{4}/;

    if (regex.test(phone) && phone.length === 11) {
      formValidation.isPhoneValid = true;
      return;
    }

    formValidation.isPhoneValid = false;
    return (
      <FormValidationMessage>070/080/090から始まる11桁の数字で入力して下さい</FormValidationMessage>
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
            // First, POST the edited face image
            try {
              // for debug
              console.log(`this.state.editedRiderInfo.image_url = ${this.state.editedRiderInfo.image_url}`);

              const formData = new FormData();
              formData.append('face_image', {
                type: 'image/jpeg',
                name: 'face_image.jpg',
                uri: this.state.editedRiderInfo.image_url,
              });

              let imageResponse = await fetch(`https://inori.work/riders/${this.props.riderInfo.id}/image`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'multipart/form-data',
                },
                body: formData,
              });

              // If succeeded to POST the new face image,
              if (parseInt(imageResponse.status / 100, 10) === 2) {
                let imageResponseJson = await imageResponse.json();

                const editedRiderInfo = this.state.editedRiderInfo;

                // Truncate whitespaces and add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
                editedRiderInfo.mail = `${editedRiderInfo.mail.replace(/\s/g, '').toLowerCase()}@stu.kanazawa-u.ac.jp`;
                // Truncate whitespaces and elace hyphens (just in case)
                editedRiderInfo.phone = editedRiderInfo.phone.replace(/[^0-9]/g, '');
                // Add responded image URL
                editedRiderInfo.image_url = imageResponseJson.image_url;

                // Then, PUT the edited profile
                try {
                  let profileResponse = await fetch(`https://inori.work/riders/${this.props.riderInfo.id}`, {
                    method: 'PUT',
                    headers: {},
                    body: JSON.stringify(editedRiderInfo),
                  });

                  if (parseInt(profileResponse.status / 100, 10) === 2) {
                    let profileResponseJson = await profileResponse.json();

                    await AsyncStorage.setItem('riderInfo', JSON.stringify(profileResponseJson.rider));

                    // Reflesh `this.props.riderInfo` in `ProfileScreen`
                    // and make `ProfileScreen` rerender by calling action creators
                    this.props.getRiderInfo();
                    this.props.navigation.pop();

                  // if failed to PUT the edited rider info,
                  } else if (parseInt(profileResponse.status / 100, 10) === 4 ||
                             parseInt(profileResponse.status / 100, 10) === 5) {
                    console.log('Failed to PUT the edited rider info...');

                    Alert.alert(
                      '電波の良いところで後ほどお試しください。',
                      '編集内容は保存されていません。',
                      [{ text: 'OK' }]
                    );
                  }

                // If cannot access riders api,
                } catch (error) {
                  console.error(error);
                  console.log('Cannot access riders api...');

                  Alert.alert(
                    '電波の良いところで後ほどお試しください。',
                    '編集内容は保存されていません。',
                    [{ text: 'OK' }]
                  );
                }

              // If failed to POST the new face image,
              } else if (parseInt(imageResponse.status / 100, 10) === 4 ||
                         parseInt(imageResponse.status / 100, 10) === 5) {
                console.log('Failed to POST the new face image...');

                Alert.alert(
                  '画像のアップロードに失敗しました。',
                  '同じ画像で何度も失敗する場合は、他の画像をお試しください。もしくは一度スクショを撮ってスクショの方の画像を登録ください。(特にAndroidはカメラで撮った画像だとよく失敗します...)',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.warn(error);
              console.log('Cannot access riders image api...');

              Alert.alert(
                '電波の良いところで後ほどお試しください。',
                '編集内容は保存されていません。',
                [{ text: 'OK' }]
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
              // `this.state.editedRiderInfo` is default or not
              let isDefault = true;
              // If at least one of `this.state.editedRiderInfo` is NOT default value,
              Object.keys(this.state.editedRiderInfo).forEach((key) => {
                if (this.state.editedRiderInfo[key] !== this.state.initialRiderInfo[key]) {
                  isDefault = false;
                }
              });

              if (isDefault) {
                this.props.navigation.pop();
              } else {
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
            }
          }}
          centerComponent={{ text: 'プロフィール編集', style: styles.headerStyle }}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 /*, justifyContent: 'center'*/ }}
          behavior="padding"
        >
          <ScrollView style={{ flex: 1 }}>
            <TouchableOpacity
              style={{ alignItems: 'center', padding: 10 }}
              onPress={() => this.onImagePress()}
            >
              <Image
                style={{ width: FACE_IMAGE_SIZE, height: FACE_IMAGE_SIZE, borderRadius: FACE_IMAGE_SIZE / 2 }}
                source={
                  this.state.editedRiderInfo.image_url === '' ?
                  require('../assets/face_image_placeholder.png') :
                  { uri: this.state.editedRiderInfo.image_url }
                }
              />
              <Text style={styles.itemTextStyle}>顔写真を選択</Text>
            </TouchableOpacity>

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
              containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
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
                  value={this.state.editedRiderInfo.mail}
                  onChangeText={(inputValue) => {
                    this.setState({
                      editedRiderInfo: {
                        ...this.state.editedRiderInfo,
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
              value={this.state.editedRiderInfo.phone}
              onChangeText={(inputValue) => {
                this.setState({
                  editedRiderInfo: {
                    ...this.state.editedRiderInfo,
                    phone: inputValue
                  }
                });
              }}
              containerStyle={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}
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
  itemTextStyle: {
    color: 'gray',
    padding: 10,
  },
});


const mapStateToProps = (state) => {
  return {
    riderInfo: state.riderReducer.riderInfo
  };
};


export default connect(mapStateToProps, actions)(EditProfileScreen);
