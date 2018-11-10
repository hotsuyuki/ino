import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, Picker,
  LayoutAnimation, UIManager, AsyncStorage, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Header, Button, FormLabel, FormInput, ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import { AppLoading } from 'expo';

import * as actions from '../actions';


const INITIAL_STATE = {
  // for <Picker />
  gradePickerVisible: false,
  majorPickerVisible: false,

  // for rider's info
  initialRiderInfo: {},
  editedRiderInfo: {}
};


class EditProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }


  componentWillMount() {
    // Call an action creator
    this.props.fetchRiderInfo();

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
    if (this.state.gradePickerVisible) {
      return (
        <Picker
          selectedValue={this.state.editedRiderInfo.grade}
          onValueChange={(itemValue) => this.setState({
            editedRiderInfo: {
              ...this.state.editedRiderInfo,
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


  renderMajorPicker() {
    if (this.state.majorPickerVisible) {
      const gradeCourse = this.state.editedRiderInfo.grade.slice(0, 2);

      if (gradeCourse === '学部') {
        return (
          <Picker
            selectedValue={this.state.editedRiderInfo.major}
            onValueChange={(itemValue) => this.setState({
              editedRiderInfo: {
                ...this.state.editedRiderInfo,
                major: itemValue
              },
            })}
          >
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
            selectedValue={this.state.editedRiderInfo.major}
            onValueChange={(itemValue) => this.setState({
              editedRiderInfo: {
                ...this.state.editedRiderInfo,
                major: itemValue
              },
            })}
          >
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
            selectedValue={this.state.editedRiderInfo.major}
            onValueChange={(itemValue) => this.setState({
              editedRiderInfo: {
                ...this.state.editedRiderInfo,
                major: itemValue
              },
            })}
          >
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
            selectedValue={this.state.editedRiderInfo.major}
            onValueChange={(itemValue) => this.setState({
              editedRiderInfo: {
                ...this.state.editedRiderInfo,
                major: itemValue
              },
            })}
          >
            <Picker.Item label="学年が正しく選択されているか確認して下さい" value="学年が正しく選択されているか確認して下さい" />
          </Picker>
        );
      }
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
            const editedRiderInfo = this.state.editedRiderInfo;
            // Elace hyphens (just in case)
            editedRiderInfo.phone = editedRiderInfo.phone.replace(/-/g, '');
            // Add "@stu.kanazawa-u.ac.jp" // TODO: Make it more robust
            editedRiderInfo.mail = `${editedRiderInfo.mail}@stu.kanazawa-u.ac.jp`;

            // for debug
            console.log(`JSON.stringify(editedRiderInfo) = ${JSON.stringify(editedRiderInfo)}`);

            // PUT the edited profile
            try {
              let response = await fetch(`https://inori.work/riders/${this.props.riderInfo.id}`, {
                method: 'PUT',
                headers: {},
                body: JSON.stringify(editedRiderInfo),
              });

              let responseJson = await response.json();
              try {
                await AsyncStorage.setItem('riderInfo', JSON.stringify(responseJson.rider));
              } catch (error) {
                console.warn(error);
              }

              // Reflesh `this.props.riderInfo` in `ProfileScreen`
              // and make `ProfileScreen` rerender by calling action creators
              this.props.fetchRiderInfo();
              this.props.navigation.pop();

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
    // If at least one of `editedRiderInfo` is NOT default value,
    Object.keys(this.state.editedRiderInfo).forEach((key) => {
      if (this.state.editedRiderInfo[key] !== this.state.initialRiderInfo[key]) {
        isDefault = false;
      }
    });

    const doneButtonTitle = '完了';

    // If all pickers are closed and `this.state.editedRiderInfo` is not default,
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

            <View style={{ padding: 10 }}>
              <ListItem
                title="学年："
                subtitle={`${this.state.editedRiderInfo.grade}`}
                rightIcon={{ name: this.state.gradePickerVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down' }}
                onPress={() => this.setState({
                  gradePickerVisible: !this.state.gradePickerVisible,
                })}
              />

              {this.renderGradePicker()}

            </View>

            <View style={{ padding: 10 }}>
              <ListItem
                title="学類/専攻："
                subtitle={`${this.state.editedRiderInfo.major}`}
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
    riderInfo: state.riderReducer.riderInfo
  };
};


export default connect(mapStateToProps, actions)(EditProfileScreen);
