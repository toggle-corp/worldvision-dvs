import { createSelector } from 'reselect';

const emptyArray = [];
const emptyObject = {};

export const projectsSelector = ({ domainData }) => (
    domainData.projects || emptyArray
);

export const regionsSelector = ({ domainData }) => (
    domainData.regions || emptyObject
);

export const selectedProjectSelector = ({ domainData }) => domainData.selectedProject;
export const projectIdFromPropsSelector = (state, props) => props.projectId;

export const regionSelector = createSelector(
    regionsSelector,
    projectIdFromPropsSelector,
    selectedProjectSelector,
    (regions, projectIdFromProps, projectId) => (
        projectIdFromProps ?
            regions[projectIdFromProps] :
            regions[projectId] || emptyObject
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
