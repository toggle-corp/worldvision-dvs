import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import styles from './sunburstStyles.scss';

const getSunBurstData = (dataObject) => {
    const centerPieData = [{
        key: dataObject.key,
        name: dataObject.name,
        size: dataObject.size,
    }];

    const firstLevelData = [];
    const secondLevelData = [];

    dataObject.children.forEach(({
        key,
        name,
        size,
        children,
    }) => {
        firstLevelData.push({
            key,
            name,
            size,
        });

        secondLevelData.push(children.map(
            child => ({
                ...child,
                firstLevelKey: key,
            }),
        ));
    });

    return {
        centerPieData,
        firstLevelData,
        secondLevelData: secondLevelData.flat(),
    };
};

const getFilteredData = (newlevel, newKey, dataValue) => {
    if (newlevel === 'first') {
        const filteredata = dataValue.children.filter(dvc => dvc.key === newKey);
        return {
            centerPieData: [{
                key: dataValue.key,
                name: dataValue.name,
                size: dataValue.size,
            }],
            firstLevelData: [{
                key: filteredata[0].key,
                name: filteredata[0].name,
                size: filteredata[0].size,
            }],
            secondLevelData: filteredata[0].children,
        };
    }
    if (newlevel === 'second') {
        const tempData = getSunBurstData(dataValue);

        const slData = tempData.secondLevelData.find(fld => fld.key === newKey);

        const flData = tempData.firstLevelData.filter(fld => fld.key === slData.firstLevelKey);

        return {
            centerPieData: [],
            firstLevelData: flData,
            secondLevelData: [slData],
        };
    }
    return getSunBurstData(dataValue);
};

const getCellColor = (dataKey, colorSchemeValue) => {
    if (dataKey.includes('Primary')) {
        return colorSchemeValue[0];
    }
    return colorSchemeValue[1];
};

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
            <p>
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

export default function SunBurst(props) {
    const {
        data,
        colorScheme,
    } = props;

    const [level, setLevel] = useState('zero');
    const [key, setKey] = useState('');

    const updateFilterParams = (levelParam, keyParam) => {
        setLevel(levelParam);
        setKey(keyParam);
    };

    const {
        centerPieData,
        firstLevelData,
        secondLevelData,
    } = useMemo(
        () => getFilteredData(level, key, data),
        [level, key, data],
    );

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <PieChart>
                {
                    centerPieData && (
                        <Pie
                            data={centerPieData}
                            dataKey="size"
                            outerRadius={30}
                        >
                            {
                                firstLevelData.map(d => (
                                    <Cell
                                        key={d.key}
                                        fill="#a6cee3"
                                        onClick={() => updateFilterParams('zero', '')}
                                        className={styles.sunburstCell}
                                    />
                                ))
                            }
                        </Pie>
                    )
                }
                {
                    firstLevelData && (
                        <Pie
                            data={firstLevelData}
                            dataKey="size"
                            innerRadius={centerPieData.length > 0 ? 32 : 0}
                            outerRadius={centerPieData.length > 0 ? 60 : 40}
                        >
                            {
                                firstLevelData.map(d => (
                                    <Cell
                                        key={d.key}
                                        fill={getCellColor(d.key, colorScheme)}
                                        onClick={() => updateFilterParams('first', d.key)}
                                        className={styles.sunburstCell}
                                    />
                                ))
                            }
                        </Pie>

                    )
                }
                {
                    secondLevelData && (
                        <Pie
                            data={secondLevelData}
                            dataKey="size"
                            innerRadius={centerPieData.length > 0 ? 62 : 42}
                            outerRadius={90}
                        >
                            {
                                secondLevelData.map(d => (
                                    <Cell
                                        key={d.key}
                                        fill={getCellColor(d.key, colorScheme)}
                                        onClick={() => updateFilterParams('second', d.key)}
                                        className={styles.sunburstCell}
                                    />
                                ))
                            }
                        </Pie>
                    )
                }
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

SunBurst.propTypes = {
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    colorScheme: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
