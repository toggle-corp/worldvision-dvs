import React from 'react';
import PropTypes from 'prop-types';
import turf from 'turf';

import Map from '#rscz/Map/index';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import ListView from '#rscv/List/ListView';
import KeyValue from '#components/KeyValue';

import nepalGeoJson from '#resources/districts.json';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    points: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
};

const nepalBounds = turf.bbox(nepalGeoJson);

const boundsFill = {
    'fill-color': '#00897B',
    'fill-opacity': 0.4,
};

const boundsOutline = {
    'line-color': '#ffffff',
    'line-opacity': 1,
    'line-width': 1,
};

const pointsOuter = {
    'circle-color': '#000',
    'circle-radius': 14,
    'circle-opacity': 0.4,
};

const pointsInner = {
    'circle-color': '#f37123',
    'circle-radius': 10,
    'circle-opacity': 1,
};

const hoverPaint = {
    'circle-color': '#f37123',
    'circle-radius': 10,
    'circle-opacity': 1,
};
const rcDataParams = (key, data) => ({
    title: data.name,
    value: data.value,
});

const keySelector = d => d.name;

export default class ProjectsMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentHoverId: undefined,
        };

        this.hoverInfo = {
            paint: hoverPaint,
            showTooltip: true,
            tooltipProperty: 'name',
            tooltipModifier: this.renderTooltip,
            onMouseOver: this.handleMapPointHover,
        };
    }

    handleMapPointHover = (data = {}) => {
        this.setState({ currentHoverId: data.id });
    }

    handlePointClick = (id) => {
        window.open(`#/${id}`, '_blank');
    }

    renderTooltip = () => {
        const { projects } = this.props;
        const { currentHoverId } = this.state;

        if (!currentHoverId) {
            return null;
        }

        const project = projects.find((p = {}) => p.id === currentHoverId);

        return (
            <div className={styles.hoverInfo}>
                <h4>
                    {project.name}
                </h4>
                <ListView
                    data={project.rcData}
                    rendererParams={rcDataParams}
                    keySelector={keySelector}
                    renderer={KeyValue}
                />
            </div>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            points,
        } = this.props;

        const className = [
            styles.map,
            classNameFromProps,
            'projects-map',
        ].join(' ');

        return (
            <Map
                className={className}
                bounds={nepalBounds}
                fitBoundsDuration={10}
            >
                <MapSource
                    sourceKey="bounds"
                    geoJson={nepalGeoJson}
                >
                    <MapLayer
                        layerKey="bounds-fill"
                        type="fill"
                        paint={boundsFill}
                    />
                    <MapLayer
                        layerKey="bounds-outline"
                        type="line"
                        paint={boundsOutline}
                    />
                </MapSource>
                <MapSource
                    sourceKey="points"
                    geoJson={points}
                    supportHover
                >
                    <MapLayer
                        layerKey="points-red"
                        type="circle"
                        paint={pointsOuter}
                        property="id"
                        onClick={this.handlePointClick}
                    />
                    <MapLayer
                        layerKey="points"
                        type="circle"
                        paint={pointsInner}
                        property="id"
                        onClick={this.handlePointClick}
                        hoverInfo={this.hoverInfo}
                    />
                </MapSource>
            </Map>
        );
    }
}
