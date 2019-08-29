import React from 'react';
import ReactDOM from 'react-dom';
import Confirm from '#rscv/Modal/Confirm';

const getUserConfirmation = (message: string, confirm: (result: boolean) => void) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const confirmWithCleanup = (result: boolean) => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
        confirm(result);
    };

    ReactDOM.render(
        <Confirm
            show
            onClose={confirmWithCleanup}
        >
            <p>{ message }</p>
        </Confirm>,
        container,
    );
};

export default getUserConfirmation;
