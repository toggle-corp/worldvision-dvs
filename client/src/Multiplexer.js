import React, { Fragment } from 'react';
import {
    Switch,
    Route,
    withRouter,
} from 'react-router-dom';

import ExclusivelyPublicRoute from '#rscg/ExclusivelyPublicRoute';
import PrivateRoute from '#rscg/PrivateRoute';

import Navbar from '#components/Navbar';

import {
    pathNames,
    routesOrder,
    routes,
    views,
} from '#constants';

const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

// NOTE: withRouter is required here so that link change are updated

@withRouter
export default class Multiplexer extends React.PureComponent {
    renderRoutes = () => (
        routesOrder.map((routeId) => {
            const view = views[routeId];
            if (!view) {
                console.error(`Cannot find view associated with routeID: ${routeId}`);
                return null;
            }
            const path = pathNames[routeId];
            const { redirectTo, type } = routes[routeId];

            // FIXME: Use actual authenticated status from redux
            const authenticated = false;

            switch (type) {
                case ROUTE.exclusivelyPublic:
                    return (
                        <ExclusivelyPublicRoute
                            component={view}
                            key={routeId}
                            path={path}
                            authenticated={authenticated}
                            redirectLink={redirectTo}
                            exact
                        />
                    );
                case ROUTE.private:
                    return (
                        <PrivateRoute
                            component={view}
                            key={routeId}
                            path={path}
                            authenticated={authenticated}
                            redirectLink={redirectTo}
                            exact
                        />
                    );
                case ROUTE.public:
                    return (
                        <Route
                            component={view}
                            key={routeId}
                            path={path}
                            exact
                        />
                    );
                default:
                    console.error(`Invalid route type ${type}`);
                    return null;
            }
        })
    )

    render() {
        return (
            <Fragment>
                <Navbar className="navbar" />
                <div className="main-content">
                    <Switch>
                        { this.renderRoutes() }
                    </Switch>
                </div>
            </Fragment>
        );
    }
}
