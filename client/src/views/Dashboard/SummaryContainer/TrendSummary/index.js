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

const groupByDate = data => listToGroupList(
    data,
    item => item.date,
);

const getChartData = (rawData, keyMap) => {
    const group = groupByDate(rawData);
    const keys = Object.keys(keyMap);

    const values = mapToList(
        group,
        (data, date) => {
            const filtered = data.filter(d => keys.includes(d.key))
                .map(({ key, value }) => {
                    const { label } = keyMap[key];
                    return { [label]: value };
                });
            return Object.assign({ date }, ...filtered);
        },
    );

    const colors = Object.values(keyMap).map(d => ({ [d.label]: d.color }));

    return {
        values,
        columns: Object.values(keyMap).map(d => d.label),
        colors: Object.assign({}, ...colors),
    };
};

const groupSelector = d => d.date;
const rcLineSelector = d => d.Planned;
const healthNutritionLineSelector = d => d['Health Satisfactory'];

export default class TrendSummary extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            trend,
            className,
        } = this.props;

        const {
            rc = [],
            healthNutrition = [],
            childMonitoring = [],
        } = trend;

        const rcKeyMap = {
            planned: {
                label: 'Planned',
                color: '#00E396',
            },
            available: {
                label: 'Available',
                color: '#FEB019',
            },
            sponsored: {
                label: 'Sponsored',
                color: '#FF4560',
            },
            totalRc: {
                label: 'Total Rc',
                color: '#775DD0',
            },
        };

        const healthNutritionMap = {
            '@HealthSatisfactory': {
                label: 'Health Satisfactory',
                color: '#00E396',
            },
            '@HealthNotSatisfactory': {
                label: 'Health Not Satisfactory',
                color: '#FEBO19',
            },
        };

        const rcData = getChartData(rc, rcKeyMap);
        const healthData = getChartData(healthNutrition, healthNutritionMap);

        return (
            <div className={_cs(styles.trend, className)}>
                <div className={_cs(styles.rcTrend)}>
                    <h3> RC Supply Trend </h3>
                    <GroupedBarChart
                        data={rcData}
                        groupSelector={groupSelector}
                        lineDataSelector={rcLineSelector}
                    />
                </div>
                <div className={_cs(styles.healthNutrition)}>
                    <h3> Health Nutrition Trend </h3>
                    <GroupedBarChart
                        data={healthData}
                        groupSelector={groupSelector}
                        lineDataSelector={healthNutritionLineSelector}
                    />
                </div>
            </div>
        );
    }
}
