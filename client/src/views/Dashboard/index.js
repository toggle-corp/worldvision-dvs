import React, {
    PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import GeoReferencedMap from '#rscz/GeoReferencedMap';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    projectsSelector,
    setProjectsAction,
} from '#redux';

import styles from './styles.scss';
import ProjectsGetRequest from './requests/ProjectsGetRequest';

const propTypes = {
    projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setProjects: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    projects: projectsSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setProjects: params => dispatch(setProjectsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Dashboard extends PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            projectsGetPending: false,
        };

        this.projectsRequest = new ProjectsGetRequest({
            setState: params => this.setState(params),
            setProjects: this.props.setProjects,
        }).create();
    }
    componentDidMount() {
        this.projectsRequest.start();
    }


    componentWillUnmount() {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
    }

    render() {
        const {
            projects,
        } = this.props;

        const {
            projectsGetPending,
        } = this.state;

        return (
            <div className={styles.dashboard}>
                { projectsGetPending && <LoadingAnimation /> }
                <GeoReferencedMap />
            </div>
        );
    }
}
