import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
    mapToList,
    camelToNormal,
    compareDate,
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
import ListView from '#rscv/List/ListView';
import List from '#rscv/List';
import GaugeChart from '#rscz/GaugeChart';

import KeyValue from '#components/KeyValue';
import LanguagePeopleGroupDisability from '#components/LanguagePeopleGroupDisability';

import {
    transformMostVulnerableChildren,
    transformMostVulnerableChildrenByMarker,
} from '#utils/transform';

import CorrespondenceItem from './CorrespondenceItem';
import ReportMap from './ReportMap';
import {
    horizontalBarColorScheme,
    triColorScheme,
} from './report-utils';

import DonutChartReCharts from './DonutChart';
import HorizontalBarRecharts from './HorizontalBar';
import GroupedBarChartRecharts from './GroupedBarChart';

import styles from './styles.scss';

const soiColorScheme = ['#ef5350', '#fff176', '#81c784'];
const sectionPercents = [0.75, 0.1, 0.15];

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

const healthKeysToRemove = [
    '@NotVarifiedHealthGrowthCard',
    '@NotParticipatingHealthNutriActivities',
];

const requests = {
    reportGetRequest: {
        url: ({ props: { projectId } }) => `/projects-report/${projectId}/`,
        onMount: true,
        onSuccess: ({ response, props: { setReport, projectId } }) => {
            setReport({ projectId, report: response });
        },
    },
    soiGetRequest: {
        url: '/projects-soi/',
        query: ({ props: { projectId } }) => ({ project: projectId }),
        onMount: true,
    },
    languagePeopleGroupGetRequest: {
        url: ({ props: { projectId } }) => (
            `/project-language-people-group-disabilities/${projectId}/`
        ),
        onMount: true,
    },
};

const transformSoi = (soiData) => {
    if (isFalsy(soiData)) {
        return [];
    }

    const sortedSoi = soiData.sort((a, b) => {
        const { date: aDate } = a;
        const { date: bDate } = b;

        return compareDate(new Date(bDate), new Date(aDate));
    });

    const { 0: soi = {} } = sortedSoi;
    const {
        totalClosed,
        closedOn,
    } = soi;

    const getSoiRating = (closedOnValue, totalClosedValue) => {
        if (closedOnValue === undefined || totalClosedValue === undefined) {
            return 0;
        }
        if (totalClosedValue === 0 || closedOnValue > totalClosedValue) {
            return 0;
        }
        return closedOnValue / totalClosedValue * 100;
    };

    return ([
        {
            label: 'Total Closed',
            value: totalClosed !== undefined ? totalClosed : 0,
        },
        {
            label: 'Closed On Time',
            value: closedOn !== undefined ? closedOn : 0,
        },
        {
            label: 'SOI Rating',
            value: getSoiRating(closedOn, totalClosed),
        },
    ]);
};

const participationDetailsParams = (key, data) => ({
    title: data.comment,
    value: data.count_sum,
});
const participationKeySelector = d => d.comment;

const participationGroupSelector = d => d.type;

const participationGroupParams = d => ({
    children: d,
});

const mvcIndicatorKeySelector = d => d.label;

const mostVulnerableChildrenParams = (key, data) => ({
    title: data.label,
    value: data.value,
});

const mostVulnerableChildrenGroupParams = d => ({ children: d });

const mostVulnerableKeySelector = d => d.label;

const mostVulnerableGroupKeySelector = d => d.type;

const tableParams = (key, data) => {
    const isSoi = key === 'soi';
    const isPercent = key === 'percent';

    return ({
        title: data.label,
        value: data.value,
        percent: data.value,
        isPercent,
        showValue: !isPercent,
        colorOnlyNumber: true,
        titleClassName: _cs(isSoi && styles.bold),
    });
};
const mvcParams = (key, data, _, allData) => {
    const isMvc = key === 'Most Vulnerable Child (MVC) Count';
    if (isMvc) {
        const totalCount = allData.find(d => d.label === 'Total RC Count').value || 0;
        if (totalCount) {
            const percent = ((data.value / totalCount) * 100).toFixed(2);
            return ({
                title: `${data.label} (${percent})%`,
                value: data.value,
                percent: data.value,
                colorOnlyNumber: true,
            });
        }
    }
    return ({
        title: data.label,
        value: data.value,
        percent: data.value,
        colorOnlyNumber: true,
    });
};

const educationGroupRendererParams = (groupKey) => {
    const children = groupKey === '@PrimarySchoolAge'
        ? 'Primary School Age' : 'Secondary School Age';
    return ({ children });
};

