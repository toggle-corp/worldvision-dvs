import {
    mapObjectToObject,
    mapObjectToArray,
} from '#utils/common';

export const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

// Routes

export const routes = {
    dashboard: {
        order: 1,
        type: ROUTE.public,
        path: '/:projectId?/',
        loader: () => import('../views/Dashboard'),
    },
};

export const pathNames = mapObjectToObject(routes, route => route.path);
export const routesOrder = mapObjectToArray(
    routes,
    (route, key) => ({
        key,
        order: route.order,
    }),
)
    .sort((a, b) => a.order - b.order)
    .map(row => row.key);
