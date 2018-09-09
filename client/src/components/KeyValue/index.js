import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
};

// eslint-disable-next-line
export default class KeyValue extends PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            title,
            value,
        } = this.props;

        return (
            <div className={styles.item} >
                <span className={styles.title}>{title}</span>
                <Numeral
                    className={styles.value}
                    value={value}
                    precision={0}
                />
            </div>
        );
    }
}
