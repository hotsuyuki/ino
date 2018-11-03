import _ from 'lodash';
import { AsyncStorage } from 'react-native';

import {
  FETCH_DRIVER_INFO,
} from './types';

// TODO: Use API
import { driverIdTmp } from '../assets/tmpData';


// Below are action creators...
// (a function that will return an action)
export const fetchDriverInfo = () => {
  // For an async flow like Ajax,
  // action creator function returns another function (not an action),
  // and the returned fucntion dispatch an action
  // when the async procedure is done.
  // This is whta Redux Thunk does.
  return async (dispatch) => {
    // GET own driver info (if it's not in the `AsyncStorage`)
    let stringifiedDriverInfo = await AsyncStorage.getItem('driverInfo');
    let driverInfo = JSON.parse(stringifiedDriverInfo);

    if (_.isNull(driverInfo)) {
      console.log('There is NOT `driverInfo` in AsyncStorage...');

      try {
        let response = await fetch(`https://inori.work/drivers/${driverIdTmp}`);
        let responseJson = await response.json();
        driverInfo = responseJson.driver
      } catch (error) {
        console.error(error);
      }

      try {
        await AsyncStorage.setItem('driverInfo', JSON.stringify(driverInfo));
      } catch (error) {
        console.warn(error);
      }
    } else {
      console.log('There is `driverInfo` in AsyncStorage!!!');
    }

    dispatch({ type: FETCH_DRIVER_INFO, payload: driverInfo });
  };
};
