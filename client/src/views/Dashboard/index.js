import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { listToMap } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Resizable from '#rscv/Resizable/ResizableH';
import MultiViewContainer from '#rscv/MultiViewContainer';

import {
    siteSettingsSelector,
    projectsSelector,
    summarySelector,
    pointsSelector,
    summaryGroupsSelector,
    setProjectsAction,
    setSummaryAction,
    setSiteSettingsAction,
    setSummaryGroupsAction,
} from '#redux';

import {
    createConnectedRequestCoordinator,
    createRequestClient,
} from '#request';

import styles from './styles.scss';

import ProjectsMap from './ProjectsMap';
import Report from '../Report';
import SummaryContainer from './SummaryContainer';

const propTypes = {
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    summary: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    siteSettings: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    points: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    summaryGroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjects: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setSummary: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setSiteSettings: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setSummaryGroups: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
    projects: projectsSelector(state),
    summary: summarySelector(state),
    siteSettings: siteSettingsSelector(state),
    points: pointsSelector(state),
    summaryGroups: summaryGroupsSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setProjects: params => dispatch(setProjectsAction(params)),
    setSummary: params => dispatch(setSummaryAction(params)),
    setSiteSettings: params => dispatch(setSiteSettingsAction(params)),
    setSummaryGroups: params => dispatch(setSummaryGroupsAction(params)),
});

// NOTE: hash should be similar to '#/metadata'
// const setHashToBrowser = (hash) => { window.location.hash = hash; };
// NOTE: receives data similar to '#/metadata'
const getHashFromBrowser = () => window.location.hash.substr(2);

const requests = {
    projectsGetRequest: {
        url: '/projects/',
        onMount: true,
        onSuccess: ({ response, props: { setProjects } }) => {
            setProjects({ projects: response });
        },
    },
    summaryGetRequest: {
        url: '/projects-summary/',
        onMount: true,
        onSuccess: ({ response, props: { setSummary } }) => {
            setSummary({ summary: response });
        },
    },
    siteSettingsGetRequest: {
        url: '/site-settings/',
        onMount: true,
        onSuccess: ({ response, props: { setSiteSettings } }) => {
            setSiteSettings({ siteSettings: response });
        },
    },
    summaryGroupsGetRequest: {
        url: '/summary-groups/',
        onMount: true,
        onSuccess: ({ response, props: { setSummaryGroups } }) => {
            setSummaryGroups({ summaryGroups: response });
        },
    },
};

class Dashboard extends PureComponent {
    static propTypes = propTypes;

    static labelSelector = d => d.project;

    static keySelector = d => d.name;

    constructor(props) {
        super(props);

        const hash = getHashFromBrowser();

        this.state = {
            selectedView: (hash ? 'report' : 'map'),
            selectedProjectId: +hash,
        };

        this.views = {
            map: {
                component: () => {
                    const {
                        summary,
                        projects,
                        points,
                        siteSettings,
                        summaryGroups,
                    } = this.props;

                    const summaryGroupsMap = listToMap(
                        summaryGroups,
                        d => d.name,
                        d => d,
                    );

                    summaryGroupsMap.overview = {
                        summary,
                        projects,
                        name: 'overview',
                    };

                    return (
                        <Resizable
                            className={styles.dashboardContent}
                            leftContainerClassName={styles.mapContainer}
                            rightContainerClassName={styles.aggregatedContainer}
                            leftChild={(
                                <ProjectsMap
                                    className={styles.map}
                                    projects={projects}
                                    points={points}
                                />
                            )}
                            rightChild={(
                                <SummaryContainer
                                    className={styles.aggregated}
                                    siteSettings={siteSettings}
                                    summaryGroups={summaryGroupsMap}
                                />
                            )}
                        />
                    );
                },
                wrapContainer: true,
            },
            report: {
                component: () => {
                    const { projects } = this.props;
                    const { selectedProjectId } = this.state;
                    const project = projects.find(p => (p || {}).id === selectedProjectId);

                    return (
                        <Report
                            projectId={selectedProjectId}
                            project={project}
                            location={this.projectLocation}
                        />
                    );
                },
                wrapContainer: true,
            },
        };
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.handleHashChange);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange);
    }

    handleHashChange = () => {
        const hash = getHashFromBrowser();
        if (hash) {
            this.setState({
                selectedProjectId: +hash,
                selectedView: 'report',
            });
        } else {
            this.setState({
                selectedProjectId: undefined,
                selectedView: 'map',
            });
        }
    }

    render() {
        const {
            projects,
            requests: {
                projectsGetRequest: {
                    pending: projectsGetPending,
                },
                summaryGroupsGetRequest: {
                    pending: summaryGroupsGetPending,
                },
            },
        } = this.props;

        if (!projects) {
            return <div />;
        }

        const {
            selectedView,
        } = this.state;

        const pending = projectsGetPending || summaryGroupsGetPending;

        return (
            <div className={styles.dashboard}>
                {pending ? (
                    <LoadingAnimation />
                ) : (
                    <MultiViewContainer
                        views={this.views}
                        containerClassName={styles.content}
                        active={selectedView}
                        activeClassName={styles.active}
                    />
                )}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    createConnectedRequestCoordinator()(
        createRequestClient(requests)(Dashboard),
    ),
);
