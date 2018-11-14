import {
  FETCH_OWN_OFFERS,
  GET_DRIVER_INFO,
} from '../actions/types';

const INITIAL_STATE = {
  ownOffers: null,
  driverInfo: {}
};


export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_OWN_OFFERS:
      return { ...state, ownOffers: action.payload };

    case GET_DRIVER_INFO:
      return { ...state, driverInfo: action.payload };

    default:
      return state;
  }
};
