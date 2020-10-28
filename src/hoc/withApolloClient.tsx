import React from "react";
import App from "next/app";
import Head from "next/head";
import { NextComponentType } from "next";
import {
  ApolloProvider,
  ApolloClient,
  NormalizedCacheObject
} from "@apollo/client";
import { ClientConfig } from "../@types/with-client";
import { initOnContext, initApolloClient } from "../client/initApolloClient";

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {ClientConfig} [config]
 */
export const withApolloClient = (config: ClientConfig) => (
  PageComponent: NextComponentType
): any => {
  const { ssr = false, options } = config;

  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    let client: ApolloClient<NormalizedCacheObject>;
    if (apolloClient) {
      // Happens on: getDataFromTree & next.js ssr
      client = apolloClient;
    } else {
      // Happens on: next.js csr
      client = initApolloClient(apolloState, options, undefined);
    }

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";
    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx) => {
      const inAppContext = Boolean(ctx.ctx);
      const { apolloClient } = initOnContext(options, ctx);

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      } else if (inAppContext) {
        pageProps = await App.getInitialProps(ctx);
      }

      // Only on the server:
      if (typeof window === "undefined") {
        const { AppTree } = ctx;
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }

        // Only if dataFromTree is enabled
        if (ssr && AppTree) {
          try {
            // Import `@apollo/react-ssr` dynamically.
            // We don't want to have this in our client bundle.
            const { getDataFromTree } = await import(
              "@apollo/client/react/ssr"
            );

            // Since AppComponents and PageComponents have different context types
            // we need to modify their props a little.
            let props;
            if (inAppContext) {
              props = { ...pageProps, apolloClient };
            } else {
              props = { pageProps: { ...pageProps, apolloClient } };
            }

            // Take the Next.js AppTree, determine which queries are needed to render,
            // and fetch them. This method can be pretty slow since it renders
            // your entire AppTree once for every query. Check out apollo fragments
            // if you want to reduce the number of rerenders.
            // https://www.apollographql.com/docs/react/data/fragments/
            await getDataFromTree(<AppTree {...props} />);
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            // eslint-disable-next-line
            console.error("Error while running `getDataFromTree`", error);
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind();
        }
      }

      return {
        ...pageProps,
        // Extract query data from the Apollo store
        apolloState: apolloClient.cache.extract(),
        // Provide the client for ssr. As soon as this payload
        // gets JSON.stringified it will remove itself.
        apolloClient: ctx.apolloClient
      };
    };
  }

  return WithApollo;
};

export default withApolloClient;