const tableRenderParams = (key, data) => {
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
          || key.includes('rcEducation')
          || key === 'good';

    const isWarning = key === '@NotSighted60Days';

    const isDanger = key === '@NotSighted90Days'
          || key === '@HealthNotSatisfactory'
          || key === 'pendingOverDue'
          || key.includes('rcNoEducation')
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
const soiParams = (key, data) => {
    const isPercent = key === 'Rating';

    return ({
        title: data.label,
        value: data.value,
        percent: data.value,
        isPercent,
        showValue: !isPercent,
        colorOnlyNumber: true,
        titleClassName: styles.bold,
    });
};

const correspondencesParams = (key, data) => ({
    title: data.typeName,
    data,
});

class Report extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static sizeSelector = (d) => {
        if (d.children) {
            return 0;
        }
        return d.size;
    };

    static valueSelector = d => d.value;

    static labelSelector = (d) => {
        if (d.name !== 'RC Supm1ply') {
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

    static educationKeySelector = d => d.key;

    educationGroupKeySelector = d => d.groupKey;

    static correspondenceKeySelector = d => d.typeName;

    static soiKeySelector = d => d.label;

    getSoi = memoize(transformSoi);

    getMostVulnerableChildren = memoize(transformMostVulnerableChildren);

    getMostVulnerableChildrenByMarker = memoize(transformMostVulnerableChildrenByMarker);

    getSoiTrendData = memoize((soi = []) => {
        const values = soi.map((value) => {
            const { date, totalClosed, closedOn } = value;
            return {
                date,
                'Total Closed': totalClosed,
                'Closed On': closedOn,
            };
        }).sort((a, b) => (new Date(b.date) - new Date(a.date)));

        return ({
            values,
            columns: [
                'Total Closed',
                'Closed On',
            ],
            colors: {
                'Total Closed': '#41cf76',
                'Closed On': '#ef8c00',
            },
        });
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
                name: 'CMS Rating',
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

    getRemovedData = memoize((healthNutrition = [], keysToRemove) => (
        healthNutrition.filter(c => keysToRemove.indexOf(c.key) === -1)
    ))

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

    getFlatEducationData = memoize(({ children = [] } = {}) => {
        let educationData = [];
        children.forEach((ch) => {
            const newMap = {
                education: {
                    value: 0,
                    name: 'RC involved in Education',
                    key: `${ch.key}-rcEducation`,
                    groupKey: ch.key,
                },
                noEducation: {
                    value: 0,
                    name: 'RC not involved in Education',
                    key: `${ch.key}-rcNoEducation`,
                    groupKey: ch.key,
                },
            };
            ch.children.forEach(({
                key = '',
                size = 0,
            } = {}) => {
                if (key.includes('NoEducation')) {
                    newMap.noEducation.value += size;
                } else {
                    newMap.education.value += size;
                }
            });
            educationData = [
                ...educationData,
                ...mapToList(newMap, d => d),
            ];
        });
        return educationData;
    })

    render() {
        const {
            report,
            project,
            requests: {
                reportGetRequest: {
                    pending: reportGetPending,
                },
                soiGetRequest: {
                    response: soi,
                },
                languagePeopleGroupGetRequest: {
                    response: languagePeopleGroupDisability,
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
            supportPariticipationDetail,
            mostVulnerableChildrenIndicator,
            mostVulnerableChildrenVulnerabilityMarker,
        } = report;

        console.warn('support', supportPariticipationDetail);
        const remoteChildren = this.getSortedRemoteChildren(rcData);

        const soiValues = this.getSoi(soi);

        const totalSoi = (soiValues.find(s => s.label === 'Total Closed') || {}).value || 0;
        const closedSoi = (soiValues.find(s => s.label === 'Closed On Time') || {}).value || 0;

        const {
            childMonitoring,
            childDonutData,
        } = this.getChildMonitoringData(childMonitoringFromProps);

        const correspondences = this.getCorrespondenceData(correspondencesFromProps);
        const flatEducationData = this.getFlatEducationData(education);
        const soiTrendData = this.getSoiTrendData(soi);
        const mostVulnerableChildren = this.getMostVulnerableChildren(
            mostVulnerableChildrenIndicator,
        );
        const mostVulnerableChildrenMarker = this.getMostVulnerableChildrenByMarker(
            mostVulnerableChildrenVulnerabilityMarker,
        );

        const isEducationEmpty = Object.keys(education).length === 0;

        return (
            <div className={styles.region}>
                {reportGetPending && <LoadingAnimation />}
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
                        {
                            !isEducationEmpty && (
                                <div className={styles.item}>
                                    <h3>Education</h3>
                                    <div
                                        className={
                                            _cs(styles.vizContainer, styles.vizTableContainer)
                                        }
                                    >
                                        <SunBurst
                                            className={styles.viz}
                                            data={education}
                                            valueSelector={Report.sizeSelector}
                                            labelSelector={Report.labelSelector}
                                        />
                                        <ListView
                                            data={flatEducationData}
                                            keySelector={Report.educationKeySelector}
                                            renderer={KeyValue}
                                            groupRendererParams={educationGroupRendererParams}
                                            rendererParams={tableRenderParams}
                                            groupKeySelector={Report.educationGroupKeySelector}
                                        />
                                    </div>
                                </div>
                            )
                        }

                    </div>
                    <div className={styles.lowerContainer}>
                        <div className={styles.item}>
                            <h3>Child Monitoring Status</h3>
                            <div className={styles.vizContainer}>
                                <div className={styles.viz}>
                                    <DonutChartReCharts
                                        data={childDonutData}
                                        colorScheme={triColorScheme}
                                    />
                                </div>
                                <ListView
                                    className={styles.table}
                                    data={childMonitoring}
                                    rendererParams={tableRenderParams}
                                    keySelector={Report.childKeySelector}
                                    renderer={KeyValue}
                                />
                            </div>
                        </div>
                        <div className={styles.item}>
                            <h3>Health/Nutrition</h3>
                            <div className={styles.vizContainer}>
                                <div className={styles.viz}>
                                    <DonutChartReCharts
                                        data={childDonutData}
                                        colorScheme={triColorScheme}
                                    />
                                </div>
                                <ListView
                                    className={styles.table}
                                    data={childMonitoring}
                                    rendererParams={tableRenderParams}
                                    keySelector={Report.childKeySelector}
                                    renderer={KeyValue}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.lowerContainer}>
                        <div className={styles.item}>
                            <h3>RC Data</h3>
                            <div className={styles.vizContainer}>
                                <div className={styles.viz}>
                                    <HorizontalBarRecharts
                                        data={remoteChildren}
                                        colorScheme={horizontalBarColorScheme}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.item}>
                            <h3>Service Operations Indicators Summary Report</h3>
                            <div className={styles.vizGroup}>
                                <GaugeChart
                                    className={styles.gaugeChart}
                                    sectionPercents={sectionPercents}
                                    minValue={0}
                                    maxValue={totalSoi}
                                    currentValue={closedSoi}
                                    colorScheme={soiColorScheme}
                                />
                                <ListView
                                    className={_cs(styles.table, styles.sso)}
                                    data={soiValues}
                                    rendererParams={soiParams}
                                    keySelector={Report.soiKeySelector}
                                    renderer={KeyValue}
                                />
                                <h3> SOI Trend </h3>
                                <GroupedBarChartRecharts
                                    data={soiTrendData}
                                />
                            </div>
                        </div>

                        <div className={styles.item}>
                            <h3>Correspondence</h3>
                            <div className={styles.tables}>
                                <List
                                    data={correspondences}
                                    rendererParams={correspondencesParams}
                                    keySelector={Report.correspondenceKeySelector}
                                    renderer={CorrespondenceItem}
                                />
                            </div>
                        </div>
                        <div className={_cs(styles.item, styles.language)}>
                            <h3 className={styles.heading}>
                                Language / People Group / Disability
                            </h3>
                            <LanguagePeopleGroupDisability
                                className={styles.languagePeopleGroupDisability}
                                data={languagePeopleGroupDisability}
                            />
                        </div>
                        <div className={_cs(styles.item, styles.report)}>
                            <h3>Support Participation Details</h3>
                            <div className={styles.container}>
                                <ListView
                                    className={styles.list}
                                    data={supportPariticipationDetail}
                                    rendererParams={participationDetailsParams}
                                    groupRendererParams={participationGroupParams}
                                    keySelector={participationKeySelector}
                                    renderer={KeyValue}
                                    groupKeySelector={participationGroupSelector}
                                />
                            </div>
                        </div>
                        <div className={_cs(styles.item, styles.report)}>
                            <h3>Most Vulnerable Children By Indicator</h3>
                            <div className={styles.container}>
                                <ListView
                                    className={styles.table}
                                    data={mostVulnerableChildren}
                                    rendererParams={mvcParams}
                                    keySelector={mvcIndicatorKeySelector}
                                    renderer={KeyValue}
                                />
                            </div>
                        </div>
                        <div className={_cs(styles.item, styles.report)}>
                            <h3>Most Vulnerable Children By Vulnerability Marker</h3>
                            <div className={styles.container}>
                                <ListView
                                    className={styles.table}
                                    data={mostVulnerableChildrenMarker}
                                    rendererParams={mostVulnerableChildrenParams}
                                    groupRendererParams={mostVulnerableChildrenGroupParams}
                                    keySelector={mostVulnerableKeySelector}
                                    renderer={KeyValue}
                                    groupKeySelector={mostVulnerableGroupKeySelector}
                                />
                            </div>
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
