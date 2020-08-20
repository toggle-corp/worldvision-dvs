/* eslint-disable linebreak-style */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-array-index-key */
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';

import styles from './styles.scss';

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
        secondLevelData.push(children.flat());
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
        return {
            centerPieData: [],
            firstLevelData: tempData.firstLevelData.filter(fld => newKey.includes(fld.key)),
            secondLevelData: tempData.secondLevelData.filter(fld => fld.key === newKey),
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
    if (active) {
        return (
            <div className={styles.customTooltip}>
                <p>
                    {/* eslint-disable-next-line react/prop-types */}
                    {payload[0].name}
                </p>
                <p className={styles.customTooltipValue}>
                    {/* eslint-disable-next-line react/prop-types */}
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool.isRequired,
    payload: PropTypes.array.isRequired,
};

export default function SunBurst(props) {
    const {
        data,
        colorScheme,
    } = props;

    const [level, setLevel] = useState('zero');
    const [key, setKey] = useState('');

    const updateFilterParams = useCallback(
        (levelParam, keyParam) => {
            setLevel(levelParam);
            setKey(keyParam);
        },
        [setKey, setLevel],
    );

    const {
        centerPieData,
        firstLevelData,
        secondLevelData,
    } = useMemo(
        () => getFilteredData(level, key, data),
        [level, key, data],
    );

    return (
        <PieChart
            width={400}
            height={400}
        >
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
    );
}

SunBurst.propTypes = {
    data: PropTypes.array.isRequired,
    colorScheme: PropTypes.array.isRequired,
};
