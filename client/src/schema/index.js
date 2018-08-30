import dict from '#ravl/schema';
import attachValidator from '#ravl/attachValidator';

attachValidator(dict);

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

userDefinedSchemas.forEach(({ name, schema }) => dict.put(name, schema));

export default dict;
