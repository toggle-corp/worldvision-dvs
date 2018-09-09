import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import turf from 'turf';

import {
    reportSelector,
    setReportAction,
    setSelectedProjectAction,
} from '#redux';

import LoadingAnimation from '#rscv/LoadingAnimation';
import SunBurst from '#rscz/SunBurst';
import HorizontalBar from '#rscz/HorizontalBar';
import DonutChart from '#rscz/DonutChart';
import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';
import { mapToList } from '#rsu/common';

import districts from '../../resources/districts.json';

import styles from './styles.scss';

import ReportGetRequest from './requests/ReportGetRequest';

const propTypes = {
    setReport: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};


const mapStateToProps = (state, props) => ({
    report: reportSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setReport: params => dispatch(setReportAction(params)),
    setSelectedProject: params => dispatch(setSelectedProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Report extends PureComponent {
    static propTypes = propTypes;

    static sizeSelector = d => d.size;
    static valueSelector = d => d.value;
    static labelSelector = d => d.name;

    constructor(props) {
        super(props);

        this.state = {
            reportGetPending: true,
            code: undefined,
            location: undefined,
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
            const point = turf.point(
                [long, lat],
                {
                    name,
                    id,
                },
            );
            const location = turf.featureCollection([point]);
            return {
                code,
                bounds,
                location,
            };
        }
        return null;
    }

    componentDidMount() {
        const {
            projectId,
            setReport,
        } = this.props;

        this.reportRequest = new ReportGetRequest({
            setState: params => this.setState(params),
            setReport,
        }).create(projectId);

        this.reportRequest.start();
    }

    componentWillUnmount() {
        if (this.reportRequest) {
            this.reportRequest.stop();
        }
    }

    renderDistrictLayers = ({ map }) => (
        <React.Fragment>
            <MapSource
                map={map}
                geoJson={districts}
                sourceKey="districts"
            />
            <MapLayer
                map={map}
                type="line"
                filter={['==', 'OCHA_PCODE', this.state.code]}
                paint={{
                    'line-color': '#08327d',
                    'line-opacity': 1,
                    'line-width': 2,
                }}
                sourceKey="districts"
                layerKey="line"
            />
            <MapLayer
                map={map}
                type="fill"
                filter={['==', 'OCHA_PCODE', this.state.code]}
                paint={{
                    'fill-color': '#08327d',
                    'fill-opacity': 0.3,
                }}
                sourceKey="districts"
                layerKey="fill"
            />
            <MapSource
                map={map}
                geoJson={this.state.location}
                sourceKey="points"
                supportHover
            />
            <MapLayer
                map={map}
                type="circle"
                paint={{
                    'circle-color': '#f43530',
                    'circle-radius': 7,
                    'circle-opacity': 1,
                }}
                sourceKey="points"
                layerKey="points"
                hoverInfo={{
                    paint: {
                        'circle-color': '#f43530',
                        'circle-radius': 9,
                        'circle-opacity': 0.7,
                    },
                    showTooltip: true,
                    tooltipProperty: 'name',
                }}
            />
        </React.Fragment>
    )

    render() {
        const {
            report,
            project,
        } = this.props;

        if (!report) {
            return (
                <div />
            );
        }

        const {
            bounds,
            reportGetPending,
        } = this.state;

        const {
            education,
            childMonitoring,
            healthNutrition,
            rcPieChart,
            rcData,
        } = report.data;

        const modifier = (element, key) => (
            {
                name: key,
                value: element,
            }
        );
        const remoteChildren = mapToList(rcData, modifier);

        return (
            <div className={styles.region}>
                { reportGetPending && <LoadingAnimation /> }
                <div className={styles.header} >
                    <h2>{project.name}</h2>
                </div>
                <div className={styles.upperContainer}>
                    <Map
                        className={styles.map}
                        childRenderer={this.renderDistrictLayers}
                        bounds={bounds}
                    />
                    <div className={styles.rcContainer}>
                        <h3>RC Data</h3>
                        <div className={styles.horizontalBarContainer}>
                            <HorizontalBar
                                className={styles.horizontalBar}
                                data={remoteChildren}
                                valueSelector={Report.valueSelector}
                                labelSelector={Report.labelSelector}
                                showGridLines={false}
                                margins={{
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 100,
                                }}
                            />
                        </div>
                        <h3>RC Distribution</h3>
                        <div className={styles.sunburstContainer} >
                            <SunBurst
                                className={styles.sunburst}
                                data={rcPieChart}
                                labelSelector={Report.labelSelector}
                                valueSelector={Report.sizeSelector}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.lowerContainer}>
                    <div className={styles.itemContainer} >
                        <h3>Education</h3>
                        <SunBurst
                            className={styles.item}
                            data={education}
                            valueSelector={Report.sizeSelector}
                            labelSelector={Report.labelSelector}
                        />
                    </div>
                    <div className={styles.itemContainer} >
                        <h3>Health/Nutrition</h3>
                        <HorizontalBar
                            className={styles.item}
                            data={healthNutrition}
                            scaleType="log"
                            valueSelector={Report.valueSelector}
                            labelSelector={Report.labelSelector}
                            showGridLines={false}
                            margins={
                                {
                                    top: 24,
                                    right: 24,
                                    bottom: 40,
                                    left: 300,
                                }
                            }
                        />
                    </div>
                    <div className={styles.itemContainer} >
                        <h3>Child Monitoring</h3>
                        <DonutChart
                            className={styles.item}
                            data={childMonitoring}
                            valueSelector={Report.valueSelector}
                            labelSelector={Report.labelSelector}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
