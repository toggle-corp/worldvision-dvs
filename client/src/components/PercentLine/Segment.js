import React, { PureComponent } from 'react';

import styles from './styles.scss';

export default class Segment extends PureComponent {
    render() {
        const { style } = this.props;

        return (
            <div
                className={styles.segment}
                style={style}
            />
        );
    }
}
