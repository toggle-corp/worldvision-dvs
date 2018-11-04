import PropTypes from 'prop-types';
import React from 'react';

import logo from '#resources/images/logo.png';
import styles from './styles.scss';


const setHashToBrowser = (hash) => { window.location.hash = hash; };

const handleGoBack = () => {
    setHashToBrowser('/');
};

export default ({ className }) => (
    <nav className={`${className} ${styles.navbar}`}>
        <header className={styles.header} >
            <button
                className={styles.button}
                onClick={handleGoBack}
            >
                WVIN - Sponsorship
            </button>
            <img
                src={logo}
                className={styles.logo}
                alt=""
            />
        </header>
    </nav>
);
