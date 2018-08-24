import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';


export default ({ className }) => (
    <nav className={`${className} ${styles.navbar}`}>
        World Vision DVS
    </nav>
);
