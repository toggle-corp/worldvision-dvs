import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import {
    mapToList,
    _cs,
} from '@togglecorp/fujs';

import SelectInput from '#rsci/SelectInput';
import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import styles from './styles.scss';

import Summary from '../Summary';
import TrendSummary from './TrendSummary';

const propTypes = {
    summaryGroups: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    siteSettings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    siteSettings: {},
    summaryGroups: {},
    className: '',
};

const summaryKeySelector = d => d.name;

const summaryLabelSelector = d => d.name;

const tabs = {
    generalSummary: 'Summary',
    trendSummary: 'Trend',
};

export default class SummaryContainer extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            activeSummary: 'overview',
            activeTab: 'generalSummary',
        };

        this.views = {
            generalSummary: {
                component: Summary,
                rendererParams: this.summaryRendererParams,
            },
            trendSummary: {
                component: TrendSummary,
            },
        };
    }

    summaryRendererParams = () => {
        const { activeSummary } = this.state;
        const {
            siteSettings,
            summaryGroups,
        } = this.props;

        const {
            summary,
            projects,
        } = summaryGroups[activeSummary];

        return ({
            summary,
            noOfProjects: projects.length,
            siteSettings,
        });
    }

    getSummaryList = memoize(summaryGroups => (
        mapToList(
            summaryGroups,
            d => d,
        )
    ));

    handleSummaryInputClick = (activeSummary) => {
        this.setState({ activeSummary });
    }

    handleTabClick = (activeTab) => {
        this.setState({ activeTab });
    }

    render() {
        const {
            summaryGroups,
            className,
        } = this.props;

        const {
            activeSummary,
            activeTab,
        } = this.state;

        const summaryList = this.getSummaryList(summaryGroups);

        return (
            <div className={_cs(className, styles.summaryContainer)}>
                <header className={styles.header}>
                    <div className={styles.topContainer}>
                        <h3 className={styles.heading}>
                            Summary of:
                        </h3>
                        <SelectInput
                            className={styles.summaryList}
                            options={summaryList}
                            value={activeSummary}
                            onChange={this.handleSummaryInputClick}
                            labelSelector={summaryLabelSelector}
                            keySelector={summaryKeySelector}
                            hideClearButton
                        />
                    </div>
                    <ScrollTabs
                        tabs={tabs}
                        onClick={this.handleTabClick}
                        active={activeTab}
                    />
                </header>
                <MultiViewContainer
                    active={activeTab}
                    views={this.views}
                />
            </div>
        );
    }
}
