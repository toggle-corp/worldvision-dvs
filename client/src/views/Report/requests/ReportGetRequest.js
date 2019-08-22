import { FgRestBuilder } from '#rsu/rest';

import {
    createUrlForReport,
    createParamsForGet,
} from '#rest';

export default class ReportGetRequest {
    constructor(params) {
        const {
            setReport,
            setState,
        } = params;

        this.setState = setState;
        this.setReport = setReport;
    }

    success = projectId => (response) => {
        this.setReport({ projectId, report: response });
    }

    create = (projectId) => {
        const request = new FgRestBuilder()
            .url(createUrlForReport(projectId))
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ reportGetPending: true });
            })
            .postLoad(() => {
                this.setState({ reportGetPending: false });
            })
            .success(this.success(projectId))
            .build();

        return request;
    }
}
