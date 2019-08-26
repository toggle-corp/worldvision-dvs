import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    isFalsy,
    randomString,
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

const getPercent = memoize((data) => {
    if (isFalsy(data)) {
        return [];
    }
    const total = data.reduce((acc, d) => (acc + d.value), 0);
    return data.map(d => ({
        percent: (d.value / total) * 100,
        ...d,
    }));
});

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

    static tableKeySelector = d => `${d.key}-${randomString()}`;

    percentTableParams = (key, data) => {
        const classNames = [];
        const titleClassName = [];

        if (
            key === '@NotSighted30Days'
            || key === '@HealthSatisfactory'
            || key === 'pendingCurrent'
            || key === '@VisitCompleted'
        ) {
            classNames.push(styles.success);
        } else if (key === '@NotSighted60Days') {
            classNames.push(styles.warning);
        } else if (
            key === '@NotSighted90Days'
            || key === '@HealthNotSatisfactory'
            || key === 'pendingOverDue'
        ) {
            classNames.push(styles.danger);
        } else if (key === 'soi') {
            titleClassName.push(styles.bold);
        }

        return ({
            title: data.label,
            value: data.value,
            percent: data.percent,
            isPercent: true,
            colorOnlyNumber: true,
            className: classNames.join(' '),
            titleClassName: titleClassName.join(' '),
        });
    }

    tableParams = (key, data) => ({
        title: data.label,
        value: data.value,
    });

    render() {
        const {
            className,
            summary: {
                rc,
                childMonitoring,
                correspondences,
                // healthNutrition,
            },
            noOfProjects,
            siteSettings,
        } = this.props;

        let monitoring = [];
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

        monitoring = [notSighted30DaysAndVisited, ...monitoring];

        const percentChild = getPercent(childMonitoring);

        const percentCorr = getPercent(correspondences);
        // const percentHealth = getPercent(healthNutrition);
        const soi = [
            {
                label: 'Closed in time',
                key: 'time',
            },
            {
                label: 'Total closed',
                key: 'total',
            },
            {
                label: 'SOI',
                key: 'soi',
            },
        ];

        const infoText = `The data below is
            aggregated from sponsorship
            management report from ${noOfProjects}
            projects of Nepal as of`;

        return (
            <div className={`${styles.summary} ${className}`}>
                <span className={styles.info}>
                    <span className={`${styles.infoIcon} ion-information-circled`} />
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
                    <h3>Child Monitoring</h3>
                    <div className={styles.itemTableViz}>
                        <DonutChart
                            className={styles.viz}
                            data={monitoring}
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
                                data={soi}
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
