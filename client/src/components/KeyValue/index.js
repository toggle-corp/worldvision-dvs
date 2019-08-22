import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    titleClassName: PropTypes.string,
    value: PropTypes.number,
    percent: PropTypes.number,
    isPercent: PropTypes.bool,
    className: PropTypes.string,
    colorOnlyNumber: PropTypes.bool,
};

const defaultProps = {
    value: undefined,
    className: '',
    titleClassName: '',
    isPercent: false,
    percent: undefined,
    colorOnlyNumber: false,
};

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
            titleClassName,
            colorOnlyNumber,
        } = this.props;

        return (
            <div className={styles.item}>
                <span
                    className={
                        _cs(
                            styles.title,
                            titleClassName,
                            !colorOnlyNumber && className,
                        )
                    }
                >
                    {title}
                </span>
                {isPercent ? (
                    <div className={styles.percentContainer}>
                        <Numeral
                            className={_cs(styles.percent, className)}
                            value={percent}
                            precision={percent ? 2 : 0}
                            suffix={percent ? '%' : ''}
                        />
                        <Numeral
                            className={_cs(styles.percentValue, className)}
                            value={value}
                            precision={0}
                        />
                    </div>
                ) : (
                    <Numeral
                        className={_cs(styles.value, className)}
                        value={value}
                        precision={0}
                    />
                )}
            </div>
        );
    }
}
