import { combineReducers } from 'redux';

import DriverReducer from './driver_reducer';


export default combineReducers({
  driverReducer: DriverReducer,
});
