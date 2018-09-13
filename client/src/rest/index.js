import {
    GET,
    commonHeaderForGet,
    wsEndpoint,
} from '#config/rest';

export const urlForProjects = `${wsEndpoint}/projects/`;
export const urlForSummary = `${wsEndpoint}/projects-summary/`;

export const createParamsForGet = () => ({
    method: GET,
    headers: commonHeaderForGet,
});

export const createUrlForReport = projectId => (
    `${wsEndpoint}/projects-report/${projectId}`
);
