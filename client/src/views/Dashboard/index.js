import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
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

import styles from './styles.scss';
import ProjectsGetRequest from './requests/ProjectsGetRequest';
import SummaryGetRequest from './requests/ProjectsSummaryGetRequest';
import SiteSettingsRequest from './requests/SiteSettingsRequest';
import SummaryGroupsGetRequest from './requests/SummaryGroupsGetRequest';
import ProjectsMap from './ProjectsMap';
import Report from '../Report';
import SummaryContainer from './SummaryContainer';

const propTypes = {
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    summary: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    siteSettings: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    points: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    summaryGroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjects: PropTypes.func.isRequired,
    setSummary: PropTypes.func.isRequired,
    setSiteSettings: PropTypes.func.isRequired,
    setSummaryGroups: PropTypes.func.isRequired,
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

class Dashboard extends PureComponent {
    static propTypes = propTypes;

    static labelSelector = d => d.project;

    static keySelector = d => d.name;

    constructor(props) {
        super(props);

        const hash = getHashFromBrowser();

        const {
            setProjects,
            setSummary,
            setSiteSettings,
            setSummaryGroups,
        } = this.props;

        this.state = {
            projectsGetPending: true,
            summaryGroupsPending: true,

            selectedView: (hash ? 'report' : 'map'),
            selectedProjectId: +hash,
        };

        this.projectsRequest = new ProjectsGetRequest({
            setState: params => this.setState(params),
            setProjects,
        }).create();

        this.summaryRequest = new SummaryGetRequest({
            setState: params => this.setState(params),
            setSummary,
        }).create();

        this.siteSettingsRequest = new SiteSettingsRequest({
            setState: params => this.setState(params),
            setSiteSettings,
        }).create();

        this.summaryGroupsRequest = new SummaryGroupsGetRequest({
            setState: params => this.setState(params),
            setSummaryGroups,
        }).create();

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

                    const overview = {
                        summary,
                        noOfProjects: projects.length || 0,
                        siteSettings,
                    };

                    return (
                        <div className={styles.dashboardContent}>
                            <div className={styles.mapContainer}>
                                <ProjectsMap
                                    className={styles.map}
                                    projects={projects}
                                    points={points}
                                />
                            </div>
                            <SummaryContainer
                                className={styles.aggregatedContainer}
                                overview={overview}
                                siteSettings={siteSettings}
                                summaryGroups={summaryGroups}
                            />
                        </div>
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
        this.projectsRequest.start();
        this.summaryRequest.start();
        this.siteSettingsRequest.start();
        this.summaryGroupsRequest.start();

        window.addEventListener('hashchange', this.handleHashChange);
    }

    componentWillUnmount() {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
        if (this.summaryRequest) {
            this.summaryRequest.stop();
        }
        if (this.siteSettingsRequest) {
            this.siteSettingsRequest.stop();
        }

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
        const { projects } = this.props;

        if (!projects) {
            return <div />;
        }

        const {
            selectedView,
            projectsGetPending,
            summaryGroupsPending,
        } = this.state;

        const pending = projectsGetPending || summaryGroupsPending;

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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
