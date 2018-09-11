import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    className: PropTypes.string,
    summary: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projects: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    summary: {},
    projects: [],
};

export default class Dashboard extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            summary,
            projects,
        } = this.props;

        console.warn(summary);
        return (
            <div className={className}>
                {summary.reportDate}
            </div>
        );
    }
}
