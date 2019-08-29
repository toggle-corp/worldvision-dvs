import React, { PureComponent } from 'react';

import styles from './styles.scss';

interface Props {
    style?: object;
}

export default class PercentLine extends PureComponent<Props> {
    public render() {
        const { style } = this.props;

        return (
            <div
                className={styles.segment}
                style={style}
            />
        );
    }
}
