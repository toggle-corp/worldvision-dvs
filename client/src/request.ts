import {
    createRequestCoordinator,
    methods,
    CoordinatorAttributes,
} from '@togglecorp/react-rest-request';

import schema from '#schema';
import { sanitizeResponse } from '#utils/common';

const wsEndpoint = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:8005/api/v1';

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
