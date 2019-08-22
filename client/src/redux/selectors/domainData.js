import { createSelector } from 'reselect';

const emptyArray = [];
const emptyObject = {};

export const projectsSelector = ({ domainData }) => (
    domainData.projects || emptyArray
);

export const summarySelector = ({ domainData }) => (
    domainData.summary || emptyObject
);

export const pointsSelector = ({ domainData }) => (
    domainData.points || emptyArray
);

export const rcDataSelector = ({ domainData }) => (
    domainData.rcData || emptyArray
);

export const siteSettingsSelector = ({ domainData }) => (
    domainData.siteSettings || emptyArray
);

export const reportsSelector = ({ domainData }) => (
    domainData.reports || emptyObject
);

export const summaryGroupsSelector = ({ domainData }) => (
    domainData.summaryGroups || emptyArray
);

export const projectIdFromPropsSelector = (state, props) => props.projectId;

export const reportSelector = createSelector(
    reportsSelector,
    projectIdFromPropsSelector,
    (reports, projectIdFromProps) => (
        projectIdFromProps
            ? reports[projectIdFromProps]
            : emptyObject
    ),
);

/*
   export const regionSelector = createSelector(
   regionsSelector,
   projectIdSelector,
   (regions, projectId) => (
   regionsSelector[projectId] || emptyObject
   ),
   );
 */
