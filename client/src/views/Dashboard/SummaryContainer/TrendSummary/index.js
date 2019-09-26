import React from 'react';
import PropTypes from 'prop-types';
import {
    mapToList,
    listToGroupList,
    _cs,
} from '@togglecorp/fujs';

import GroupedBarChart from '#rscz/GroupedBarChart';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    trend: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    trend: {},
    className: undefined,
};

export default class TrendSummary extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getRcData = (rc) => {
        const groupByDate = listToGroupList(
            rc,
            item => item.date,
        );
        const keys = ['planned', 'available', 'sponsored', 'totalRc'];

        const values = mapToList(
            groupByDate,
            (data, date) => {
                const filtered = data.filter(d => keys.includes(d.key))
                    .map(({ key, value }) => ({ [key]: value }));

                return Object.assign({ date }, ...filtered);
            },
        );

        return {
            values,
            columns: keys,
            colors: {
                planned: '#00E396',
                available: '#FEB019',
                sponsored: '#FF4560',
                totalRc: '#775DD0',
            },
        };
    }

    render() {
        const {
            trend,
            className,
        } = this.props;

        const { rc = [] } = trend;
        const rcData = this.getRcData(rc);

        return (
            <div className={_cs(styles.trend, className)}>
                <GroupedBarChart
                    data={rcData}
                    groupSelector={d => d.date}
                    lineDataSelector={d => d.planned}
                />
            </div>
        );
    }
}
