import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import turf from 'turf';
import { _cs } from '@togglecorp/fujs';

import Map from '#rscz/Map';
import MapContainer from '#rscz/Map/MapContainer';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';

import districts from '#resources/districts.json';
import gaupalika from '#resources/gaupalika.json';

import styles from './styles.scss';

const propTypes = {
    project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    project: {},
    className: undefined,
};

export default class ReportMap extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            code: undefined,
            bounds: [],
        };
    }

    static getDerivedStateFromProps(props, state) {
        const { project = {} } = props;
        const { district: { code = '' } = {} } = project;

        if (code !== state.code) {
            const selectedFeature = districts.features.filter((feature) => {
                const { OCHA_PCODE } = feature.properties;
                return code === OCHA_PCODE;
            });
            const bounds = turf.bbox(turf.featureCollection(selectedFeature));
            const { long, lat, name, id } = project;

            const location = {
                type: 'FeatureCollection',
                features: [{
                    id,
                    geometry: {
                        type: 'Point',
                        coordinates: [long, lat],
                    },
                    properties: {
                        name,
                        id,
                    },
                }],
            };

            return {
                code,
                bounds,
                location,
            };
        }
        return null;
    }


    render() {
        const {
            project: {
                municipalities = [],
            },
            className,
        } = this.props;
        const {
            code,
            bounds,
        } = this.state;

        const mids = municipalities.map(m => m.code);

        return (
            <Map bounds={bounds}>
                <MapContainer className={_cs(className, styles.map)} />
                <MapSource
                    sourceKey="districts"
                    geoJson={districts}
                >
                    <MapLayer
                        layerKey="line"
                        type="line"
                        filter={['==', 'OCHA_PCODE', code]}
                        paint={{
                            'line-color': '#ffffff',
                            'line-opacity': 1,
                            'line-width': 2,
                        }}
                    />
                    <MapLayer
                        layerKey="fill"
                        type="fill"
                        filter={['==', 'OCHA_PCODE', code]}
                        paint={{
                            'fill-color': '#00897B',
                            'fill-opacity': 0.4,
                        }}
                    />
                </MapSource>
                <MapSource
                    sourceKey="gaupalika"
                    geoJson={gaupalika}
                >
                    <MapLayer
                        layerKey="gaupalika-outline"
                        type="line"
                        paint={{
                            'line-color': '#919191',
                            'line-opacity': 0.4,
                            'line-width': 1,
                        }}
                    />
                    <MapLayer
                        layerKey="selected-fill"
                        type="fill"
                        filter={['in', 'N_ID', ...mids]}
                        paint={{
                            'fill-color': '#f37123',
                            'fill-opacity': 0.6,
                        }}
                    />
                </MapSource>
            </Map>
        );
    }
}
