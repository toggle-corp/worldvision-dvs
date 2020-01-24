import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    _cs,
    mapToList,
    listToGroupList,
} from '@togglecorp/fujs';

import {
    createConnectedRequestCoordinator,
    createRequestClient,
} from '#request';

import GroupedBarChart from '#rscz/GroupedBarChart';
import Legend from '#rscz/Legend';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    id: undefined,
};

const requests = {
    summaryTrendRequest: {
        url: '/projects-summary-trend/',
        onMount: true,
    },
    summaryGroupTrendRequest: {
        // FIXME do not send request if id is undefined
        url: ({ props: { id } }) => `/summary-groups/${id}/trend/`,
        onMount: true,
        onPropsChanged: ['id', 'name'],
    },
};

const rcLegendData = [
    {
        key: 'Planned RC',
        label: 'Planned RC',
        color: '#44df96',
    },
    {
        key: 'Actual RC',
        label: 'Actual RC',
        color: '#8c3dc3',
    },
    {
        key: 'Sponsored',
        label: 'Sponsored RC',
        color: '#ff6641',
    },
    {
        key: 'Available',
        label: 'Available RC',
        color: '#0082de',
    },
];

const childMonitoringLegendData = [
    {
        key: 'Sighted Less than 90 Days',
        label: 'Sighted Less than 90 Days',
        color: '#44df96',
    },
    {
        key: 'Not Sighted More than 90 Days',
        label: 'Not Sighted More than 90 Days',
        color: '#c25be2',
    },
];

const healthNutritionLegendData = [
    {
        key: 'Health Satisfactory',
        label: 'Health Satisfactory',
        color: '#ff8042',
    },
    {
        key: 'Health Not Satisfactory',
        label: 'Health Not Satisfactory',
        color: '#027efd',
    },
];

const correspondenceLegendData = [
    {
        key: 'Pending Current',
        label: 'Pending Current',
        color: '#44df96',
    },
    {
        key: 'Pending Overdue',
        label: 'Pending Overdue',
        color: '#c25be2',
    },
];

const educationLegendData = [
    {
        key: 'Involved in education',
        label: 'Involved in education',
        color: '#ff8042',
    },
    {
        key: 'Not involved in education',
        label: 'Not involved in education',
        color: '#027efd',
    },
];

const soiLegendData = [
    {
        key: 'Total Closed',
        label: 'Total Closed',
        color: '#44df96',
    },
    {
        key: 'Closed On',
        label: 'Closed On Time',
        color: '#c25be2',
    },
];

const legendKeySelector = d => d.key;
const legendLabelSelector = d => d.label;
const legendColorSelector = d => d.color;

const groupByDate = data => listToGroupList(
    data,
    item => item.date,
);

const getChartData = (rawData) => {
    const group = groupByDate(rawData);
    const keys = rawData.map(d => d.key);

    const values = mapToList(
        group,
        (data, date) => {
            const filtered = data.filter(d => keys.includes(d.key))
                .map(({ label, value }) => ({ [label]: value }));

            return Object.assign({ date }, ...filtered);
        },
    ).sort((a, b) => (new Date(b.date) - new Date(a.date)));

    return values;
};
const transformChildMonitoring = (values) => {
    const transformedValues = values.map((value) => {
        const {
            'Not Sighted More than 30 Days & Less than 60 Days': lessThanSixty = 0,
            'Not Sighted More than 60 Days & Less than 90 Days': lessThanNinety = 0,
            ...others
        } = value;

        return { ...others, 'Sighted Less than 90 Days': (lessThanSixty + lessThanNinety) };
    });

    return transformedValues;
};

const transformEducation = (values) => {
    const transformedValues = values.map((value) => {
        const {
            'RC of Secondary School Age Not Involved in Education or Vocational Preparation': secondary,
            'RC of Primary School Age Not Involved in Education': primary,
            date,
            ...others
        } = value;
        const involved = Object.values(others).reduce((a, b) => a + b, 0);
        const notInvolved = primary + secondary;

        return {
            date,
            'Involved in education': involved,
            'Not involved in education': notInvolved,
        };
    });

    return transformedValues;
};

const groupSelector = d => d.date;
const rcLineSelector = d => d['Planned RC'];
const childMonitoringLineSelector = d => d['Not Sighted More than 90 Days'];

