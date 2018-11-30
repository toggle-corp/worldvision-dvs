import {
    FgRestBuilder,
} from '#rsu/rest';

import {
    urlForSummaryGroups,
    createParamsForGet,
} from '#rest';

export default class SummaryGroupsGetRequest {
    constructor(params) {
        const {
            setSummaryGroups,
            setState,
        } = params;

        this.setState = setState;
        this.setSummaryGroups = setSummaryGroups;
    }

    success = (response) => {
        this.setSummaryGroups({ summaryGroups: response });
    }

    create = () => {
        const request = new FgRestBuilder()
            .url(urlForSummaryGroups)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ summaryGroupsPending: true });
            })
            .postLoad(() => {
                this.setState({ summaryGroupsPending: false });
            })
            .success(this.success)
            .build();

        return request;
    }
}
