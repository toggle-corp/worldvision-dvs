import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import logo from '#resources/images/logo.png';

import styles from './styles.scss';

const setHashToBrowser = (hash) => { window.location.hash = hash; };

const handleGoBack = () => {
    setHashToBrowser('/');
};

const Navbar = ({ className }) => (
    <nav className={_cs(className, styles.navbar)}>
        <header className={styles.header}>
            <button
                className={styles.button}
                onClick={handleGoBack}
                type="button"
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

Navbar.propTypes = {
    className: PropTypes.string,
};

Navbar.defaultProps = {
    className: undefined,
};

export default Navbar;
