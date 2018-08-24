import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from '#redux/middlewares/logger';
import reducer from '#redux/reducers';

const prepareStore = () => {
    // Invoke refresh access token every 10m
    const middleware = [
        logger,
        thunk,
    ];

    // Get compose from Redux Devtools Extension
    // eslint-disable-next-line no-underscore-dangle
    const reduxExtensionCompose = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    // Override compose if development mode and redux extension is installed
    const overrideCompose = process.env.NODE_ENV === 'development' && reduxExtensionCompose;
    const applicableComposer = !overrideCompose
        ? compose
        : reduxExtensionCompose({ /* specify extention's options here */ });

    const enhancer = applicableComposer(
        applyMiddleware(...middleware),
    );
    return createStore(reducer, undefined, enhancer);
};


const isTest = process.env.NODE_ENV === 'test';

// NOTE: replace 'undefined' with an initialState in future if needed
const store = !isTest ? prepareStore() : undefined;

export default store;
