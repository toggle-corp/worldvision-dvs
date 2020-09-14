import React from 'react';
import PropTypes from 'prop-types';
import { isNotDefined } from '@togglecorp/fujs';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Line,
} from 'recharts';

function CustomizedLabel(props) {
    const { x, y, width, value } = props;
    return (
        <text
            x={x + width / 3}
            y={y}
            dy={-8}
            fontSize={10}
        >
            {value}
        </text>
    );
}

export default function GroupedBarChart(props) {
    const {
        data,
        lineKey,
    } = props;

    if (isNotDefined(data) || isNotDefined(data.values) || data.values.length <= 0) {
        return (
            <div>Nothing to show</div>
        );
    }

    return (
        <ResponsiveContainer
            height={250}
            width="100%"
        >
            <ComposedChart
                data={data.values}
                margin={{ top: 50 }}
            >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend align="center" />
                {data.columns.map(column => (
                    <Bar
                        dataKey={column}
                        key={column}
                        fill={data.colors[column]}
                        label={<CustomizedLabel />}
                        style={{ cursor: 'pointer' }}
                    />
                ))}
                {!!lineKey && (
                    <Line
                        dataKey={lineKey}
                        stroke="#0591fb"
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
}

GroupedBarChart.defaultProps = {
    lineKey: '',
};

GroupedBarChart.propTypes = {
    data: PropTypes.object.isRequired,
    lineKey: PropTypes.string,
};
