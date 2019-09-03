import React from 'react';
import RouteSynchronizer from '#components/RouteSynchronizer';
import { routes } from './routes';

export const mapObjectToObject = (obj, fn) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        newObj[key] = fn(obj[key], key);
    });
    return newObj;
};

const views = mapObjectToObject(
    routes,
    (route, name) => props => (
        <RouteSynchronizer
            {...props}
            load={route.loader}
            name={name}
        />
    ),
);

export default views;
