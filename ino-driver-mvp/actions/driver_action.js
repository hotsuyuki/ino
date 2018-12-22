import { Alert, AsyncStorage } from 'react-native';

import {
  FETCH_OWN_OFFERS,
  FETCH_ALL_OFFERS,
  GET_DRIVER_INFO,
} from './types';


// Below are action creators...
// (a function that will return an action)
export const fetchOwnOffers = () => {
  // For an async flow like Ajax,
  // action creator function returns another function (not an action),
  // and the returned fucntion dispatch an action
  // when the async procedure is done.
  // This is whta Redux Thunk does.
  return async (dispatch) => {
    const ownOffers = [];

    // Get stored driver info
    try {
      let stringifiedDriverInfo = await AsyncStorage.getItem('driverInfo');
      let driverInfo = JSON.parse(stringifiedDriverInfo);

      // GET own offers
      try {
        let offerResponse = await fetch(`https://inori.work/offers?driver_id=${driverInfo.id}`);

        if (parseInt(offerResponse.status / 100, 10) === 2) {
          let offerResponseJson = await offerResponse.json();
          //console.log('JSON.stringify(offerResponseJson) = ' + JSON.stringify(offerResponseJson));

          // Reset the local notifications list if own offers array is empty
          if (offerResponseJson.offers.length === 0) {
            const localNotifications = [];
            await AsyncStorage.setItem('localNotifications', JSON.stringify(localNotifications));
          }

          offerResponseJson.offers.forEach((item) => {
            const eachItem = item;
            /**********************************
            eachItem: {
              offer: {
                id:,
                driver_id:,
                start:,
                goal:,
                departure_time:,
                rider_capacity:
              },
              reserved_riders: [`id1`, `id2`, ...]
            }
            **********************************/

            eachItem.driver = driverInfo;
            /**********************************
            eachItem: {
              driver:{
                id:,
                first_name:,
                last_name:,
                grade:,
                major:,
                mail:,
                phone:
                car_color:,
                car_number:
              },
              offer: {
                id:,
                driver_id:,
                start:,
                goal:,
                departure_time:,
                rider_capacity:
              },
              reserved_riders: [`id1`, `id2`, ...]
            }
            **********************************/

            ownOffers.push(eachItem);
          });

          // Sort `ownOffers` in chronological order (just in case)
          ownOffers.sort((a, b) => {
            if (a.offer.departure_time < b.offer.departure_time) {
              return -1;
            }
            if (a.offer.departure_time > b.offer.departure_time) {
              return 1;
            }
            return 0;
          });

        // If failed to GET own offers,
        } else if (parseInt(offerResponse.status / 100, 10) === 4 ||
                   parseInt(offerResponse.status / 100, 10) === 5) {
          console.log('GETting own offers failed...');

          Alert.alert(
            'エラーが発生しました。',
            '電波の良いところで後ほどお試しください。',
            [
              { text: 'OK' },
            ]
          );
        }

      // If cannot access offers api,
      } catch (error) {
        console.error(error);
        console.log('Cannot access offers api...');

        Alert.alert(
            'エラーが発生しました。',
            '電波の良いところで後ほどお試しください。',
            [
              { text: 'OK' },
            ]
          );
      }
    // If cannot get stored driver info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored driver info...');
    }

    dispatch({ type: FETCH_OWN_OFFERS, payload: ownOffers });
  };
};


export const fetchAllOffers = () => {
  // For an async flow like Ajax,
  // action creator function returns another function (not an action),
  // and the returned fucntion dispatch an action
  // when the async procedure is done.
  // This is whta Redux Thunk does.
  return async (dispatch) => {
    const allOffers = [];

    // GET all offers
    try {
      let offerResponse = await fetch('https://inori.work/offers');

      if (parseInt(offerResponse.status / 100, 10) === 2) {
        let offerResponseJson = await offerResponse.json();
        //console.log('JSON.stringify(offerResponseJson) = ' + JSON.stringify(offerResponseJson));

        const promiseArray = offerResponseJson.offers.map(async (item) => {
          const eachItem = item;
          /**********************************
          eachItem: {
            offer: {
              id:,
              driver_id:,
              start:,
              goal:,
              departure_time:,
              rider_capacity:
            },
            reserved_riders: [`id1`, `id2`, ...]
          }
          **********************************/

          // GET corresponding driver info
          try {
            let driverResponse = await fetch(`https://inori.work/drivers/${eachItem.offer.driver_id}`);

            if (parseInt(driverResponse.status / 100, 10) === 2) {
              let driverResponseJson = await driverResponse.json();

              eachItem.driver = driverResponseJson.driver;
              /**********************************
              eachItem: {
                driver:{
                  id:,
                  first_name:,
                  last_name:,
                  grade:,
                  major:,
                  mail:,
                  phone:
                  car_color:,
                  car_number:
                },
                offer: {
                  id:,
                  driver_id:,
                  start:,
                  goal:,
                  departure_time:,
                  rider_capacity:
                },
                reserved_riders: [`id1`, `id2`, ...]
              }
              **********************************/

              allOffers.push(eachItem);

            // If failed to GET the correesponding driver info,
            } else if (parseInt(driverResponse.status / 100, 10) === 4 ||
                       parseInt(driverResponse.status / 100, 10) === 5) {
              Alert.alert(
                'エラーが発生しました。',
                '電波の良いところで後ほどお試しください。',
                [
                  { text: 'OK' },
                ]
              );
            }

          // If cannot access drivers api,
          } catch (error) {
            console.error(error);
            console.log('Cannot access drivers api...');

            Alert.alert(
              'エラーが発生しました。',
              '電波の良いところで後ほどお試しください。',
              [
                { text: 'OK' },
              ]
            );
          }
        });

        await Promise.all(promiseArray);

        // Sort `allOffers` in chronological order
        allOffers.sort((a, b) => {
          if (a.offer.departure_time < b.offer.departure_time) {
            return -1;
          }
          if (a.offer.departure_time > b.offer.departure_time) {
            return 1;
          }
          return 0;
        });

      // If failed to GET all offers,
      } else if (parseInt(offerResponse.status / 100, 10) === 4 ||
                 parseInt(offerResponse.status / 100, 10) === 5) {
        Alert.alert(
          'エラーが発生しました。',
          '電波の良いところで後ほどお試しください。',
          [
            { text: 'OK' },
          ]
        );
      }

    // If cannot access offers api,
    } catch (error) {
      console.error(error);
      console.log('Cannot access offers api...');

      Alert.alert(
        'エラーが発生しました。',
        '電波の良いところで後ほどお試しください。',
        [
          { text: 'OK' },
        ]
      );
    }

    dispatch({ type: FETCH_ALL_OFFERS, payload: allOffers });
  };
};


export const getDriverInfo = () => {
  // For an async flow like Ajax,
  // action creator function returns another function (not an action),
  // and the returned fucntion dispatch an action
  // when the async procedure is done.
  // This is whta Redux Thunk does.
  return async (dispatch) => {
    let driverInfo = {};

    // Get stored driver info
    try {
      let stringifiedDriverInfo = await AsyncStorage.getItem('driverInfo');
      driverInfo = JSON.parse(stringifiedDriverInfo);

    // If cannot get stored driver info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored driver info...');
    }

    dispatch({ type: GET_DRIVER_INFO, payload: driverInfo });
  };
};
