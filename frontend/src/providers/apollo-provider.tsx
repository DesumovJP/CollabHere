"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { ReactNode, useMemo } from "react";

export default function ApolloProviderClient({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const uri = process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL || "http://localhost:1337/graphql";
    return new ApolloClient({
      link: new HttpLink({ uri }),
      cache: new InMemoryCache(),
      connectToDevTools: true,
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}


