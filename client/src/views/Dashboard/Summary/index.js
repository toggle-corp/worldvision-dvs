import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import FormattedDate from '#rscv/FormattedDate';
import KeyValue from '#components/KeyValue';
import DonutChart from '#rscz/DonutChart';
import { isFalsy } from '#rsu/common';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    summary: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    siteSettings: PropTypes.object,
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
    static tableKeySelector = d => d.key;

    percentTableParams = (key, data) => {
        const classNames = [];

        if (key === '@NotSighted30Days' || key === '@HealthSatisfactory') {
            classNames.push(styles.success);
        } else if (key === '@NotSighted60Days') {
            classNames.push(styles.warning);
        } else if (key === '@NotSighted90Days' || key === '@HealthNotSatisfactory') {
            classNames.push(styles.danger);
        }

        return ({
            title: data.label,
            value: data.value,
            percent: data.percent,
            isPercent: true,
            colorOnlyNumber: true,
            className: classNames.join(' '),
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
                healthNutrition,
            },
            noOfProjects,
            siteSettings,
        } = this.props;

        const percentChild = getPercent(childMonitoring);
        const percentCorr = getPercent(correspondences);
        const percentHealth = getPercent(healthNutrition);

        const infoText = `The data below is
            aggregated from sponsorship
            management report from ${noOfProjects}
            projects of Nepal as of`;

        return (
            <div className={`${styles.summary} ${className}`}>
                <header className={styles.header}>
                    <h2>Overview of Sponsorship Data</h2>
                </header>
                <section className={styles.content}>
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
                            keyExtractor={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                    <div className={styles.item}>
                        <h3>Child Monitoring</h3>
                        <div className={styles.itemTableViz}>
                            <DonutChart
                                className={styles.viz}
                                data={childMonitoring}
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
                                keyExtractor={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
                        </div>
                    </div>
                    <div className={styles.item}>
                        <h3>Health / Nutrition</h3>
                        <div className={styles.itemTableViz}>
                            <DonutChart
                                className={styles.viz}
                                data={healthNutrition}
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
                                keyExtractor={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
                        </div>
                    </div>
                    <div className={styles.item}>
                        <h3>Correspondences</h3>
                        <div className={styles.itemTableViz}>
                            <ListView
                                className={styles.table}
                                data={percentCorr}
                                rendererParams={this.percentTableParams}
                                keyExtractor={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
