import { RestRequest } from '#rsu/rest';

export const GET = 'GET';

// ENDPOINTS

// export const wsEndpoint = 'http://localhost:8005/api/v1';
const {
    protocol,
    hostname,
} = window.location;
export const wsEndpoint = `${protocol}//${hostname}:8005/api/v1`;

// COMMON HEADERS - GET

export const commonHeaderForGet = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const p = RestRequest.prepareUrlParams;
