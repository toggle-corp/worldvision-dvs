import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import {
    _cs,
    mapToList,
    camelToNormal,
} from '@togglecorp/fujs';

import {
    reportSelector,
    setReportAction,
} from '#redux';

import {
    createConnectedRequestCoordinator,
    createRequestClient,
} from '#request';

import LoadingAnimation from '#rscv/LoadingAnimation';
import SunBurst from '#rscz/SunBurst';
import HorizontalBar from '#rscz/HorizontalBar';
import DonutChart from '#rscz/DonutChart';
import ListView from '#rscv/List/ListView';
import List from '#rscv/List';
import KeyValue from '#components/KeyValue';

import CorrespondenceItem from './CorrespondenceItem';
import ReportMap from './ReportMap';
import {
    horizontalBarColorScheme,
    horizontalBarMargin,
    triColorScheme,
    biColorScheme,
} from './report-utils';

import styles from './styles.scss';

const propTypes = {
    setReport: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    projectId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    report: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line  react/no-unused-prop-types, react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    report: {},
    project: {},
};

const mapStateToProps = (state, props) => ({
    report: reportSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setReport: params => dispatch(setReportAction(params)),
});

const setHashToBrowser = (hash) => { window.location.hash = hash; };

const modifier = (element, key) => (
    {
        name: key === 'totalRc' ? 'Actual' : camelToNormal(key),
        value: element,
    }
);

const requests = {
    reportGetRequest: {
        url: ({ props: { projectId } }) => `/projects-report/${projectId}/`,
        onMount: true,
        onSuccess: ({ response, props: { setReport, projectId } }) => {
            setReport({ projectId, report: response });
        },
    },
};

