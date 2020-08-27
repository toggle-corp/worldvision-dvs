import React from 'react';
import PropTypes from 'prop-types';

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import styles from './styles.scss';

const CustomTooltip = ({ active, payload }) => {
    if (!active) {
        return null;
    }
    if (payload.length <= 0) {
        return null;
    }

    const { name, value } = payload[0];

    return (
        <div className={styles.customTooltip}>
            <p className={styles.customTooltipName}>
                {name}
            </p>
            <p className={styles.customTooltipValue}>
                {value}
            </p>
        </div>
    );
};

CustomTooltip.propTypes = {
    active: PropTypes.bool, // eslint-disable-line react/require-default-props
    // eslint-disable-next-line react/require-default-props
    payload: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

export default function DonutChart(props) {
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
        <div
            style={{
                width: '100%',
                height: 180,
            }}
        >
            <ResponsiveContainer>
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
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

DonutChart.propTypes = {
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    colorScheme: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
