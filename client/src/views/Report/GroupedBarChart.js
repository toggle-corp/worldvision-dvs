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
} from 'recharts';
import memoizeOne from 'memoize-one';

export default function GroupedBarChart(props) {
    const {
        data,
    } = props;


    if (isNotDefined(data) || isNotDefined(data.values) || data.values.length <= 0) {
        return (
            <div>Nothing to show</div>
        );
    }

    const getBarLabels = memoizeOne(labelData => Array.from(
        new Map(
            Object.entries(labelData.colors),
        ),
    ));

    const barLabels = getBarLabels(data);

    const numberOfData = data.values.length;

    return (
        <ResponsiveContainer
            height={250}
            width={numberOfData < 4 ? '60%' : '90%'}
        >
            <BarChart
                data={data.values}
                barCategoryGap={numberOfData > 5 ? '10%' : '20%'}
                margin={{ top: 50 }}
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
