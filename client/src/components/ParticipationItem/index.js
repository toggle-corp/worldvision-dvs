import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

const propTypes = {
    male: PropTypes.number,
    female: PropTypes.number,
    total: PropTypes.number,
    participation: PropTypes.string.isRequired,
};

const defaultProps = {
    male: 0,
    female: 0,
    total: 0,
};

export default class ParticipationItem extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            male,
            female,
            total,
            participation,
        } = this.props;

        return (
            <div className={styles.participationItem}>
                <div className={styles.left}>
                    {`Participation ${participation}`}
                </div>
                <div className={styles.right}>
                    <span>
                        Total:
                        <Numeral
                            className={styles.total}
                            precision={0}
                            value={total}
                        />
                    </span>
                    <div className={styles.bottomRight}>
                        <Numeral
                            className={styles.count}
                            precision={0}
                            value={male}
                        />
                        Male |
                        <Numeral
                            className={styles.count}
                            precision={0}
                            value={female}
                        />
                        Female
                    </div>
                </div>
            </div>
        );
    }
}
