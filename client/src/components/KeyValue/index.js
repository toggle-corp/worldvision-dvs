import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number,
    isPercent: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    isPercent: false,
    percent: 0,
};

// eslint-disable-next-line
export default class KeyValue extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            title,
            value,
            percent,
            isPercent,
            className,
        } = this.props;

        return (
            <div className={styles.item} >
                <span className={`${className} ${styles.title}`}>
                    {title}
                </span>
                {isPercent ? (
                    <div className={styles.percentContainer} >
                        <Numeral
                            className={`${className} ${styles.percent}`}
                            value={percent}
                            precision={percent ? 2 : 0}
                            suffix={percent ? '%' : ''}
                        />
                        <Numeral
                            className={`${className} ${styles.percentValue}`}
                            value={value}
                            precision={0}
                        />
                    </div>
                ) : (
                    <Numeral
                        className={`${className} ${styles.value}`}
                        value={value}
                        precision={0}
                    />
                )}
            </div>
        );
    }
}
