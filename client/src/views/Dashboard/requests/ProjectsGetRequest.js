import { FgRestBuilder } from '#rsu/rest';

import {
    urlForProjects,
    createParamsForGet,
} from '#rest';

export default class ProjectsGetRequest {
    constructor(params) {
        const {
            setProjects,
            setState,
        } = params;

        this.setState = setState;
        this.setProjects = setProjects;
    }

    success = (response) => {
        this.setProjects({ projects: response });
    }

    create = () => {
        const request = new FgRestBuilder()
            .url(urlForProjects)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ projectsGetPending: true });
            })
            .postLoad(() => {
                this.setState({ projectsGetPending: false });
            })
            .success(this.success)
            .build();

        return request;
    }
}
