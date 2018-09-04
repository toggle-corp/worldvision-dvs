import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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

import districts from '../../resources/districts.json';

import styles from './styles.scss';

import ReportGetRequest from './requests/ReportGetRequest';

const propTypes = {
    setReport: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

    static valueSelector = d => d.size;
    static labelSelector = d => d.name;

    constructor(props) {
        super(props);

        this.state = {
            reportGetPending: true,
        };
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
                filter={['==', 'OCHA_PCODE', 'W-LUM-49']}
                paint={{
                    'line-color': '#00f',
                    'line-opacity': 1,
                    'line-width': 2,
                }}
                sourceKey="districts"
                layerKey="districts"
            />
        </React.Fragment>
    )

    render() {
        const {
            report,
        } = this.props;

        if (!report) {
            return (
                <div />
            );
        }

        const {
            reportGetPending,
        } = this.state;

        const {
            education,
            childMonitoring,
            healthNutrition,
            rcPieChart,
        } = report.data;

        return (
            <div className={styles.region}>
                { reportGetPending && <LoadingAnimation /> }
                <Map
                    className={styles.map}
                    childRenderer={this.renderMapLayers}
                    bounds={this.nepalBounds}
                />
                <div
                    className={styles.sunburstContainer}
                >
                    <h2>Education</h2>
                    <SunBurst
                        className={styles.sunburst}
                        data={education}
                        valueSelector={Report.valueSelector}
                        labelSelector={Report.labelSelector}
                    />
                </div>
                <div
                    className={styles.horizontalBarContainer}
                >
                    <h2>Health/Nutrition</h2>
                    <HorizontalBar
                        className={styles.horizontalBar}
                        data={healthNutrition}
                        valueSelector={d => d.value}
                        scaleType="log"
                        labelSelector={d => d.name}
                        showGridLines={false}
                        margins={
                            {
                                top: 24,
                                right: 24,
                                bottom: 40,
                                left: 30,
                            }
                        }
                    />
                </div>
                <div
                    className={styles.donutChartContainer}
                >
                    <h2>Child Monitoring</h2>
                    <DonutChart
                        className={styles.donutChart}
                        data={childMonitoring}
                        valueSelector={d => d.value}
                        labelSelector={d => d.name}
                    />
                </div>
                <SunBurst
                    className={styles.sunburst}
                    data={rcPieChart}
                    valueSelector={d => d.size}
                    labelSelector={d => d.name}
                />
            </div>
        );
    }
}
