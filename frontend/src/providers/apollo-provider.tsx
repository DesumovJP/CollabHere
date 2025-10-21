"use client";

import { ApolloClient, HttpLink, InMemoryCache, ApolloLink, concat } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { ReactNode, useMemo } from "react";
import { useAuth } from "./auth-provider";

export default function ApolloProviderClient({ children }: { children: ReactNode }) {
  const { jwt } = useAuth?.() || { jwt: null } as any; // in case used outside, but it's inside AuthProvider
  const client = useMemo(() => {
    const uri = process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL || "http://localhost:1337/graphql";
    const httpLink = new HttpLink({ uri });
    const authLink = new ApolloLink((operation, forward) => {
      if (jwt) {
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, Authorization: `Bearer ${jwt}` }
        }));
      }
      return forward(operation);
    });
    return new ApolloClient({
      link: concat(authLink, httpLink),
      cache: new InMemoryCache(),
      connectToDevTools: true,
    });
  }, [jwt]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
