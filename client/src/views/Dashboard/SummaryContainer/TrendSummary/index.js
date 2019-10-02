import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    mapToList,
    listToGroupList,
    _cs,
} from '@togglecorp/fujs';

import {
    createConnectedRequestCoordinator,
    createRequestClient,
} from '#request';

import GroupedBarChart from '#rscz/GroupedBarChart';

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
        url: ({ props: { id } }) => `/summary-groups/${id}/trend/`,
        onMount: true,
        onPropsChanged: ['id', 'name'],
    },
};

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
    );

    return values;
};

const transformChildMonitoring = (values) => {
    const transformedValues = values.map((value) => {
        const {
            'Not Sighted More than 30 Days & Less than 60 Days': lessThanSixty = 0,
            'Not Sighted More than 60 Days & Less than 90 Days': lessThanNinety = 0,
            ...others
        } = value;

        return { ...others, 'Not Sighted Less than 90 Days': (lessThanSixty + lessThanNinety) };
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
        });
    });

    getHealthData = memoize((healthNutrition) => {
        const values = getChartData(healthNutrition);

        return ({
            values,
            columns: ['Health Satisfactory', 'Health Not Satisfactory'],
        });
    });

    getChildMonitoringData = memoize((childMonitoring) => {
        const values = transformChildMonitoring(getChartData(childMonitoring));

        return ({
            values,
            columns: [
                'Not Sighted Less than 90 Days',
                'Not Sighted More than 90 Days',
            ],
        });
    });

    getCorrespondenceData = memoize((correspondences) => {
        const values = getChartData(correspondences);

        return ({
            values,
            columns: ['Pending Current', 'Pending Overdue'],
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
            education = [],
        } = response;

        const rcData = this.getRcData(rc);
        const healthData = this.getHealthData(healthNutrition);
        const childMonitoringData = this.getChildMonitoringData(childMonitoring);
        const correspondenceData = this.getCorrespondenceData(correspondences);
        const educationData = this.getEducationData(education);

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
                <div className={_cs(styles.childMonitoring)}>
                    <h3> Child Monitoring Trend </h3>
                    <GroupedBarChart
                        data={childMonitoringData}
                        groupSelector={groupSelector}
                        lineDataSelector={childMonitoringLineSelector}
                    />
                </div>
                <div className={_cs(styles.healthNutrition)}>
                    <h3> Health Nutrition Trend </h3>
                    <GroupedBarChart
                        data={healthData}
                        groupSelector={groupSelector}
                    />
                </div>
                <div className={_cs(styles.correspondence)}>
                    <h3> Correspondence Trend </h3>
                    <GroupedBarChart
                        data={correspondenceData}
                        groupSelector={groupSelector}
                    />
                </div>
                <div className={_cs(styles.education)}>
                    <h3> Education Trend </h3>
                    <GroupedBarChart
                        data={educationData}
                        groupSelector={groupSelector}
                    />
                </div>
            </div>
        );
    }
}

export default createConnectedRequestCoordinator()(
    createRequestClient(requests)(TrendSummary),
);
