import {
    GET,
    commonHeaderForGet,
    wsEndpoint,
} from '#config/rest';

export const urlForProjects = `${wsEndpoint}/projects/`;
export const urlForSummary = `${wsEndpoint}/projects-summary/`;
export const urlForSiteSettings = `${wsEndpoint}/site-settings/`;
export const urlForSummaryGroups = `${wsEndpoint}/summary-groups/`;

export const createParamsForGet = () => ({
    method: GET,
    headers: commonHeaderForGet,
});

export const createUrlForReport = projectId => (
    `${wsEndpoint}/projects-report/${projectId}/`
);
