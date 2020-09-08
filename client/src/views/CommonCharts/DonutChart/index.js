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
        donutChartHeight,
        donutChartWidth,
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
                width: donutChartWidth,
                height: donutChartHeight,
                marginBottom: 12,
            }}
        >
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={donutChartHeight / 2.75}
                        outerRadius={donutChartHeight / 2}
                        dataKey="value"
                    >
                        {data.map((d, index) => (
                            <Cell
                                key={d.key}
                                fill={colorScheme[index]}
                                className={styles.cell}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

DonutChart.defaultProps = {
    donutChartHeight: 180,
    donutChartWidth: '100%',
};

DonutChart.propTypes = {
    donutChartHeight: PropTypes.number,
    donutChartWidth: PropTypes.string,
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    colorScheme: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
