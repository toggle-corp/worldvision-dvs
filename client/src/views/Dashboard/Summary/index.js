import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import FormattedDate from '#rscv/FormattedDate';
import KeyValue from '#components/KeyValue';
import DonutChart from '#rscz/DonutChart';

import PercentLine from '#components/PercentLine';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    summary: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    noOfProjects: PropTypes.number,
};

const defaultProps = {
    className: '',
    summary: {},
    noOfProjects: 0,
};

export default class Summary extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static valueSelector = d => d.value;
    static labelSelector = d => d.label;
    static labelModifierSelector = (label, value) => `${label}: ${value}`;
    static tableKeySelector = d => d.key;

    tableParams = (key, data) => {
        const classNames = [];
        if (data.type === 'bad') {
            classNames.push(styles.flashData);
        }

        return ({
            title: data.label,
            value: data.value,
            className: classNames.join(' '),
        });
    };

    render() {
        const {
            className,
            summary: {
                rc,
                childMonitoring,
                correspondences,
                healthNutrition,
                reportDate,
            },
            noOfProjects,
        } = this.props;

        const infoText = `The data below is
            aggregated from sponsorship
            management report from ${noOfProjects}
            projects of Nepal as of`;

        return (
            <div className={`${styles.summary} ${className}`}>
                <header className={styles.header}>
                    <h2>Overview of Sponsorship data</h2>
                </header>
                <section className={styles.content}>
                    <span className={styles.info}>
                        {infoText}
                        <FormattedDate
                            className={styles.date}
                            date={reportDate}
                            mode="MMM-yyyy"
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
                            <ListView
                                className={styles.table}
                                data={childMonitoring}
                                rendererParams={this.tableParams}
                                keyExtractor={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
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
                        </div>
                    </div>
                    <div className={styles.item}>
                        <h3>Health / Nutrition</h3>
                        <div className={styles.itemTableViz}>
                            <ListView
                                className={styles.table}
                                data={healthNutrition}
                                rendererParams={this.tableParams}
                                keyExtractor={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
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
                        </div>
                    </div>
                    <div className={styles.item}>
                        <h3>Correspondences</h3>
                        <div className={styles.itemTableViz}>
                            <ListView
                                className={styles.table}
                                data={correspondences}
                                rendererParams={this.tableParams}
                                keyExtractor={Summary.tableKeySelector}
                                renderer={KeyValue}
                            />
                            {/*
                            <PercentLine
                                className={styles.viz}
                                data={correspondences}
                                valueSelector={Summary.valueSelector}
                                labelSelector={Summary.labelSelector}
                                keySelector={Summary.tableKeySelector}
                                labelModifier={Summary.labelModifierSelector}
                                colorScheme={[
                                    '#41cf76',
                                    '#f44336',
                                ]}
                            />
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
                            */}
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
