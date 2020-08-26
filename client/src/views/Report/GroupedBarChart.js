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
import memoizeOne from 'memoize-one';

export default function GroupedBarChart(props) {
    const {
        data,
    } = props;

    const getBarLabels = memoizeOne(labelData => Array.from(
        new Map(
            Object.entries(labelData.colors),
        ),
    ));

    const barLabels = getBarLabels(data);

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
                {barLabels.map(([key, colorValue]) => (
                    <Bar
                        dataKey={key}
                        key={key}
                        fill={colorValue}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}

GroupedBarChart.propTypes = {
    data: PropTypes.object.isRequired,
};
