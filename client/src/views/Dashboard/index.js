import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import turf from 'turf';

import LoadingAnimation from '#rscv/LoadingAnimation';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import {
    projectsSelector,
    setProjectsAction,
} from '#redux';
import nepalGeoJson from '../../resources/districts.json';

import styles from './styles.scss';
import ProjectsGetRequest from './requests/ProjectsGetRequest';
import Report from '../Report';

const propTypes = {
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjects: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    projects: projectsSelector(state),
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
        this.views = {
            map: {
                component: () => (
                    <Map
                        className={styles.map}
                        childRenderer={this.renderMapLayers}
                        bounds={this.nepalBounds}
                    />
                ),
                mount: true,
                wrapContainer: true,
            },
            report: {
                component: () => (
                    <Report
                        projectId={this.state.selectedProjectId}
                    />
                ),
                wrapContainer: true,
            },
        };
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

    renderMapLayers = ({ map }) => (
        <React.Fragment>
            <MapSource
                map={map}
                geoJson={nepalGeoJson}
                sourceKey="bounds"
            />
            <MapSource
                map={map}
                geoJson={this.points}
                sourceKey="points"
                supportHover
            />
            <MapLayer
                map={map}
                type="line"
                paint={{
                    'line-color': '#f00',
                    'line-opacity': 1,
                    'line-width': 2,
                }}
                sourceKey="bounds"
                layerKey="bounds"
            />
            <MapLayer
                map={map}
                type="circle"
                paint={{
                    'circle-color': '#0f0',
                    'circle-radius': 7,
                    'circle-opacity': 1,
                }}
                sourceKey="points"
                layerKey="points"
                property="id"
                onClick={this.handlePointClick}
                hoverInfo={{
                    paint: {
                        'circle-color': '#ff0',
                        'circle-radius': 7,
                        'circle-opacity': 1,
                    },
                    showTooltip: true,
                    tooltipProperty: 'name',
                }}
            />
        </React.Fragment>
    )

    render() {
        const {
            projects,
        } = this.props;

        if (!projects) {
            return <div />;
        }

        const { selectedView } = this.state;

        const points = projects.map(project => turf.point(
            [project.long, project.lat],
            {
                name: project.name,
                id: project.id,
            },
        ));

        this.points = turf.featureCollection(points);
        const {
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
