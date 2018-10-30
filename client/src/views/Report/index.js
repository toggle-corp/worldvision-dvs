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
import ListView from '#rscv/List/ListView';
import List from '#rscv/List';
import KeyValue from '#components/KeyValue';
import Map from '#rscz/Map';
import MapLayer from '#rscz/Map/MapLayer';
import MapSource from '#rscz/Map/MapSource';
import { mapToList } from '#rsu/common';

import districts from '#resources/districts.json';
import gaupalika from '#resources/gaupalika.json';

import CorrespondenceItem from './CorrespondenceItem';

import styles from './styles.scss';

import ReportGetRequest from './requests/ReportGetRequest';

const propTypes = {
    setReport: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    report: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    report: {},
};

const mapStateToProps = (state, props) => ({
    report: reportSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setReport: params => dispatch(setReportAction(params)),
    setSelectedProject: params => dispatch(setSelectedProjectAction(params)),
});

const setHashToBrowser = (hash) => { window.location.hash = hash; };

@connect(mapStateToProps, mapDispatchToProps)
export default class Report extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static sizeSelector = d => d.size;
    static valueSelector = d => d.value;
    static labelSelector = d => d.name;

    static labelModifierSelector = (label, value) => (`
        <div class=${styles.tooltip} >
            ${label}:
            <span class=${styles.value}>
                ${value}
            </span>
        </div>
    `);

    static tableKeySelector = d => d.name;
    static healthKeySelector = d => d.name;
    static childKeySelector = d => d.name;

    static correspondenceKeySelector = d => d.typeName;

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

    healthNutritionParams = (key, data) => {
        const classNames = [];
        if (data.type === 'bad') {
            classNames.push(styles.flashData);
        }

        return ({
            title: data.name,
            value: data.value,
            className: classNames.join(' '),
        });
    };

    correspoodencesParams = (key, data) => ({
        title: data.typeName,
        data,
    });

    handleGoBack = () => {
        setHashToBrowser('/');
    };

    renderDistrictLayers = () => {
        const {
            project: {
                municipalities = [],
            },
        } = this.props;
        const mids = municipalities.map(m => m.code);

        return (
            <React.Fragment>
                <MapSource
                    sourceKey="districts"
                    geoJson={districts}
                    supportHover
                >
                    <MapLayer
                        layerKey="line"
                        type="line"
                        filter={['==', 'OCHA_PCODE', this.state.code]}
                        paint={{
                            'line-color': '#ffffff',
                            'line-opacity': 1,
                            'line-width': 2,
                        }}
                    />
                    <MapLayer
                        layerKey="fill"
                        type="fill"
                        filter={['==', 'OCHA_PCODE', this.state.code]}
                        paint={{
                            'fill-color': '#00897B',
                            'fill-opacity': 0.4,
                        }}
                    />
                </MapSource>
                <MapSource
                    sourceKey="gaupalika"
                    geoJson={gaupalika}
                    supportHover
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
                <MapSource
                    sourceKey="points"
                    geoJson={this.state.location}
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
                        hoverInfo={{
                            paint: {
                                'circle-color': '#f37123',
                                'circle-radius': 10,
                                'circle-opacity': 1,
                            },
                            showTooltip: true,
                            tooltipProperty: 'name',
                        }}
                    />
                </MapSource>
            </React.Fragment>
        );
    }

    renderCorrespondenceItems = () => {
        const {
            report: {
                data: {
                    correspondences = [],
                } = {},
            } = {},
        } = this.props;

        const correspondencesTotal = correspondences.reduce((acc, d) => ({
            pendingCurrent: acc.pendingCurrent + d.pendingCurrent,
            pendingOverDue: acc.pendingOverDue + d.pendingOverDue,
        }), {
            pendingCurrent: 0,
            pendingOverDue: 0,
        });
        const finalTotal = Object.keys(correspondencesTotal).map(m => ({
            name: m,
            value: correspondencesTotal[m],
        }));

        return (
            <div className={styles.tables}>
                <div className={styles.heading}>
                    Total
                </div>
                <ListView
                    className={styles.table}
                    data={finalTotal}
                    rendererParams={this.healthNutritionParams}
                    keyExtractor={Report.healthKeySelector}
                    renderer={KeyValue}
                />
                <List
                    data={correspondences}
                    rendererParams={this.correspoodencesParams}
                    keyExtractor={Report.correspondenceKeySelector}
                    renderer={CorrespondenceItem}
                />
            </div>
        );
    }

    render() {
        const {
            report,
            project,
        } = this.props;

        if (!report) {
            return (
                <div className={`${styles.region} ${styles.noRegionFound}`} >
                    <div className={styles.heading}>
                        The report you are looking for does not exist.
                        <button
                            className={styles.goBack}
                            onClick={this.handleGoBack}
                        >
                            Click here to go back
                        </button>
                    </div>
                </div>
            );
        }

        const {
            bounds,
            reportGetPending,
        } = this.state;

        const {
            data: {
                education = {},
                childMonitoring = [],
                healthNutrition = [],
                rcPieChart = {},
                rcData = {},
            } = {},
        } = report;

        const modifier = (element, key) => (
            {
                name: key,
                value: element,
            }
        );
        const remoteChildren = mapToList(rcData, modifier);

        const childDonutKeys = [
            '@NotSighted30Days',
            '@NotSighted60Days',
            '@NotSighted90Days',
        ];

        const healthDonutKeys = [
            '@HealthSatisfactory',
            '@HealthNotSatisfactory',
        ];

        const childDonut = childMonitoring.filter(c => childDonutKeys.indexOf(c.key) >= 0);
        const healthDonut = healthNutrition.filter(c => healthDonutKeys.indexOf(c.key) >= 0);

        const CorrespondenceItems = this.renderCorrespondenceItems;

        return (
            <div className={styles.region}>
                { reportGetPending && <LoadingAnimation /> }
                <div className={styles.header} >
                    <div className={styles.heading} >
                        <button
                            className={styles.goBack}
                            onClick={this.handleGoBack}
                        >
                            <span className="ion-android-arrow-back" />
                        </button>
                        {project.name}
                    </div>
                </div>
                <div className={styles.container}>
                    <div className={styles.upperContainer}>
                        <Map
                            className={styles.map}
                            bounds={bounds}
                        >
                            {this.renderDistrictLayers()}
                        </Map>
                        <div className={styles.tableContainer} >
                            <div className={styles.item} >
                                <h3>Health/Nutrition</h3>
                                <div className={styles.vizWrapper}>
                                    <ListView
                                        className={styles.table}
                                        data={healthNutrition}
                                        rendererParams={this.healthNutritionParams}
                                        keyExtractor={Report.healthKeySelector}
                                        renderer={KeyValue}
                                    />
                                    <DonutChart
                                        className={styles.viz}
                                        data={healthDonut}
                                        valueSelector={Report.valueSelector}
                                        labelSelector={Report.labelSelector}
                                        labelModifier={Report.labelModifierSelector}
                                        colorScheme={[
                                            '#41cf76',
                                            '#f44336',
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className={styles.item} >
                                <h3>Child Monitoring</h3>
                                <div className={styles.vizWrapper}>
                                    <ListView
                                        className={styles.table}
                                        data={childMonitoring}
                                        rendererParams={this.healthNutritionParams}
                                        keyExtractor={Report.childKeySelector}
                                        renderer={KeyValue}
                                    />
                                    <DonutChart
                                        className={styles.viz}
                                        data={childDonut}
                                        valueSelector={Report.valueSelector}
                                        labelSelector={Report.labelSelector}
                                        labelModifier={Report.labelModifierSelector}
                                        colorScheme={[
                                            '#41cf76',
                                            '#ef8c00',
                                            '#f44336',
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.lowerContainer}>
                        <div className={styles.item}>
                            <h3>RC Data</h3>
                            <div className={styles.vizContainer}>
                                <HorizontalBar
                                    className={styles.viz}
                                    data={remoteChildren}
                                    valueSelector={Report.valueSelector}
                                    labelSelector={Report.labelSelector}
                                    showGridLines={false}
                                    colorScheme={[
                                        '#FF7725',
                                        '#BF591C',
                                        '#7F3B12',
                                        '#401E09',
                                        '#E56B21',
                                    ]}
                                    margins={{
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 64,
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.item}>
                            <h3>RC Actual Distribution</h3>
                            <div className={styles.vizContainer}>
                                <SunBurst
                                    className={styles.viz}
                                    data={rcPieChart}
                                    labelSelector={Report.labelSelector}
                                    valueSelector={Report.sizeSelector}
                                />
                            </div>
                        </div>
                        <div className={styles.item} >
                            <h3>Education</h3>
                            <div className={styles.vizContainer}>
                                <SunBurst
                                    className={styles.viz}
                                    data={education}
                                    valueSelector={Report.sizeSelector}
                                    labelSelector={Report.labelSelector}
                                />
                            </div>
                        </div>
                        <div className={styles.item} >
                            <h3>Correspondence</h3>
                            <CorrespondenceItems />
                        </div>
                        <div className={styles.item} >
                            <h3>Participation / Support</h3>
                        </div>
                        <div className={styles.item} />
                    </div>
                </div>
            </div>
        );
    }
}
