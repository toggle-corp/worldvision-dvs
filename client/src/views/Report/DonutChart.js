/* eslint-disable linebreak-style */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import {
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export default function DonutChart(props) {
    const {
        data,
        colorScheme,
    } = props;
    return (
        <PieChart
            width={180}
            height={180}
        >
            <Pie
                data={data}
                innerRadius={65}
                outerRadius={85}
                dataKey="value"
            >
                {
                    data.map((d, index) => (
                        <Cell
                            key={d.key}
                            fill={colorScheme[index]}
                        />
                    ))
                }
            </Pie>
        </PieChart>
    );
}

DonutChart.propTypes = {
    data: PropTypes.array.isRequired,
    colorScheme: PropTypes.array.isRequired,
};
