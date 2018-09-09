import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';


export default ({ className }) => (
    <nav className={`${className} ${styles.navbar}`}>
        <header className={styles.header} >
            World Vision DVS
        </header>
    </nav>
);
