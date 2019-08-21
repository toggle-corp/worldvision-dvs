import turf from 'turf';

import update from '#rsu/immutable-update';

import createReducerWithMap from '../../../utils/createReducerWithMap';
import initialDomainData from '../../initial-state/domainData';

// TYPE

export const SET_PROJECTS = 'domainData/SET_PROJECTS';
export const SET_SITE_SETTINGS = 'domainData/SET_SITE_SETTINGS';
export const SET_SUMMARY = 'domainData/SET_SUMMARY';
export const SET_REPORT = 'domainData/SET_REPORT';
export const SET_SUMMARY_GROUPS = 'domainData/SET_SUMMARY_GROUPS';

// ACTION-CREATOR

export const setProjectsAction = ({ projects }) => ({
    type: SET_PROJECTS,
    projects,
});

export const setSummaryAction = ({ summary }) => ({
    type: SET_SUMMARY,
    summary,
});

export const setSiteSettingsAction = ({ siteSettings }) => ({
    type: SET_SITE_SETTINGS,
    siteSettings,
});

export const setReportAction = ({ projectId, report }) => ({
    type: SET_REPORT,
    projectId,
    report,
});

export const setSummaryGroupsAction = ({ summaryGroups }) => ({
    type: SET_SUMMARY_GROUPS,
    summaryGroups,
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

const setSummary = (state, action) => {
    const { summary } = action;

    const settings = {
        summary: { $set: summary },
    };

    return update(state, settings);
};

const setSiteSettings = (state, action) => {
    const { siteSettings } = action;

    const settings = {
        siteSettings: { $set: siteSettings },
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

const setSummaryGroups = (state, action) => {
    const { summaryGroups } = action;

    const settings = {
        summaryGroups: { $set: summaryGroups },
    };

    return update(state, settings);
};

const reducers = {
    [SET_PROJECTS]: setProject,
    [SET_REPORT]: setReport,
    [SET_SUMMARY]: setSummary,
    [SET_SITE_SETTINGS]: setSiteSettings,
    [SET_SUMMARY_GROUPS]: setSummaryGroups,
};


export default createReducerWithMap(reducers, initialDomainData);
