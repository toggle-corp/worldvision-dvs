import React from 'react';
import PropTypes from 'prop-types';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LabelList,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function HorizontalBar(props) {
    const {
        data,
        colorScheme,
    } = props;

    if (data.length <= 0) {
        return (
            <div>
                Nothings to show.
            </div>
        );
    }

    return (
        <ResponsiveContainer
            height={350}
            width="100%"
        >
            <BarChart
                data={data}
                barSize={35}
            >
                <YAxis
                    type="number"
                />
                <XAxis
                    type="category"
                    dataKey="name"
                    scale="auto"
                />
                <Tooltip cursor={false} />
                <Bar
                    dataKey="value"
                >
                    {data.map((d, index) => (
                        <Cell
                            key={d.name}
                            fill={colorScheme[index]}
                        />
                    ))}
                    <LabelList
                        dataKey="value"
                        fill="#000"
                        position="top"
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
