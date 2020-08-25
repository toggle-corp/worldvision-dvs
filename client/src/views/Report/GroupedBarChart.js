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
} from 'recharts';

export default function GroupedBarChart(props) {
    const {
        data,
    } = props;

    const barLabels = Array.from(
        new Map(
            Object.entries(data.colors),
        ),
    );

    return (
        <ResponsiveContainer
            height={200}
            width="100%"
        >
            <BarChart
                data={data.values}
            >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {
                    barLabels.map(([key, colorValue]) => (
                        <Bar
                            dataKey={key}
                            key={key}
                            fill={colorValue}
                        />
                    ))
                }
            </BarChart>
        </ResponsiveContainer>
    );
}

GroupedBarChart.propTypes = {
    data: PropTypes.object.isRequired,
};
