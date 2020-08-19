/* eslint-disable linebreak-style */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                    barLabels.map(label => (
                        <Bar
                            dataKey={label[0]}
                            key={label[0]}
                            fill={label[1]}
                        />
                    ))
                }
            </BarChart>
        </ResponsiveContainer>
    );
}

GroupedBarChart.propTypes = {
    data: PropTypes.array.isRequired,
};
