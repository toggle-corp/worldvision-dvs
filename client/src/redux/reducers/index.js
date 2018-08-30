import { persistCombineReducers } from 'redux-persist';
import storeConfig from '#config/store';

import domainDataReducer from './domainData';

const reducers = {
    domainData: domainDataReducer,
};

const reducer = persistCombineReducers(storeConfig, reducers);
export default reducer;
