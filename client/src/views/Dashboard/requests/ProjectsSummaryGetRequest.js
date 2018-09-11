import {
    FgRestBuilder,
} from '#rsu/rest';

import {
    urlForSummary,
    createParamsForGet,
} from '#rest';

export default class ProjectsSummaryGetRequest {
    constructor(params) {
        const {
            setSummary,
            setState,
        } = params;

        this.setState = setState;
        this.setSummary = setSummary;
    }

    success = (response) => {
        this.setSummary({ summary: response });
    }

    create = () => {
        const request = new FgRestBuilder()
            .url(urlForSummary)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ summaryPending: true });
            })
            .postLoad(() => {
                this.setState({ summaryPending: false });
            })
            .success(this.success)
            .build();

        return request;
    }
}
