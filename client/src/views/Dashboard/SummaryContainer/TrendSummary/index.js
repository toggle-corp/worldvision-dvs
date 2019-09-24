import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

export default class TrendSummary extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        return (
            <div className={_cs(styles.trend, className)}>
                Trends
            </div>
        );
    }
}
