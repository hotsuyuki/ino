import { combineReducers } from 'redux';

import RiderReducer from './rider_reducer';


export default combineReducers({
  riderReducer: RiderReducer,
});
