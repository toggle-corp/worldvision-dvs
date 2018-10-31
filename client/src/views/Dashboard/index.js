import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import turf from 'turf';

import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';

import Map from '#rscz/Map/index';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';
import KeyValue from '#components/KeyValue';
import ListView from '#rscv/List/ListView';

import {
    siteSettingsSelector,
    projectsSelector,
    summarySelector,
    pointsSelector,
    setProjectsAction,
    setSummaryAction,
    setSiteSettingsAction,
} from '#redux';

import nepalGeoJson from '#resources/districts.json';

import styles from './styles.scss';
import ProjectsGetRequest from './requests/ProjectsGetRequest';
import SummaryGetRequest from './requests/ProjectsSummaryGetRequest';
import SiteSettingsRequest from './requests/SiteSettingsRequest';
import Report from '../Report';
import Summary from './Summary';

const propTypes = {
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    summary: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    siteSettings: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    points: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjects: PropTypes.func.isRequired,
    setSummary: PropTypes.func.isRequired,
    setSiteSettings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    projects: projectsSelector(state),
    summary: summarySelector(state),
    siteSettings: siteSettingsSelector(state),
    points: pointsSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setProjects: params => dispatch(setProjectsAction(params)),
    setSummary: params => dispatch(setSummaryAction(params)),
    setSiteSettings: params => dispatch(setSiteSettingsAction(params)),
});

// NOTE: hash should be similar to '#/metadata'
const setHashToBrowser = (hash) => { window.location.hash = hash; };
// NOTE: receives data similar to '#/metadata'
const getHashFromBrowser = () => window.location.hash.substr(2);

@connect(mapStateToProps, mapDispatchToProps)
export default class Dashboard extends PureComponent {
    static propTypes = propTypes;
    static labelSelector = d => d.project;

    constructor(props) {
        super(props);

        const hash = getHashFromBrowser();

        this.state = {
            projectsGetPending: true,

            selectedView: (hash ? 'report' : 'map'),
            selectedProjectId: +hash,

            currentHoverId: undefined,
        };

        this.projectsRequest = new ProjectsGetRequest({
            setState: params => this.setState(params),
            setProjects: this.props.setProjects,
        }).create();

        this.summaryRequest = new SummaryGetRequest({
            setState: params => this.setState(params),
            setSummary: this.props.setSummary,
        }).create();

        this.siteSettingsRequest = new SiteSettingsRequest({
            setState: params => this.setState(params),
            setSiteSettings: this.props.setSiteSettings,
        }).create();

        this.nepalBounds = turf.bbox(nepalGeoJson);

        this.views = {
            map: {
                component: () => {
                    const {
                        summary,
                        projects,
                        siteSettings,
                    } = this.props;

                    return (
                        <div className={styles.dashboardContent} >
                            <div className={styles.mapContainer}>
                                <Map
                                    className={styles.map}
                                    bounds={this.nepalBounds}
                                    fitBoundsDuration={10}
                                >
                                    {this.renderMapLayers()}
                                </Map>
                            </div>
                            <Summary
                                className={styles.aggregatedContainer}
                                summary={summary}
                                noOfProjects={projects.length}
                                siteSettings={siteSettings}
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
                            projectId={this.state.selectedProjectId}
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

    handlePointClick = (id, e) => {
        if (e.originalEvent.ctrlKey) {
            window.open(`#/${id}`, '_blank');
        } else {
            setHashToBrowser(`#/${id}`);
        }
    }

    handleMapPointHover = (data) => {
        this.setState({ currentHoverId: data && data.id });
    }

    rcDataParams = (key, data) => ({
        title: data.name,
        value: data.value,
    });

    renderMapLayers = () => {
        const { projects } = this.props;
        const { currentHoverId } = this.state;

        const project = currentHoverId ? (
            projects.find(p => (p || {}).id === currentHoverId)
        ) : (
            {}
        );
        return (
            <React.Fragment>
                <MapSource
                    sourceKey="bounds"
                    geoJson={nepalGeoJson}
                >
                    <MapLayer
                        layerKey="bounds-fill"
                        type="fill"
                        paint={{
                            'fill-color': '#00897B',
                            'fill-opacity': 0.4,
                        }}
                    />
                    <MapLayer
                        layerKey="bounds-outline"
                        type="line"
                        paint={{
                            'line-color': '#ffffff',
                            'line-opacity': 1,
                            'line-width': 1,
                        }}
                    />
                </MapSource>
                <MapSource
                    sourceKey="points"
                    geoJson={this.props.points}
                    supportHover
                >
                    <MapLayer
                        layerKey="points-red"
                        type="circle"
                        paint={{
                            'circle-color': '#000',
                            'circle-radius': 14,
                            'circle-opacity': 0.4,
                        }}
                        property="id"
                        onClick={this.handlePointClick}
                    />
                    <MapLayer
                        layerKey="points"
                        type="circle"
                        paint={{
                            'circle-color': '#f37123',
                            'circle-radius': 10,
                            'circle-opacity': 1,
                        }}
                        property="id"
                        onClick={this.handlePointClick}
                        hoverInfo={{
                            paint: {
                                'circle-color': '#f37123',
                                'circle-radius': 10,
                                'circle-opacity': 1,
                            },
                            showTooltip: true,
                            tooltipProperty: 'name',
                            tooltipModifier: () => (
                                <div className={styles.hoverInfo}>
                                    <h4>{project.name}</h4>
                                    <ListView
                                        data={project.rcData}
                                        className={styles.rcDataHover}
                                        rendererParams={this.rcDataParams}
                                        keySelector={Report.healthKeySelector}
                                        renderer={KeyValue}
                                    />
                                </div>
                            ),
                            onMouseOver: this.handleMapPointHover,
                        }}
                    />
                </MapSource>
            </React.Fragment>
        );
    };

    render() {
        const { projects } = this.props;

        if (!projects) {
            return <div />;
        }

        const {
            selectedView,
            projectsGetPending,
        } = this.state;

        return (
            <div className={styles.dashboard}>
                { projectsGetPending ?
                    (<LoadingAnimation />) : (
                        <MultiViewContainer
                            views={this.views}
                            containerClassName={styles.content}
                            active={selectedView}
                            activeClassName={styles.active}
                        />
                    )
                }
            </div>
        );
    }
}
