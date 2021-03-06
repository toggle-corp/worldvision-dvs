import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    _cs,
    isFalsy,
    listToGroupList,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import KeyValue from '#components/KeyValue';
import ScrollTabs from '#rscv/ScrollTabs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    hideLanguage: PropTypes.bool,
};

const defaultProps = {
    className: '',
    data: {},
    hideLanguage: false,
};

const tabs = {
    language: 'Language',
    peopleGroup: 'People Group',
    disability: 'Disability',
};

export default class LanguagePeopleGroupDisability extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static languageKeySelector = d => d.language;

    static disabilityKeySelector = d => d.disability;

    static peopleGroupKeySelector = d => d.peopleGroup;

    constructor(props) {
        super(props);
        const {
            hideLanguage,
        } = this.props;
        this.tabs = tabs;
        if (hideLanguage) {
            delete this.tabs.language;
        }

        this.state = {
            activeTab: hideLanguage ? 'peopleGroup' : 'language',
        };
    }

    getLanguageDistribution = memoize((data) => {
        if (isFalsy(data) || data.length < 1) {
            return [];
        }

        const grouped = listToGroupList(data, d => d.date);
        const latestDate = Object.keys(grouped)
            .reduce((a, b) => (new Date(b) < new Date(a) ? a : b), null);

        return grouped[latestDate];
    });

    getPeopleGroupDistribution = memoize((data) => {
        if (isFalsy(data) || data.length < 1) {
            return [];
        }

        const grouped = listToGroupList(data, d => d.date);
        const latestDate = Object.keys(grouped)
            .reduce((a, b) => (new Date(b) < new Date(a) ? a : b));

        return grouped[latestDate];
    });

    getDisabilityDistribution = memoize((data) => {
        if (isFalsy(data) || data.length < 1) {
            return [];
        }

        const grouped = listToGroupList(data, d => d.date);
        const latestDate = Object.keys(grouped)
            .reduce((a, b) => (new Date(b) < new Date(a) ? a : b));

        return grouped[latestDate];
    });

    languageParams = (key, data) => ({
        title: data.language ? data.language : 'Not available',
        value: data.count,
        colorOnlyNumber: true,
    })

    peopleGroupParams = (key, data) => ({
        title: data.peopleGroup ? data.peopleGroup : 'Not Available',
        value: data.count,
        colorOnlyNumber: true,
    })

    disabilityParams = (key, data) => ({
        title: data.disability ? data.disability : 'Not Available',
        value: data.count,
        colorOnlyNumber: true,
    })

    handleTabClick = (activeTab) => {
        this.setState({ activeTab });
    }

    render() {
        const {
            className,
            data,
        } = this.props;

        const { activeTab } = this.state;

        const {
            language,
            peopleGroup,
            disability,
        } = data;


        const languageDistribution = this.getLanguageDistribution(language);
        const peopleGroupDistribution = this.getPeopleGroupDistribution(peopleGroup);
        const disabilityDistribution = this.getDisabilityDistribution(disability);


        return (
            <div className={_cs(className, styles.languagePeopleGroupDisability)}>
                <ScrollTabs
                    tabs={tabs}
                    onClick={this.handleTabClick}
                    active={activeTab}
                />
                <div className={styles.listContainer}>
                    {activeTab === 'language' && (
                        <ListView
                            className={styles.table}
                            data={languageDistribution}
                            rendererParams={this.languageParams}
                            keySelector={LanguagePeopleGroupDisability.languageKeySelector}
                            renderer={KeyValue}
                        />
                    )}
                    {activeTab === 'peopleGroup' && (
                        <ListView
                            className={styles.table}
                            data={peopleGroupDistribution}
                            rendererParams={this.peopleGroupParams}
                            keySelector={LanguagePeopleGroupDisability.peopleGroupKeySelector}
                            renderer={KeyValue}
                        />
                    )}
                    {activeTab === 'disability' && (
                        <ListView
                            className={styles.table}
                            data={disabilityDistribution}
                            rendererParams={this.disabilityParams}
                            keySelector={LanguagePeopleGroupDisability.disabilityKeySelector}
                            renderer={KeyValue}
                        />
                    )}
                </div>
            </div>
        );
    }
}
