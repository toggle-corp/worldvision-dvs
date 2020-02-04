import {
    isFalsy,
} from '@togglecorp/fujs';

// eslint-disable-next-line import/prefer-default-export
export const transformSoi = (soiData) => {
    if (isFalsy(soiData)) {
        return [];
    }

    const total = soiData.find(v => v.key === 'total_closed').value;
    const closed = soiData.find(v => v.key === 'closed_on').value;
    const percent = (closed / total) * 100;

    return ([
        ...soiData,
        {
            key: 'percent',
            value: percent || 0,
            label: 'SOI Rating',
        },
    ]);
};
