import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

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
            titleClassName,
            colorOnlyNumber,
        } = this.props;

        const titleClassNames = [styles.title, titleClassName];
        const percentClassName = [styles.percent, className];
        const percentValueClassName = [styles.percentValue, className];
        const valueClassName = [styles.value, className];

        if (!colorOnlyNumber) {
            titleClassNames.push(className);
        }

        return (
            <div className={styles.item}>
                <span className={titleClassNames.join(' ')}>
                    {title}
                </span>
                {isPercent ? (
                    <div className={styles.percentContainer}>
                        <Numeral
                            className={percentClassName.join(' ')}
                            value={percent}
                            precision={percent ? 2 : 0}
                            suffix={percent ? '%' : ''}
                        />
                        <Numeral
                            className={percentValueClassName.join(' ')}
                            value={value}
                            precision={0}
                        />
                    </div>
                ) : (
                    <Numeral
                        className={valueClassName.join(' ')}
                        value={value}
                        precision={0}
                    />
                )}
            </div>
        );
    }
}
