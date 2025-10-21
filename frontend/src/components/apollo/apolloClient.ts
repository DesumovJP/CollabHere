//RSC Apollo Client

import { HttpLink } from "@apollo/client";
import {
    registerApolloClient,
    ApolloClient,
    InMemoryCache,
} from "@apollo/client-integration-nextjs";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
    const uri = `${process.env.STRAPI_LOCAL_URL}/graphql`
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
            // this needs to be an absolute url, as relative urls cannot be used in SSR
            uri,
            fetchOptions: {
                // you can pass additional options that should be passed to `fetch` here,
                // e.g. Next.js-related `fetch` options regarding caching and revalidation
                // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
            },
            headers: {
                // Add authentication header if token exists
                ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                })
            },
            fetch: (uri, options) => {
                // Add token to fetch request if available
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers = {
                    ...options?.headers,
                    ...(token && { 'Authorization': `Bearer ${token}` })
                };
                return fetch(uri, { ...options, headers });
            }
        }),
    });
});