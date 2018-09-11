import PropTypes from 'prop-types';
import React from 'react';

import logo from '#resources/images/logo.png';
import styles from './styles.scss';


export default ({ className }) => (
    <nav className={`${className} ${styles.navbar}`}>
        <header className={styles.header} >
            <img
                src={logo}
                className={styles.logo}
                alt=""
            />
            <span>
                Sponsorship Management Report
            </span>
        </header>
    </nav>
);
