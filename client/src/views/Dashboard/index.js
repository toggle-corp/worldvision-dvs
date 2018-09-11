import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import turf from 'turf';

import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';

import Map from '#rscz/Map/index';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import {
    projectsSelector,
    pointsSelector,
    rcDataSelector,
    setProjectsAction,
} from '#redux';
import nepalGeoJson from '#resources/districts.json';

import styles from './styles.scss';
import ProjectsGetRequest from './requests/ProjectsGetRequest';
import Report from '../Report';
import BarChart from './BarChart';

const propTypes = {
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    points: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    rcData: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjects: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    projects: projectsSelector(state),
    points: pointsSelector(state),
    rcData: rcDataSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setProjects: params => dispatch(setProjectsAction(params)),
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
        };

        this.projectsRequest = new ProjectsGetRequest({
            setState: params => this.setState(params),
            setProjects: this.props.setProjects,
        }).create();

        this.nepalBounds = turf.bbox(nepalGeoJson);
    }

    componentDidMount() {
        this.projectsRequest.start();

        window.addEventListener('hashchange', this.handleHashChange);
    }

    componentWillUnmount() {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
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

    handlePointClick = (id) => {
        setHashToBrowser(`#/${id}`);
    }

    renderMapLayers = () => (
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
                    layerKey="points"
                    type="circle"
                    paint={{
                        'circle-color': '#f37123',
                        'circle-radius': 7,
                        'circle-opacity': 1,
                    }}
                    property="id"
                    onClick={this.handlePointClick}
                    hoverInfo={{
                        paint: {
                            'circle-color': '#f37123',
                            'circle-radius': 9,
                            'circle-opacity': 0.7,
                        },
                        showTooltip: true,
                        tooltipProperty: 'name',
                    }}
                />
            </MapSource>
        </React.Fragment>
    )

    render() {
        const {
            projects,
            rcData,
        } = this.props;

        if (!projects) {
            return <div />;
        }

        const { selectedView } = this.state;
        const { projectsGetPending } = this.state;

        const views = {
            map: {
                component: () => (
                    <div className={styles.dashboardContent} >
                        <Map
                            className={styles.map}
                            bounds={this.nepalBounds}
                        >
                            {this.renderMapLayers()}
                        </Map>
                        <div className={styles.barchartContainer}>
                            <BarChart
                                data={rcData}
                                className={styles.barchart}
                                labelName="project"
                                labelSelector={d => d.project}
                                margins={{
                                    top: 0,
                                    right: 0,
                                    bottom: 30,
                                    left: 100,
                                }}
                            />
                        </div>
                    </div>
                ),
                mount: true,
                wrapContainer: true,
            },
            report: {
                component: () => {
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

        return (
            <div className={styles.dashboard}>
                { projectsGetPending ?
                    (<LoadingAnimation />) : (
                        <MultiViewContainer
                            views={views}
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
