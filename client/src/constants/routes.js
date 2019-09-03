import {
    mapToMap,
    mapToList,
} from '@togglecorp/fujs';

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

export const pathNames = mapToMap(
    routes,
    (route, data) => data.path,
);

export const routesOrder = mapToList(
    routes,
    (route, key) => ({
        key,
        order: route.order,
    }),
)
    .sort((a, b) => a.order - b.order)
    .map(row => row.key);
