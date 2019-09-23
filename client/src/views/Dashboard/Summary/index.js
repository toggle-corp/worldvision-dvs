import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import FormattedDate from '#rscv/FormattedDate';
import KeyValue from '#components/KeyValue';
import DonutChart from '#rscz/DonutChart';

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

export default class Summary extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static valueSelector = d => d.value;

    static labelSelector = d => d.label;

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

        const isSoi = key === 'soi';

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
            titleClassName: _cs(isSoi && styles.bold),
        });
    }

    tableParams = (key, data) => ({
        title: data.label,
        value: data.value,
    });

    getPercent = (data) => {
        if (isFalsy(data)) {
            return [];
        }
        const total = data.reduce((acc, d) => (acc + d.value), 0);
        return data.map(d => ({
            percent: (d.value / total) * 100,
            ...d,
        }));
    };

    getPercentSoi = memoize(data => this.getPercent(data));

    getPercentChild = memoize(data => this.getPercent(data));

    getPercentCorr = memoize(data => this.getPercent(data));

    getPercentHealth = memoize(data => this.getPercent(data));

    getChildMonitoringDataForViz = memoize((childMonitoring) => {
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

    render() {
        const {
            className,
            summary: {
                rc,
                childMonitoring,
                correspondences,
                soi,
                healthNutrition,
            },
            noOfProjects,
            siteSettings,
        } = this.props;


        const percentChild = this.getPercentChild(childMonitoring);
        const percentCorr = this.getPercentCorr(correspondences);
        const percentSoi = this.getPercentSoi(soi);
        const percentHealth = this.getPercentHealth(healthNutrition);
        const childMonitoringVizData = this.getChildMonitoringDataForViz(childMonitoring);

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
                        <div className={styles.table}>
                            <h3>Correspondences</h3>
                            <ListView
                                className={styles.table}
                                data={percentCorr}
                                rendererParams={this.percentTableParams}
                                keySelector={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
                            <ListView
                                className={styles.table}
                                data={percentSoi}
                                rendererParams={this.percentTableParams}
                                keySelector={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
