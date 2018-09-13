import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import KeyValue from '#components/KeyValue';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

export default class CorrespondenceItem extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = d => d.name;

    rendererParams = (key, data) => {
        const classNames = [];
        if (data.type === 'bad') {
            classNames.push(styles.flashData);
        }

        return ({
            title: data.name,
            value: data.value,
            className: classNames.join(' '),
        });
    };

    render() {
        const {
            title,
            data,
        } = this.props;

        const keys = [
            'pendingCurrent',
            'pendingOverDue',
        ];

        const itemList = Object.keys(data).filter(d => (keys.indexOf(d) >= 0)).map(m => ({
            name: m,
            value: data[m],
        }));

        return (
            <div className={styles.tableWrapper}>
                <div className={styles.header}>
                    {title}
                </div>
                <ListView
                    className={styles.table}
                    data={itemList}
                    rendererParams={this.rendererParams}
                    keyExtractor={CorrespondenceItem.keySelector}
                    renderer={KeyValue}
                />
            </div>
        );
    }
}
