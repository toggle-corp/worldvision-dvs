import {
    createRequestCoordinator,
    methods,
    CoordinatorAttributes,
} from '@togglecorp/react-rest-request';

import schema from '#schema';
import { sanitizeResponse } from '#utils/common';

const {
    protocol,
    hostname,
} = window.location;
export const wsEndpoint = `${protocol}//${hostname}:8005/api/v1`;

export function createConnectedRequestCoordinator<OwnProps>() {
    type Props = OwnProps;

    const requestor = createRequestCoordinator({
        transformParams: (data: CoordinatorAttributes) => {
            const {
                body,
                method,
            } = data;
            return {
                method: method || methods.GET,
                body: JSON.stringify(body),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json; charset=utf-8',
                },
            };
        },
        transformProps: (props: Props) => props,

        transformUrl: (url: string) => {
            if (/^https?:\/\//i.test(url)) {
                return url;
            }

            return `${wsEndpoint}${url}`;
        },

        transformResponse: (body: object, request: CoordinatorAttributes) => {
            const {
                url,
                method,
                extras: requestOptions,
            } = request;
            const sanitizedResponse = sanitizeResponse(body);
            const extras = requestOptions as { schemaName?: string };

            if (!extras || extras.schemaName === undefined) {
                // NOTE: usually there is no response body for DELETE
                if (method !== methods.DELETE) {
                    console.error(`Schema is not defined for ${url} ${method}`);
                }
            } else {
                try {
                    schema.validate(sanitizedResponse, extras.schemaName);
                } catch (e) {
                    console.error(url, method, sanitizedResponse, e.message);
                    throw (e);
                }
            }

            return sanitizedResponse;
        },

        transformErrors: (response: { errors: string[] }) => {
            const faramErrors = response.errors;
            return {
                response,
                faramErrors,
            };
        },
    });

    return requestor;
}

export * from '@togglecorp/react-rest-request';