class Report extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static sizeSelector = (d) => {
        if (d.name !== 'RC Supply') {
            return d.size;
        }
        return null;
    };

    static valueSelector = d => d.value;

    static labelSelector = (d) => {
        if (d.name !== 'RC Supply') {
            return d.name;
        }
        return null;
    };

    static labelModifierSelector = (label, value) => (`
        <div>
            ${label}:
            <span>
                ${value}
            </span>
        </div>
    `);

    static tableKeySelector = d => d.name;

    static healthKeySelector = d => d.key;

    static childKeySelector = d => d.key;

    static correspondenceKeySelector = d => d.typeName;

    tableRenderParams = (key, data) => {
        if (key === '@cms') {
            return ({
                title: data.name,
                value: data.value,
                percent: data.percent,
                isPercent: true,
            });
        }

        const isSuccess = key === '@NotSighted30Days'
            || key === '@HealthSatisfactory'
            || key === '@VisitCompleted'
            || key === 'pendingCurrent'
            || key === 'good';

        const isWarning = key === '@NotSighted60Days';

        const isDanger = key === '@NotSighted90Days'
            || key === '@HealthNotSatisfactory'
            || key === 'pendingOverDue'
            || data.type === 'bad';

        return ({
            title: data.name,
            value: data.value,
            className: _cs(
                isSuccess && styles.success,
                isWarning && styles.warning,
                isDanger && styles.danger,
            ),
        });
    };

    correspondencesParams = (key, data) => ({
        title: data.typeName,
        data,
    });

    handleGoBack = () => {
        setHashToBrowser('/');
    };

    getChildMonitoringData = memoize((childMonitoring = []) => {
        const childDonutKeys = [
            '@NotSighted30DaysAndVisitCompleted',
            '@NotSighted60Days',
            '@NotSighted90Days',
        ];
        const notSighted30DaysAndVisited = {
            key: '@NotSighted30DaysAndVisitCompleted',
            name: '',
            value: 0,
        };

        const monitoring = [];
        let total = 0;
        let notsighted = 0;

        childMonitoring.forEach((out) => {
            total += +out.value;
            if (out.key === '@NotSighted90Days') {
                notsighted = out.value;
            }
            if (out.key === '@NotSighted30Days' || out.key === '@VisitCompleted') {
                notSighted30DaysAndVisited.name += ` ${out.name}`;
                notSighted30DaysAndVisited.value += out.value;
            } else {
                monitoring.push(out);
            }
        });

        const percent = total ? (((total - notsighted) / total) * 100) : 0;

        const newChildMonitoring = [
            ...childMonitoring,
            {
                key: '@cms',
                name: 'CMS',
                value: (total - notsighted),
                percent: +percent.toFixed(2),
            },
        ];

        const finalMonitoringData = [
            notSighted30DaysAndVisited,
            ...monitoring,
        ];

        const childDonutData = finalMonitoringData.filter(c => childDonutKeys.indexOf(c.key) >= 0);

        return ({
            childMonitoring: newChildMonitoring,
            childDonutData,
        });
    })

    getSortedRemoteChildren = memoize((rcData = {}) => {
        const remoteChildren = mapToList(rcData, modifier);

        const sortKeys = [
            'Total Female',
            'Total Male',
            'Death',
            'Hold',
            'Available',
            'Sponsored',
            'Actual',
            'Planned',
        ];

        return [...remoteChildren].sort(
            (c1, c2) => sortKeys.indexOf(c1.name) - sortKeys.indexOf(c2.name),
        );
    })

    getHealthDonutData = memoize((healthNutrition = []) => {
        const healthDonutKeys = [
            '@HealthSatisfactory',
            '@HealthNotSatisfactory',
        ];

        const healthDonut = healthNutrition.filter(c => healthDonutKeys.indexOf(c.key) >= 0);
        return healthDonut;
    })

    getCorrespondenceData = memoize((correspondences = []) => {
        const correspondencesTotal = correspondences.reduce((acc, d) => ({
            pendingCurrent: acc.pendingCurrent + d.pendingCurrent,
            pendingOverDue: acc.pendingOverDue + d.pendingOverDue,
        }), {
            pendingCurrent: 0,
            pendingOverDue: 0,
        });

        return [
            {
                ...correspondencesTotal,
                typeName: 'Total',
            },
            ...correspondences,
        ];
    })

    render() {
        const {
            report,
            project,
            requests: {
                reportGetRequest: {
                    pending: reportGetPending,
                },
            },
        } = this.props;

        if (!report) {
            return (
                <div className={_cs(styles.region, styles.noRegionFound)}>
                    <div className={styles.heading}>
                        The report you are looking for does not exist.
                        <button
                            className={styles.goBack}
                            onClick={this.handleGoBack}
                            type="button"
                        >
                            Click here to go back
                        </button>
                    </div>
                </div>
            );
        }

        const {
            data: {
                education = {},
                healthNutrition,
                rcData,
                childMonitoring: childMonitoringFromProps,
                correspondences: correspondencesFromProps,
            } = {},
        } = report;

        const remoteChildren = this.getSortedRemoteChildren(rcData);

        const {
            childMonitoring,
            childDonutData,
        } = this.getChildMonitoringData(childMonitoringFromProps);

        const healthDonut = this.getHealthDonutData(healthNutrition);
        const correspondences = this.getCorrespondenceData(correspondencesFromProps);

        return (
            <div className={styles.region}>
                { reportGetPending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <div className={styles.heading}>
                        <button
                            className={styles.goBack}
                            onClick={this.handleGoBack}
                            type="button"
                        >
                            <span className="ion-android-arrow-back" />
                        </button>
                        {project.name}
                    </div>
                </div>
                <div className={styles.container}>
                    <div className={styles.upperContainer}>
                        <ReportMap
                            className={styles.map}
                            project={project}
                        />
                        <div className={styles.tableContainer}>
                            <div className={styles.item}>
                                <h3>Child Monitoring</h3>
                                <div className={styles.vizWrapper}>
                                    <ListView
                                        className={styles.table}
                                        data={childMonitoring}
                                        rendererParams={this.tableRenderParams}
                                        keySelector={Report.childKeySelector}
                                        renderer={KeyValue}
                                    />
                                    <DonutChart
                                        className={styles.viz}
                                        sideLengthRatio={0.2}
                                        data={childDonutData}
                                        hideLabel
                                        valueSelector={Report.valueSelector}
                                        labelSelector={Report.labelSelector}
                                        labelModifier={Report.labelModifierSelector}
                                        colorScheme={triColorScheme}
                                    />
                                </div>
                            </div>
                            <div className={styles.item}>
                                <h3>Health/Nutrition</h3>
                                <div className={styles.vizWrapper}>
                                    <ListView
                                        className={styles.table}
                                        data={healthNutrition}
                                        rendererParams={this.tableRenderParams}
                                        keySelector={Report.healthKeySelector}
                                        renderer={KeyValue}
                                    />
                                    <DonutChart
                                        className={styles.viz}
                                        hideLabel
                                        sideLengthRatio={0.2}
                                        data={healthDonut}
                                        valueSelector={Report.valueSelector}
                                        labelSelector={Report.labelSelector}
                                        labelModifier={Report.labelModifierSelector}
                                        colorScheme={biColorScheme}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.lowerContainer}>
                        <div className={styles.item}>
                            <h3>RC Data</h3>
                            <div className={styles.vizContainer}>
                                <HorizontalBar
                                    className={styles.viz}
                                    data={remoteChildren}
                                    valueSelector={Report.valueSelector}
                                    labelSelector={Report.labelSelector}
                                    showGridLines={false}
                                    colorScheme={horizontalBarColorScheme}
                                    margins={horizontalBarMargin}
                                />
                            </div>
                        </div>
                        <div className={styles.item}>
                            <h3>Education</h3>
                            <div className={styles.vizContainer}>
                                <SunBurst
                                    className={styles.viz}
                                    data={education}
                                    valueSelector={Report.sizeSelector}
                                    labelSelector={Report.labelSelector}
                                />
                            </div>
                        </div>
                        <div className={styles.item}>
                            <h3>Correspondence</h3>
                            <div className={styles.tables}>
                                <List
                                    data={correspondences}
                                    rendererParams={this.correspondencesParams}
                                    keySelector={Report.correspondenceKeySelector}
                                    renderer={CorrespondenceItem}
                                />
                            </div>
                        </div>
                        <div className={styles.item}>
                            <h3>Participation / Support</h3>
                        </div>
                        <div className={styles.item}>
                            <h3>RC Distribution Based on Language & People Group</h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    createConnectedRequestCoordinator()(
        createRequestClient(requests)(Report),
    ),
);
