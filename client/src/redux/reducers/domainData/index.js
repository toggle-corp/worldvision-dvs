import update from '#rsu/immutable-update';
import turf from 'turf';

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
    const { projects = [] } = action;

    const points = projects.map(project => turf.point(
        [project.long, project.lat],
        {
            name: project.name,
            id: project.id,
        },
    ));

    const pointFeatures = turf.featureCollection(points);

    const rcData = projects.map((project) => {
        const {
            planned,
            sponsered,
            available,
        } = project.rcData;

        const actual = sponsered + available;
        const rc = Math.min(actual, planned);
        const difference = Math.abs(actual - planned);
        const variance = difference / planned;

        return {
            project: project.name,
            variance,
            rc,
            difference,
            rcLabel: (actual > planned) ? 'Planned RC' : 'Actual RC',
            differenceLabel: (actual > planned) ? 'Exceeded RC' : 'Remaining RC',
        };
    });

    const settings = {
        projects: { $set: projects },
        points: { $set: pointFeatures },
        rcData: { $set: rcData },
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
