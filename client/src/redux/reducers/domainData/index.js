import update from '#rsu/immutable-update';
import createReducerWithMap from '../../../utils/createReducerWithMap';
import initialDomainData from '../../initial-state/domainData';

// TYPE

export const SET_PROJECTS = 'domainData/SET_PROJECTS';
export const SET_REPORT = 'domainData/SET_REPORT';

// ACTION-CREATOR

export const setProjectsAction = ({ projects }) => ({
    type: SET_PROJECTS,
    projects,
});

export const setReportAction = ({ projectId, report }) => ({
    type: SET_REPORT,
    projectId,
    report,
});

// REDUCER

const setProject = (state, action) => {
    const { projects } = action;

    const settings = {
        projects: { $set: projects },
    };

    return update(state, settings);
};

const setReport = (state, action) => {
    const {
        projectId,
        report,
    } = action;

    const settings = {
        reports: { $auto: {
            [projectId]: { $set: report },
        } },
    };

    return update(state, settings);
};

const reducers = {
    [SET_PROJECTS]: setProject,
    [SET_REPORT]: setReport,
};


export default createReducerWithMap(reducers, initialDomainData);
