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
        if (data.name === 'pendingOverDue') {
            classNames.push(styles.red);
        } else {
            classNames.push(styles.green);
        }

        return ({
            title: data.name === 'pendingOverDue' ? 'Pending Overdue' : 'Pending Current',
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

        if (itemList.filter(i => i.value > 0).length > 0) {
            return (
                <div className={styles.tableWrapper}>
                    <div className={styles.header}>
                        {title}
                    </div>
                    <ListView
                        className={styles.table}
                        data={itemList}
                        rendererParams={this.rendererParams}
                        keySelector={CorrespondenceItem.keySelector}
                        renderer={KeyValue}
                    />
                </div>
            );
        }
        return null;
    }
}
