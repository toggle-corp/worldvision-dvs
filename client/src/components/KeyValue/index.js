import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

// eslint-disable-next-line
export default class KeyValue extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            title,
            value,
            className,
        } = this.props;

        return (
            <div className={styles.item} >
                <span className={`${className} ${styles.title}`}>
                    {title}
                </span>
                <Numeral
                    className={`${className} ${styles.value}`}
                    value={value}
                    precision={0}
                />
            </div>
        );
    }
}
