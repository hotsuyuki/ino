import {
  FETCH_OWN_OFFERS,
  FETCH_ALL_OFFERS,
  GET_DRIVER_INFO,
} from '../actions/types';

const INITIAL_STATE = {
  ownOffers: null,
  allOffers: null,
  driverInfo: {}
};


export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_OWN_OFFERS:
      return { ...state, ownOffers: action.payload };

    case FETCH_ALL_OFFERS:
      return { ...state, allOffers: action.payload };

    case GET_DRIVER_INFO:
      return { ...state, driverInfo: action.payload };

    default:
      return state;
  }
};
