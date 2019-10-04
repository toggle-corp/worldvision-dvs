import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    _cs,
    isFalsy,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import FormattedDate from '#rscv/FormattedDate';
import KeyValue from '#components/KeyValue';
import ParticipationItem from '#components/ParticipationItem';
import DonutChart from '#rscz/DonutChart';
import GaugeChart from '#rscz/GaugeChart';

import { transformSoi } from '#utils/transform';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    summary: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    siteSettings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    noOfProjects: PropTypes.number,
};

const defaultProps = {
    className: '',
    summary: {},
    siteSettings: {},
    noOfProjects: 0,
};

const getPercent = (data) => {
    if (isFalsy(data)) {
        return [];
    }
    const total = data.reduce((acc, d) => (acc + d.value), 0);
    return data.map(d => ({
        percent: (d.value / total) * 100,
        ...d,
    }));
};
const soiColorScheme = ['#ef5350', '#fff176', '#81c784'];
const sectionPercents = [0.75, 0.1, 0.15];
const getParticipationKey = p => (p > 3 ? '3+' : String(p));

export default class Summary extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static valueSelector = d => d.value;

    static labelSelector = d => d.label;

    static groupKeySelector = d => d.type;

    static labelModifierSelector = (label, value) => (`
        <div class=${styles.tooltip} >
            ${label}:
            <span class=${styles.value}>
                ${value}
            </span>
        </div>
    `);

    static tableKeySelector = d => d.key;

    percentTableParams = (key, data) => {
        const isSuccess = key === '@NotSighted30Days'
            || key === '@HealthSatisfactory'
            || key === 'pendingCurrent'
            || key === '@VisitCompleted';

        const isWarning = key === '@NotSighted60Days';

        const isDanger = key === '@NotSighted90Days'
            || key === '@HealthNotSatisfactory'
            || key === 'pendingOverDue';

        return ({
            title: data.label,
            value: data.value,
            percent: data.percent,
            isPercent: true,
            colorOnlyNumber: true,
            className: _cs(
                isSuccess && styles.success,
                isWarning && styles.warning,
                isDanger && styles.danger,
            ),
        });
    }

    tableParams = (key, data) => {
        const isSoi = key === 'soi';

        return ({
            title: data.label,
            value: data.value,
            colorOnlyNumber: true,
            titleClassName: _cs(isSoi && styles.bold),
        });
    };

    childFamilyGroupParams = groupKey => ({
        children: groupKey.split('_').join(' '),
    });

    childFamilyParams = (key, data) => ({
        groupKey: data.type,
        male: data.male,
        female: data.female,
        total: data.total,
        participation: data.participation,
    });

    getSoi = memoize(transformSoi);

    getPercentChild = memoize(getPercent);

    getPercentCorr = memoize(getPercent);

    getPercentHealth = memoize(getPercent);

    getChildMonitoringDataForViz = memoize((childMonitoring = []) => {
        const monitoring = [];
        const notSighted30DaysAndVisited = {
            key: '@NotSighted30DaysAndVisitCompleted',
            label: '',
            value: 0,
        };

        childMonitoring.forEach((out) => {
            if (out.key === '@NotSighted30Days' || out.key === '@VisitCompleted') {
                notSighted30DaysAndVisited.label += ` ${out.label}`;
                notSighted30DaysAndVisited.value += out.value;
            } else {
                monitoring.push(out);
            }
        });

        return [notSighted30DaysAndVisited, ...monitoring];
    })

    getChildFamilyGrouped = memoize((childFamilyParticipation = []) => {
        const a = listToGroupList(
            childFamilyParticipation,
            item => `${item.type}-${getParticipationKey(item.participation)}`,
        );
        return mapToList(
            a,
            (data, key) => {
                const newObj = {
                    key,
                    male: 0,
                    female: 0,
                    total: 0,
                };
                data.forEach((d) => {
                    if (d.gender === 'male') {
                        newObj.male += d.countSum;
                    } else {
                        newObj.female += d.countSum;
                    }
                    newObj.total += d.countSum;
                    newObj.type = d.type;
                    newObj.participation = getParticipationKey(d.participation);
                });
                return newObj;
            },
        );
    })

    render() {
        const {
            className,
            summary: {
                rc,
                childMonitoring,
                correspondences,
                soi = [],
                healthNutrition,
                childFamilyParticipation,
            },
            noOfProjects,
            siteSettings,
        } = this.props;

        const soiTotal = (soi.find(s => s.key === 'total_closed') || {}).value || 0;
        const soiClosed = (soi.find(s => s.key === 'closed_on') || {}).value || 0;

        const percentChild = this.getPercentChild(childMonitoring);
        const percentCorr = this.getPercentCorr(correspondences);
        const soiValues = this.getSoi(soi);
        const percentHealth = this.getPercentHealth(healthNutrition);
        const childMonitoringVizData = this.getChildMonitoringDataForViz(childMonitoring);
        const childFamily = this.getChildFamilyGrouped(childFamilyParticipation);

        const infoText = `The data below is
            aggregated from sponsorship
            management report from ${noOfProjects}
            projects of Nepal as of`;

        return (
            <div className={_cs(styles.summary, className)}>
                <span className={styles.info}>
                    <span className={_cs(styles.infoIcon, 'ion-information-circled')} />
                    {infoText}
                    <FormattedDate
                        className={styles.date}
                        date={siteSettings.startDate}
                        mode="dd-MMM-yyyy"
                    />
                    to
                    <FormattedDate
                        className={styles.date}
                        date={siteSettings.endDate}
                        mode="dd-MMM-yyyy"
                    />
                </span>
                <div className={styles.item}>
                    <h3>RC Supply</h3>
                    <ListView
                        className={styles.table}
                        data={rc}
                        rendererParams={this.tableParams}
                        keySelector={Summary.tableKeySelector}
                        renderer={KeyValue}
                    />
                </div>
                <div className={styles.item}>
                    <h3>Health / Nutrition</h3>
                    <div className={styles.itemTableViz}>
                        <DonutChart
                            className={styles.viz}
                            data={healthNutrition}
                            sideLengthRatio={0.2}
                            hideLabel
                            valueSelector={Summary.valueSelector}
                            labelSelector={Summary.labelSelector}
                            labelModifier={Summary.labelModifierSelector}
                            colorScheme={[
                                '#41cf76',
                                '#f44336',
                            ]}
                        />
                        <ListView
                            className={styles.table}
                            data={percentHealth}
                            rendererParams={this.percentTableParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                </div>
                <div className={styles.item}>
                    <h3>Child Monitoring</h3>
                    <div className={styles.itemTableViz}>
                        <DonutChart
                            className={styles.viz}
                            data={childMonitoringVizData}
                            hideLabel
                            sideLengthRatio={0.2}
                            valueSelector={Summary.valueSelector}
                            labelSelector={Summary.labelSelector}
                            labelModifier={Summary.labelModifierSelector}
                            colorScheme={[
                                '#41cf76',
                                '#ef8c00',
                                '#f44336',
                            ]}
                        />
                        <ListView
                            className={styles.table}
                            data={percentChild}
                            rendererParams={this.percentTableParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                </div>
                <div className={styles.item}>
                    <h3>SOI Index</h3>
                    <div className={styles.itemTableViz}>
                        <GaugeChart
                            className={styles.viz}
                            sectionPercents={sectionPercents}
                            minValue={0}
                            maxValue={soiTotal}
                            currentValue={soiClosed}
                            colorScheme={soiColorScheme}
                        />
                        <ListView
                            className={styles.table}
                            data={soiValues}
                            rendererParams={this.tableParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                </div>
                <div className={styles.item}>
                    <h3>Correspondences</h3>
                    <div className={styles.itemTableViz}>
                        <DonutChart
                            className={styles.viz}
                            data={correspondences}
                            hideLabel
                            valueSelector={Summary.valueSelector}
                            labelSelector={Summary.labelSelector}
                            sideLengthRatio={0.2}
                            labelModifier={Summary.labelModifierSelector}
                            colorScheme={[
                                '#41cf76',
                                '#f44336',
                            ]}
                        />
                        <ListView
                            className={styles.table}
                            data={percentCorr}
                            rendererParams={this.percentTableParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                </div>
                <div className={styles.item}>
                    <h3>Child Family Participation</h3>
                    <div className={styles.itemTableViz}>
                        <ListView
                            className={_cs(styles.table, styles.childFamily)}
                            data={childFamily}
                            rendererParams={this.childFamilyParams}
                            groupRendererParams={this.childFamilyGroupParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={ParticipationItem}
                            groupKeySelector={Summary.groupKeySelector}
                            groupRendererClassName={styles.childFamilyGroup}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
