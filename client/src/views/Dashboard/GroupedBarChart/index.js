import React from 'react';
import PropTypes from 'prop-types';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from 'recharts';

function CustomizedLabel(props) {
    const { x, y, width, value } = props;

    return (
        <text
            x={x + width / 2.75}
            y={y}
            dy={-8}
            fontSize="12"
        >
            {value}
        </text>
    );
}

export default function GroupedBarChart(props) {
    const {
        data,
    } = props;

    if (data.values.length <= 0) {
        return (
            <div>Nothing to show</div>
        );
    }

    return (
        <ResponsiveContainer
            height={250}
            width="100%"
        >
            <BarChart
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
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

GroupedBarChart.propTypes = {
    data: PropTypes.object.isRequired,
};
