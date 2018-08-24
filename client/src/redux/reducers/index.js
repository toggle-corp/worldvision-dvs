import { persistCombineReducers } from 'redux-persist';
import storeConfig from '#config/store';

const reducers = {
    dummy: (s = {}) => s,
};

const reducer = persistCombineReducers(storeConfig, reducers);
export default reducer;
