import React from 'react';
import PropTypes from 'prop-types';
import turf from 'turf';
import { _cs } from '@togglecorp/fujs';

import Map from '#rscz/Map/index';
import MapContainer from '#rscz/Map/MapContainer';
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

/*
const hoverPaint = {
    'circle-color': '#f37123',
    'circle-radius': 10,
    'circle-opacity': 1,
};
*/

const rcDataParams = (key, data) => ({
    title: data.name,
    value: data.value,
});

const keySelector = d => d.name;

export default class ProjectsMap extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    handlePointClick = (id) => {
        window.open(`#/${id}`, '_blank');
    }

    rendererParams = id => ({ projectId: id })

    renderTooltip = ({ projectId }) => {
        const { projects } = this.props;

        const project = projects.find((p = {}) => p.id === projectId);
        console.warn('here', project);

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
            className,
            points,
        } = this.props;

        return (
            <Map
                bounds={nepalBounds}
                fitBoundsDuration={10}
            >
                <MapContainer className={_cs(styles.map, className)} />
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
                >
                    <MapLayer
                        layerKey="points-red"
                        type="circle"
                        paint={pointsOuter}
                    />
                    <MapLayer
                        layerKey="points"
                        type="circle"
                        paint={pointsInner}
                        onClick={this.handlePointClick}
                        showToolTipOnHover
                        tooltipRenderer={this.renderTooltip}
                        tooltipRendererParams={this.rendererParams}
                    />
                </MapSource>
            </Map>
        );
    }
}
