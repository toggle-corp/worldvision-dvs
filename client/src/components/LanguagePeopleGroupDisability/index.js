import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import KeyValue from '#components/KeyValue';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    data: {},
};

export default class LanguagePeopleGroupDisability extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    static languageKeySelector = d => d.language;

    static disabilityKeySelector = d => d.disability;

    static peopleGroupKeySelector = d => d.peopleGroup;

    getLanguageDistribution = memoize((data = []) => {
        if (isFalsy(data)) {
            return [];
        }

        return data.sort((a, b) => b.count - a.count);
    });

    getPeopleGroupDistribution = memoize((data = []) => {
        if (isFalsy(data)) {
            return [];
        }

        return data.sort((a, b) => b.count - a.count);
    });

    getDisabilityDistribution = memoize((data = []) => {
        if (isFalsy(data)) {
            return [];
        }

        return data.sort((a, b) => b.count - a.count);
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

    render() {
        const {
            className,
            data,
        } = this.props;

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
                <h3> Language / People Group / Disability </h3>
                <div>
                    <h3>Language</h3>
                    <ListView
                        className={styles.table}
                        data={languageDistribution}
                        rendererParams={this.languageParams}
                        keySelector={LanguagePeopleGroupDisability.languageKeySelector}
                        renderer={KeyValue}
                    />
                    <h3>People Group</h3>
                    <ListView
                        className={styles.table}
                        data={peopleGroupDistribution}
                        rendererParams={this.peopleGroupParams}
                        keySelector={LanguagePeopleGroupDisability.peopleGroupKeySelector}
                        renderer={KeyValue}
                    />
                    <h3>Disability</h3>
                    <ListView
                        className={styles.table}
                        data={disabilityDistribution}
                        rendererParams={this.disabilityParams}
                        keySelector={LanguagePeopleGroupDisability.disabilityKeySelector}
                        renderer={KeyValue}
                    />
                </div>
            </div>
        );
    }
}
