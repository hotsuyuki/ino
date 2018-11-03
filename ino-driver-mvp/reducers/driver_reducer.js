import {
  FETCH_DRIVER_INFO,
} from '../actions/types';

const INITIAL_STATE = {
  driverInfo: {}
};


export default (state = INITIAL_STATE, action) => { 
  switch (action.type) {
    case FETCH_DRIVER_INFO:
      return { ...state, driverInfo: action.payload };

    default:
      return state;
  }
};
