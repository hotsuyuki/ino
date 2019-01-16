import {
  GET_RIDER_INFO,
  FETCH_OWN_RESERVATIONS,
  FETCH_ALL_OFFERS,
  FETCH_SELECTED_OFFER,
  RESET_SELECTED_OFFER,
} from '../actions/types';

const INITIAL_STATE = {
  riderInfo: {},
  ownReservations: null,
  allOffers: null,
  selectedOffer: null,
};


export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_RIDER_INFO:
      return { ...state, riderInfo: action.payload };

    case FETCH_OWN_RESERVATIONS:
      return { ...state, ownReservations: action.payload };

    case FETCH_ALL_OFFERS:
      return { ...state, allOffers: action.payload };

    case FETCH_SELECTED_OFFER:
      return { ...state, selectedOffer: action.payload };

    case RESET_SELECTED_OFFER:
      //return { ...state, selectedOffer: null };
      return { ...state, selectedOffer: action.payload };

    default:
      return state;
  }
};
