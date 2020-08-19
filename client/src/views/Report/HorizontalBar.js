/* eslint-disable linebreak-style */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable linebreak-style */
import React from 'react';
import PropTypes from 'prop-types';

import { BarChart, Bar, XAxis, YAxis, LabelList, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function HorizontalBar(props) {
    const {
        data,
        colorScheme,
    } = props;
    return (
        <ResponsiveContainer
            height={350}
            width={350}
        >
            <BarChart
                data={data}
                layout="vertical"
            >
                <XAxis
                    type="number"
                    hide
                />
                <YAxis
                    type="category"
                    dataKey="name"
                />
                <Tooltip />
                <Bar dataKey="value">
                    {
                        data.map((d, index) => (
                            <Cell
                                key={d.key}
                                fill={colorScheme[index]}
                            />
                        ))
                    }
                    <LabelList
                        dataKey="value"
                        fill="#000"
                        position="right"
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

HorizontalBar.propTypes = {
    data: PropTypes.array.isRequired,
    colorScheme: PropTypes.array.isRequired,
};
