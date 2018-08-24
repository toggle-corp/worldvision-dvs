import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import getUserConfirmation from '#utils/getUserConfirmation';
import Multiplexer from './Multiplexer';


export default () => (
    <BrowserRouter getUserConfirmation={getUserConfirmation}>
        <Multiplexer />
    </BrowserRouter>
);
