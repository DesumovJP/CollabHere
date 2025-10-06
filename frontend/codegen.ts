import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: 'http://localhost:1337/graphql',
    documents: [
        'src/graphql/queries/**/*.ts',
        'src/graphql/mutations/**/*.ts',
    ],
    ignoreNoDocuments: true,
    generates: {
        'src/graphql/gql.ts': {  // Fixed: No extra nesting
            plugins: [
                'typescript',
                'typescript-operations',
            ],
        },
        './graphql.schema.json': {
            plugins: ['introspection'],
        },
    },
};

export default config;