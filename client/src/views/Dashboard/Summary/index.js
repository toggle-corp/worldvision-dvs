import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    _cs,
    isFalsy,
    listToGroupList,
    mapToList,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import Legend from '#rscz/Legend';
import ListView from '#rscv/List/ListView';
import FormattedDate from '#rscv/FormattedDate';
import ParticipationItem from '#components/ParticipationItem';
import DonutChart from '#rscz/DonutChart';
import GaugeChart from '#rscz/GaugeChart';

import KeyValue from '#components/KeyValue';
import LanguagePeopleGroupDisability from '#components/LanguagePeopleGroupDisability';

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

const ageKeyMap = {
    '<=6': {
        key: 1,
        label: '0 - 6',
    },
    '7-12': {
        key: 2,
        label: '7 - 12',
    },
    '>=13': {
        key: 3,
        label: '13+',
    },
};

const soiLegendData = [
    {
        key: 1,
        label: '>=85%',
        color: '#81c784',
    },
    {
        key: 2,
        label: '75% - 85%',
        color: '#fff176',
    },
    {
        key: 3,
        label: '<75%',
        color: '#ef5350',
    },
];
const emptyObject = {};
const legendKeySelector = d => d.key;
const legendLabelSelector = d => d.label;
const legendColorSelector = d => d.color;

const donutColor = ['#41cf76', '#f44336'];
const soiColorScheme = ['#ef5350', '#fff176', '#81c784'];
const sectionPercents = [0.75, 0.1, 0.15];

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
const getParticipationKey = p => (p > 3 ? '4+' : String(p));