class TrendSummary extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    getRcData = memoize((rc) => {
        const values = getChartData(rc);

        return ({
            values,
            columns: ['Planned RC', 'Actual RC', 'Sponsored', 'Available'],
            colors: {
                'Planned RC': '#44df96',
                'Actual RC': '#8c3dc3',
                Sponsored: '#ff6641',
                Available: '#0082de',
            },
        });
    });

    getHealthData = memoize((healthNutrition) => {
        const values = getChartData(healthNutrition);

        return ({
            values,
            columns: ['Health Satisfactory', 'Health Not Satisfactory'],
            colors: {
                'Health Satisfactory': '#ff8042',
                'Health Not Satisfactory': '#027efd',
            },
        });
    });

    getChildMonitoringData = memoize((childMonitoring) => {
        const values = transformChildMonitoring(getChartData(childMonitoring));

        return ({
            values,
            columns: [
                'Sighted Less than 90 Days',
                'Not Sighted More than 90 Days',
            ],
            colors: {
                'Sighted Less than 90 Days': '#44df96',
                'Not Sighted More than 90 Days': '#c25be2',
            },
        });
    });

    getCorrespondenceData = memoize((correspondences) => {
        const values = getChartData(correspondences);

        return ({
            values,
            columns: ['Pending Current', 'Pending Overdue'],
            colors: {
                'Pending Current': '#44df96',
                'Pending Overdue': '#c25be2',
            },
        });
    });

    getEducationData = memoize((education) => {
        const values = transformEducation(getChartData(education));

        return ({
            values,
            columns: [
                'Involved in education',
                'Not involved in education',
            ],
            colors: {
                'Involved in education': '#ff8042',
                'Not involved in education': '#027efd',
            },
        });
    });

    getSoiData = memoize((soi) => {
        const values = getChartData(soi);

        return ({
            values,
            columns: [
                'Total Closed',
                'Closed On',
            ],
            colors: {
                'Total Closed': '#44df96',
                'Closed On': '#c25be2',
            },
        });
    });

    render() {
        const {
            id,
            name,
            className,
            requests: {
                summaryGroupTrendRequest: {
                    response: summaryGroupResponse,
                },
                summaryTrendRequest: {
                    response: summaryResponse,
                },
            },
        } = this.props;

        let response = {};
        if (!id && name === 'overview') {
            response = summaryResponse || {};
        } else {
            response = (summaryGroupResponse || {}).summary || {};
        }

        const {
            rc = [],
            healthNutrition = [],
            childMonitoring = [],
            correspondences = [],
            soi = [],
            education = [],
        } = response;

        const rcData = this.getRcData(rc);
        const healthData = this.getHealthData(healthNutrition);
        const childMonitoringData = this.getChildMonitoringData(childMonitoring);
        const correspondenceData = this.getCorrespondenceData(correspondences);
        const educationData = this.getEducationData(education);
        const soiData = this.getSoiData(soi);

        return (
            <div className={_cs(styles.trend, className)}>
                <div className={_cs(styles.item)}>
                    <h3> RC Supply Trend </h3>
                    <GroupedBarChart
                        data={rcData}
                        groupSelector={groupSelector}
                        lineDataSelector={rcLineSelector}
                        showValue
                    />
                    <Legend
                        className={styles.legend}
                        data={rcLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
                <div className={_cs(styles.item)}>
                    <h3> Child Monitoring Trend </h3>
                    <GroupedBarChart
                        data={childMonitoringData}
                        groupSelector={groupSelector}
                        lineDataSelector={childMonitoringLineSelector}
                        showValue
                    />
                    <Legend
                        className={styles.legend}
                        data={childMonitoringLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
                <div className={_cs(styles.item)}>
                    <h3> Health Nutrition Trend </h3>
                    <GroupedBarChart
                        data={healthData}
                        groupSelector={groupSelector}
                        showValue
                    />
                    <Legend
                        className={styles.legend}
                        data={healthNutritionLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
                <div className={_cs(styles.item)}>
                    <h3> Correspondence Trend </h3>
                    <GroupedBarChart
                        data={correspondenceData}
                        groupSelector={groupSelector}
                        showValue
                    />
                    <Legend
                        className={styles.legend}
                        data={correspondenceLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
                <div className={_cs(styles.item)}>
                    <h3> Education Trend </h3>
                    <GroupedBarChart
                        data={educationData}
                        groupSelector={groupSelector}
                        showValue
                    />
                    <Legend
                        className={styles.legend}
                        data={educationLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
                <div className={_cs(styles.item)}>
                    <h3> SOI Trend </h3>
                    <GroupedBarChart
                        data={soiData}
                        groupSelector={groupSelector}
                        showValue
                    />
                    <Legend
                        className={styles.legend}
                        data={soiLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
            </div>
        );
    }
}

export default createConnectedRequestCoordinator()(
    createRequestClient(requests)(TrendSummary),
);
