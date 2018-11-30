import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import FixedTabs from '#rscv/FixedTabs';
import MultiViewContainer from '#rscv/MultiViewContainer';

import styles from './styles.scss';

import Summary from '../Summary';

const propTypes = {
    overview: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    summaryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    overview: undefined,
    summaryGroups: undefined,
    className: '',
};

const getTabs = memoize((summaryGroups) => {
    const names = summaryGroups.map(group => ({ [`${group.name}`]: group.name }));

    return Object.assign({ overview: 'Overview' }, ...names);
});

const getViews = memoize((overview, summaryGroups) => {
    const rendererParams = summaryData => () => ({ ...summaryData });
    const view = {
        overview: {
            component: Summary,
            rendererParams: rendererParams(overview),
        },
    };

    const getSummary = group => ({
        summary: group.summary,
        noOfProjects: group.length || 0,
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
        } = this.props;

        const { activeView } = this.state;
        const tabs = getTabs(summaryGroups);
        const views = getViews(overview, summaryGroups);

        const className = `
            ${classNameFromProps}
            ${styles.summaryContainer}
        `;

        return (
            <div className={className}>
                <header className={styles.header}>
                    <FixedTabs
                        className={styles.tabs}
                        tabs={tabs}
                        onClick={this.handleTabClick}
                        active={activeView}
                    />
                </header>
                <MultiViewContainer
                    views={views}
                    active={activeView}
                />
            </div>
        );
    }
}
