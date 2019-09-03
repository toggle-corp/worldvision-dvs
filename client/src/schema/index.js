import Dict from '@togglecorp/ravl';

const userDefinedSchemas = [];

{
    const name = 'projects';
    const schema = {
        doc: {
            name: 'Projects',
        },
        fields: {
            id: { type: 'uint', required: true },
        },
    };

    userDefinedSchemas.push({ name, schema });
}

const enableLogging = process.env.REACT_APP_RAVL_WARNING !== 'disable';

const dict = new Dict({
    warning: enableLogging,
});

userDefinedSchemas.forEach(({ name, schema }) => dict.put(name, schema));

export default dict;
