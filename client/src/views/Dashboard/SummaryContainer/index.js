import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import ScrollTabs from '#rscv/ScrollTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import styles from './styles.scss';

import Summary from '../Summary';

const propTypes = {
    overview: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    summaryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    siteSettings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    overview: undefined,
    siteSettings: {},
    summaryGroups: undefined,
    className: '',
};

const getTabs = memoize((summaryGroups) => {
    const names = summaryGroups.map(group => ({ [`${group.name}`]: group.name }));

    return Object.assign({ overview: 'Overview' }, ...names);
});

const getViews = memoize((overview, summaryGroups, siteSettings) => {
    const rendererParams = summaryData => () => ({
        ...summaryData,
        siteSettings,
    });
    const view = {
        overview: {
            component: Summary,
            rendererParams: rendererParams(overview),
        },
    };

    const getSummary = group => ({
        summary: group.summary,
        noOfProjects: ((group || {}).projects || []).length || 0,
    });

    const summaryGroupsViews = summaryGroups.map((group) => {
        const summary = getSummary(group);
        return {
            [group.name]: {
                component: Summary,
                rendererParams: rendererParams(summary),
            },
        };
    });

    return Object.assign(view, ...summaryGroupsViews);
});

export default class SummaryContainer extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            activeView: 'overview',
        };
    }

    handleTabClick = (tabId) => {
        this.setState({ activeView: tabId });
    }

    render() {
        const {
            overview,
            summaryGroups,
            className: classNameFromProps,
            siteSettings,
        } = this.props;

        const { activeView } = this.state;
        const tabs = getTabs(summaryGroups);
        const views = getViews(overview, summaryGroups, siteSettings);

        const className = `
            ${classNameFromProps}
            ${styles.summaryContainer}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <ScrollTabs
                        className={styles.tabs}
                        tabs={tabs}
                        onClick={this.handleTabClick}
                        active={activeView}
                        itemClassName={styles.tab}
                    />
                </header>
                <MultiViewContainer
                    views={views}
                    active={activeView}
                    containerClassName={styles.container}
                />
            </div>
        );
    }
}