const getAgeDistribution = (data) => {
    const distribution = data.map((value) => {
        const { ageRange, countSum } = value;
        const { key, label } = ageKeyMap[ageRange];

        return { key, label, value: countSum };
    });

    const sorted = [
        ...distribution,
        {
            key: 4,
            label: 'Total',
            value: distribution.reduce((a, b) => a + b.value, 0),
        },
    ].sort((a, b) => a.key - b.key);

    return sorted;
};

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

    getPercentChild = memoize((data) => {
        if (isFalsy(data)) {
            return [];
        }
        const total = data.reduce((acc, d) => (acc + d.value), 0);
        const childData = data.map(d => ({
            percent: (d.value / total) * 100,
            ...d,
        }));
        const notsighted = (data.find(d => d.key === '@NotSighted90Days') || emptyObject).value;

        const percent = total ? (((total - notsighted) / total) * 100) : 0;

        return ([
            ...childData,
            {
                key: '@cms',
                label: 'CMS',
                value: (total - notsighted),
                percent: +percent.toFixed(2),
            },
        ]);
    });

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

    getValueFromMap = (map, key) => (
        (isDefined(map) && isDefined(map[key])) ? map[key].value : undefined
    );

    getEducation = memoize((education) => {
        if (isFalsy(education)) {
            return [];
        }

        const educationMap = listToMap(
            education,
            d => d.key,
            d => d,
        );

        const primary = {
            key: '@PrimarySchoolAge',
            value: this.getValueFromMap(educationMap, '@PrimarySchoolAge'),
            label: 'RC of Primary School Age',
        };

        const secondary = {
            key: '@SecondarySchoolAge',
            value: this.getValueFromMap(educationMap, '@SecondarySchoolAge'),
            label: 'RC of Secondary School Age',
        };

        const primaryEducated = {
            key: 'PrimaryEducated',
            value: this.getValueFromMap(educationMap, '@PrimarySchoolAgeFormal') || 0
                + this.getValueFromMap(educationMap, '@PrimarySchoolAgeNonFormal') || 0,
            label: 'Number of Primary School Age RC Involved in Education',
        };

        const primaryUneducated = educationMap['@PrimarySchoolAgeNoEducation'];

        const secondaryEducated = {
            key: 'SecondaryEducated',
            value: this.getValueFromMap(educationMap, '@SecondarySchoolAgeFormal') || 0
                + this.getValueFromMap(educationMap, '@SecondarySchoolAgeNonFormal') || 0
                + this.getValueFromMap(educationMap, '@SecondarySchoolAgeVocational') || 0,
            label: 'Number of Secondary School Age RC Involved in Education',
        };
        const secondaryUneducated = educationMap['@SecondarySchoolAgeNoEducation'];

        return ([
            primary,
            secondary,
            primaryEducated,
            primaryUneducated,
            secondaryEducated,
            secondaryUneducated,
        ]);
    });

    getEducationInvolvement = memoize((education) => {
        if (isFalsy(education)) {
            return [];
        }

        const educated = education.filter(values => (
            values.key === 'PrimaryEducated'
                || values.key === 'SecondaryEducated'
        )).reduce((a, b) => ({ ...a, value: a.value + b.value }), {
            value: 0,
            key: 'educated',
            label: 'Number of RC involved in education',
        });

        const uneducated = education.filter(values => (
            values.key === '@SecondarySchoolAgeNoEducation'
                || values.key === '@PrimarySchoolAgeNoEducation'
        )).reduce((a, b) => ({ ...a, value: a.value + b.value }), {
            value: 0,
            key: 'uneducated',
            label: 'Number of RC not involved in education',
        });

        return ([
            educated,
            uneducated,
        ]);
    });

    getFemaleRcAge = memoize((data) => {
        if (isFalsy(data)) {
            return [];
        }

        const female = data.filter(rc => rc.gender === 'female');
        return getAgeDistribution(female);
    });

    getMaleRcAge = memoize((data) => {
        if (isFalsy(data)) {
            return [];
        }

        const male = data.filter(rc => rc.gender === 'male');
        return getAgeDistribution(male);
    });

    render() {
        const {
            className,
            summary: {
                childFamilyParticipationDate,
                rc,
                childMonitoring,
                education,
                soi,
                registerChildByAgeAndGender,
                healthNutrition,
                childFamilyParticipation,
                languagePeopleGroupDisability,
            },
            noOfProjects,
            siteSettings,
        } = this.props;

        const soiTotal = soi ? (soi.find(s => s.key === 'total_closed') || {}).value || 0 : 0;
        const soiClosed = soi ? (soi.find(s => s.key === 'closed_on') || {}).value || 0 : 0;

        const percentChild = this.getPercentChild(childMonitoring);
        const soiValues = this.getSoi(soi);
        const percentHealth = this.getPercentHealth(healthNutrition);
        const childMonitoringVizData = this.getChildMonitoringDataForViz(childMonitoring);
        const childFamily = this.getChildFamilyGrouped(childFamilyParticipation);
        const educationValues = this.getEducation(education);
        const educationInvolvement = this.getEducationInvolvement(educationValues);
        const femaleRCAgeDistribution = this.getFemaleRcAge(registerChildByAgeAndGender);
        const maleRCAgeDistribution = this.getMaleRcAge(registerChildByAgeAndGender);

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
                            colorScheme={donutColor}
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
                    <h3>Education</h3>
                    <div className={styles.itemTableViz}>
                        <DonutChart
                            className={styles.viz}
                            data={educationInvolvement}
                            sideLengthRatio={0.2}
                            hideLabel
                            valueSelector={Summary.valueSelector}
                            labelSelector={Summary.labelSelector}
                            labelModifier={Summary.labelModifierSelector}
                            colorScheme={donutColor}
                        />
                        <ListView
                            className={styles.table}
                            data={educationValues}
                            rendererParams={this.tableParams}
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
                <div className={_cs(styles.item, styles.soiIndex)}>
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
                    <Legend
                        className={styles.legend}
                        data={soiLegendData}
                        keySelector={legendKeySelector}
                        labelSelector={legendLabelSelector}
                        colorSelector={legendColorSelector}
                    />
                </div>
                <div className={styles.item}>
                    <h3>
                        Child Family Participation Suppport Benificiaries (
                        <FormattedDate
                            className={styles.date}
                            date={childFamilyParticipationDate}
                            mode="dd-MMM-yyyy"

                        />
                        )
                    </h3>
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
                <div className={styles.item}>
                    <h3>Age / Gender Distribution</h3>
                    <div>
                        <h3>Female</h3>
                        <ListView
                            className={styles.table}
                            data={femaleRCAgeDistribution}
                            rendererParams={this.tableParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                    <div>
                        <h3>Male</h3>
                        <ListView
                            className={styles.table}
                            data={maleRCAgeDistribution}
                            rendererParams={this.tableParams}
                            keySelector={Summary.tableKeySelector}
                            renderer={KeyValue}
                        />
                    </div>
                </div>
                <div className={styles.item}>
                    <LanguagePeopleGroupDisability
                        data={languagePeopleGroupDisability}
                        hideLanguage
                    />
                </div>
            </div>
        );
    }
}
