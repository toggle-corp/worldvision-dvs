import { createSelector } from 'reselect';

const emptyArray = [];
const emptyObject = {};

export const projectsSelector = ({ domainData }) => (
    domainData.projects || emptyArray
);

export const reportsSelector = ({ domainData }) => (
    domainData.reports || emptyObject
);

export const projectIdFromPropsSelector = (state, props) => props.projectId;

export const reportSelector = createSelector(
    reportsSelector,
    projectIdFromPropsSelector,
    (reports, projectIdFromProps) => (
        projectIdFromProps ?
            reports[projectIdFromProps] : emptyObject
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
