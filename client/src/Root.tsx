import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import { addIcon } from '#rscg/Icon';
import {
    iconNames,
    svgPaths,
    imagePaths,
    styleProperties,
} from '#constants';
import { initializeStyles } from '#rsu/styles';

import store from '#store';
import App from './App';

interface State {
    rehydrated: boolean;
}

interface Props {
}

// Add icons
Object.keys(iconNames).forEach((key) => {
    const myKey = key as keyof (typeof iconNames);
    addIcon('font', key, iconNames[myKey]);
});

Object.keys(svgPaths).forEach((key) => {
    const myKey = key as keyof (typeof svgPaths);
    addIcon('svg', key, svgPaths[myKey]);
});

Object.keys(imagePaths).forEach((key) => {
    const myKey = key as keyof (typeof imagePaths);
    addIcon('image', key, imagePaths[myKey]);
});

export default class Root extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = { rehydrated: false };

        initializeStyles({
            ...styleProperties.colors,
            ...styleProperties.dimens,
        });

        console.info('React version:', React.version);
    }

    public componentDidMount() {
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        // NOTE: We can also use PersistGate instead of callback to wait for rehydration
        persistStore(this.store, undefined, afterRehydrateCallback);
    }

    private store = store;

    public render() {
        const { rehydrated } = this.state;

        if (!rehydrated) {
            // NOTE: showing empty div, this lasts for a fraction of a second
            return <div />;
        }

        return (
            <Provider store={this.store}>
                <App />
            </Provider>
        );
    }
}
