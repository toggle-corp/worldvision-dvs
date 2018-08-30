import {
    GET,
    commonHeaderForGet,
    wsEndpoint,
} from '#config/rest';

export const urlForProjects = `${wsEndpoint}/projects/`;

export const urlForReports = `${wsEndpoint}/reports/`;

export const createParamsForGet = () => ({
    method: GET,
    headers: commonHeaderForGet,
});
