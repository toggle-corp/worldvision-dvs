import React from 'react';
import PropTypes from 'prop-types';

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

export default function DonutChart(props) {
    const {
        data,
        colorScheme,
    } = props;
    return (
        <ResponsiveContainer
            height="100%"
            width={180}
        >
            <PieChart>
                <Pie
                    data={data}
                    innerRadius={65}
                    outerRadius={85}
                    dataKey="value"
                >
                    {data.map((d, index) => (
                        <Cell
                            key={d.key}
                            fill={colorScheme[index]}
                        />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
}

DonutChart.propTypes = {
    data: PropTypes.array.isRequired,
    colorScheme: PropTypes.array.isRequired,
};
