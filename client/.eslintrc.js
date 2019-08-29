module.exports = {
    'extends': [
        'airbnb',
        'plugin:css-modules/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'env': {
        'browser': true,
        'jest': true,
    },
    'plugins': [
        'react',
        'import',
        'css-modules',
        '@typescript-eslint',
    ],
    'settings': {
        'import/resolver': {
            'babel-module': {
                'root': ['.'],
                'extensions': ['.js', '.jsx', '.ts', '.tsx'],
                'alias': {
                    '#components': './src/components',
                    '#config': './src/config',
                    '#constants': './src/constants',
                    '#notify': './src/notify',
                    '#actionCreators': './src/store/actionCreators',
                    '#selectors': './src/store/selectors',
                    '#request': './src/request',
                    '#resources': './src/resources',
                    '#schema': './src/schema',
                    '#store': './src/store',
                    '#ts': './src/ts',
                    '#utils': './src/utils',
                    '#rsca': './src/vendor/react-store/components/Action',
                    '#rscg': './src/vendor/react-store/components/General',
                    '#rsci': './src/vendor/react-store/components/Input',
                    '#rscv': './src/vendor/react-store/components/View',
                    '#rscz': './src/vendor/react-store/components/Visualization',
                    '#rsk': './src/vendor/react-store/constants',
                    '#rsu': './src/vendor/react-store/utils',
                    '#views': './src/views',
                    '#redux': './src/redux',
                    '#rest': './src/rest',
                },
            },
        },
        'react': {
            'version': 'detect',
        },
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 2018,
        'ecmaFeatures': {
            'jsx': true,
        },
        'sourceType': 'module',
        'allowImportExportEverywhere': true,
    },
    'rules': {
        'strict': 0,
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-unused-vars': [1, { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
        'no-console': 0,

        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/jsx-filename-extension': ['error', {'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
        'react/prop-types': [1, { 'ignore': [], 'customValidators': [], 'skipUndeclared': false }],
        'react/forbid-prop-types': [1],
        'react/destructuring-assignment': [1, "always", { "ignoreClassFields": true }],
        'react/sort-comp': [1, {
            order: [
                'static-methods',
                'constructor',
                'lifecycle',
                'everything-else',
                'render',
            ],
        }],

        'jsx-a11y/anchor-is-valid': [ 'error', {
            'components': [ 'Link' ],
            'specialLink': [ 'to' ],
        }],

        'import/extensions': ['off', 'never'],
        'import/no-extraneous-dependencies': ['error', {'devDependencies': true }],

        'css-modules/no-unused-class': [1, { 'camelCase': true }],
        'css-modules/no-undef-class': [1, { 'camelCase': true }],

        'prefer-destructuring': 'warn',
        'function-paren-newline': ['warn', 'consistent'],
        'object-curly-newline': [2, {
            'ObjectExpression': { 'consistent': true },
            'ObjectPattern': { 'consistent': true },
            'ImportDeclaration': { 'consistent': true },
            'ExportDeclaration': { 'consistent': true },
        }],

        'jsx-a11y/label-has-for': 'warn',

        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/explicit-function-return-type': 0,


        'react/no-unused-state': 'warn',
        'react/default-props-match-prop-types': ['warn', {
            'allowRequiredDefaults': true,
        }],
    },
};
