import {
  FETCH_OWN_RESERVATIONS,
  FETCH_ALL_OFFERS,
  GET_RIDER_INFO,
} from '../actions/types';

const INITIAL_STATE = {
  ownReservations: null,
  allOffers: null,
  riderInfo: {}
};


export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_OWN_RESERVATIONS:
      return { ...state, ownReservations: action.payload };

    case FETCH_ALL_OFFERS:
      return { ...state, allOffers: action.payload };

    case GET_RIDER_INFO:
      return { ...state, riderInfo: action.payload };

    default:
      return state;
  }
};
