import localforage from 'localforage';

const storeConfig = {
    blacklist: [],
    key: 'worldvision-dvs',
    version: 1,
    storage: localforage,
};


export default storeConfig;
