import React, {
    PureComponent,
} from 'react';
import {
    select,
    event,
} from 'd3-selection';
import {
    scaleLinear,
    scaleBand,
} from 'd3-scale';
import {
    stack,
    stackOffsetNone,
} from 'd3-shape';
import {
    min, max,
} from 'd3-array';
import {
    axisBottom,
    axisLeft,
} from 'd3-axis';
import PropTypes from 'prop-types';
import Responsive from '#rscg/Responsive';
import Float from '#rscv/Float';

import styles from './styles.scss';

const propTypes = {
    boundingClientRect: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
        }),
    ).isRequired,
    labelSelector: PropTypes.func.isRequired,
    className: PropTypes.string,
    margins: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    className: '',
    margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
};

class BarChart extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.drawChart();
    }

    componentDidUpdate() {
        this.redrawChart();
    }

    init = () => {
        const {
            boundingClientRect,
            margins,
            data,
            labelSelector,
        } = this.props;

        const {
            width,
            height,
        } = boundingClientRect;

        const {
            top,
            right,
            bottom,
            left,
        } = margins;

        this.width = width - right - left;
        this.height = height - top - bottom;
        this.group = select(this.svg)
            .attr('width', this.width + left + right)
            .attr('height', this.height + top + bottom)
            .append('g')
            .attr('transform', `translate(${left}, ${top})`);

        this.dimensions = ['rc', 'difference'];
        this.labels = data.map(d => labelSelector(d));


        this.series = stack()
            .keys(this.dimensions)
            .offset(stackOffsetNone)(data);

        const stackMin = row => min(row, d => d[0]);
        const stackMax = row => max(row, d => d[1]);


        this.x = scaleLinear()
            .domain([min(this.series, stackMin), max(this.series, stackMax)])
            .rangeRound([0, width]);

        this.y = scaleBand()
            .domain(this.labels)
            .rangeRound([height, 0])
            .padding(0.1);
    }

    colors = (d) => {
        const { key, index } = d;
        const { variance } = d[index].data;
        let color;
        if (key === 'difference' && variance <= 0.05) {
            color = '#ec0c1c';
        } else if (key === 'difference') {
            color = '#ccebc5';
        } else if (key === 'rc') {
            color = '#599ad4';
        }
        return color;
    };

    handleMouseOver = (d) => {
        const { key, index } = d;
        const data = d[index];
        const value = data.data[key];
        const { rcLabel, differenceLabel } = data.data;
        const label = key === 'rc' ? rcLabel : differenceLabel;
        select(this.tooltip)
            .html(`<span>${label} : ${value}</span>`)
            .transition()
            .duration(50)
            .style('display', 'inline-block');
    }

    handleMouseMove = () => {
        select(this.tooltip)
            .style('top', `${event.pageY - 30}px`)
            .style('left', `${event.pageX + 20}px`);
    }

    handleMouseOut = () => {
        select(this.tooltip)
            .transition()
            .duration(50)
            .style('display', 'none');
    }

    drawChart = () => {
        const {
            boundingClientRect,
            data,
            labelSelector,
        } = this.props;

        if (!boundingClientRect.width || !data || data.length === 0) {
            return;
        }

        this.init();

        const {
            group,
            series,
            x,
            y,
            height,
            colors,
            handleMouseOver,
            handleMouseMove,
            handleMouseOut,
        } = this;

        group
            .append('g')
            .selectAll('g')
            .data(series)
            .enter()
            .append('g')
            .attr('fill', d => colors(d))
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseout', handleMouseOut)
            .selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('x', d => x(d[0]))
            .attr('y', d => y(labelSelector(d.data)))
            .attr('height', y.bandwidth)
            .attr('width', d => x(d[1]) - x(d[0]))
            .attr('cursor', 'pointer');

        group
            .append('g')
            .attr('class', `xaxis ${styles.xAxis}`)
            .attr('transform', `translate(0, ${height})`)
            .call(axisBottom(x));

        group
            .append('g')
            .attr('class', `yaxis ${styles.yAxis}`)
            .call(axisLeft(y));
    }

    redrawChart = () => {
        const svg = select(this.svg);
        svg.selectAll('*').remove();
        this.drawChart();
    }

    render() {
        const {
            className,
        } = this.props;

        const svgClassName = [
            'bar-chart',
            styles.barchart,
            className,
        ].join(' ');

        return (
            <React.Fragment>
                <svg
                    ref={(element) => { this.svg = element; }}
                    className={svgClassName}
                />
                <Float>
                    <div
                        ref={(el) => { this.tooltip = el; }}
                        className={styles.tooltip}
                    />
                </Float>
            </React.Fragment>
        );
    }
}


export default Responsive(BarChart);
