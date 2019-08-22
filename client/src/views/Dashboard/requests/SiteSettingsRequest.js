import { FgRestBuilder } from '#rsu/rest';

import {
    urlForSiteSettings,
    createParamsForGet,
} from '#rest';

export default class SiteSettingsRequest {
    constructor(params) {
        const {
            setSiteSettings,
            setState,
        } = params;

        this.setState = setState;
        this.setSiteSettings = setSiteSettings;
    }

    success = (response) => {
        this.setSiteSettings({ siteSettings: response });
    }

    create = () => {
        const request = new FgRestBuilder()
            .url(urlForSiteSettings)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ pendingSiteSettings: true });
            })
            .postLoad(() => {
                this.setState({ pendingSiteSettings: false });
            })
            .success(this.success)
            .build();

        return request;
    }
}
