import { AsyncStorage } from 'react-native';

import {
  FETCH_OWN_RESERVATIONS,
  FETCH_ALL_OFFERS,
  GET_RIDER_INFO,
} from './types';


// Below are action creators...
// (a function that will return an action)
export const fetchOwnReservations = () => {
  // For an async flow like Ajax,
  // action creator function returns another function (not an action),
  // and the returned fucntion dispatch an action
  // when the async procedure is done.
  // This is whta Redux Thunk does.
  return async (dispatch) => {
    const ownReservations = [];

    // Get stored rider info
    try {
      let stringifiedRiderInfo = await AsyncStorage.getItem('riderInfo');
      let riderInfo = JSON.parse(stringifiedRiderInfo);

      // GET own reservations
      try {
        let reservationResponse = await fetch(`https://inori.work/reservations?rider_id=${riderInfo.id}`);
        let reservationResponseJson = await reservationResponse.json();
        //console.log('JSON.stringify(reservationResponseJson) = ' + JSON.stringify(reservationResponseJson));

        const promiseArray = reservationResponseJson.reservations.map(async (reservation) => {
          // GET corresponding offer
          try {
            let offerResponse = await fetch(`https://inori.work/offers/${reservation.offer_id}`);
            let offerResponseJson = await offerResponse.json();

            const eachItem = offerResponseJson;
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

              ownReservations.push(eachItem);

            // If cannot access drivers api,
            } catch (error) {
              console.error(error);
              console.log('Cannot access drivers api...');
            }

          // If cannot access offers api,
          } catch (error) {
            console.error(error);
            console.log('Cannot access offers api...');
          }
        });

        await Promise.all(promiseArray);

        // Sort `allOffers` in chronological order
        ownReservations.sort((a, b) => {
          if (a.offer.departure_time < b.offer.departure_time) {
            return -1;
          }
          if (a.offer.departure_time > b.offer.departure_time) {
            return 1;
          }
          return 0;
        });

      // If cannot access reservations api,
      } catch (error) {
        console.error(error);
        console.log('Cannot access reservations api...');
      }
    // If cannot get stored rider info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored rider info...');
    }

    dispatch({ type: FETCH_OWN_RESERVATIONS, payload: ownReservations });
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
          //let driverResponse = await fetch(`https://inori.work/drivers/${item.offer.driver_id}`);
          let driverResponse = await fetch(`https://inori.work/drivers/${eachItem.offer.driver_id}`);
          let driverResponseJson = await driverResponse.json();

          eachItem.driver = driverResponseJson.driver;
          //console.log('JSON.stringify(eachItem) = ' + JSON.stringify(eachItem));
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

        // If cannot access drivers api,
        } catch (error) {
          console.error(error);
          console.log('Cannot access drivers api...');
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

      // for debug 
      //console.log(`JSON.stringify(allOffers) = ${JSON.stringify(allOffers)}`);

    // If cannot access offers api,
    } catch (error) {
      console.error(error);
      console.log('Cannot access offers api...');
    }

    dispatch({ type: FETCH_ALL_OFFERS, payload: allOffers });
  };
};


export const getRiderInfo = () => {
  // For an async flow like Ajax,
  // action creator function returns another function (not an action),
  // and the returned fucntion dispatch an action
  // when the async procedure is done.
  // This is whta Redux Thunk does.
  return async (dispatch) => {
    let riderInfo = {};

    // Get stored rider info
    try {
      let stringifiedRiderInfo = await AsyncStorage.getItem('riderInfo');
      riderInfo = JSON.parse(stringifiedRiderInfo);

    // If cannot get stored rider info,
    } catch (error) {
      console.warn(error);
      console.log('Cannot get stored rider info...');
    }

    dispatch({ type: GET_RIDER_INFO, payload: riderInfo });
  };
};
