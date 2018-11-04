import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import List from '#rscv/List';

import Segment from './Segment';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.array.isRequired,
};

const defaultProps = {
    className: '',
};

export default class PercentLine extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, segment, i) => {
        const {
            data,
            valueSelector,
            labelSelector,
            colorScheme,
        } = this.props;

        const totalValue = data.reduce((acc, d) => (acc + valueSelector(d)), 0);

        return ({
            key,
            segment,
            style: {
                width: `${(valueSelector(segment) / totalValue) * 100}%`,
                backgroundColor: colorScheme[i],
            },
        });
    }

    render() {
        const {
            keySelector,
            className,
            data,
        } = this.props;

        return (
            <div className={`${styles.percentLine} ${className}`}>
                <List
                    data={data}
                    keySelector={keySelector}
                    rendererParams={this.rendererParams}
                    renderer={Segment}
                />
            </div>
        );
    }
}
