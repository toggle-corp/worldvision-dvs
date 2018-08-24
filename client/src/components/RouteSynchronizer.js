import Helmet from 'react-helmet';
import React, { Fragment } from 'react';

import Bundle from '#rscg/Bundle';
import { routes } from '#constants/routes';

export default ({ name, ...otherProps }) => (
    <Fragment>
        <Helmet>
            <meta charSet="utf-8" />
            <title>
                World Vision DVS - { name }
            </title>
        </Helmet>
        <Bundle name={name} {...otherProps} />
    </Fragment>
);
