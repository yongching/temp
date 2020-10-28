import fetch from "isomorphic-unfetch";
import { ApolloClient } from "@apollo/client";
import { NormalizedCacheObject } from "@apollo/client/cache";
import { createApolloClient } from "./createApolloClient";
import { ClientOptions } from "../@types/with-client";
import { NextContextPayload } from "../@types";

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

// On the client, we store the Apollo Client in the following variable.
// This prevents the client from reinitializing between page transitions.
let globalApolloClient: ApolloClient<NormalizedCacheObject> = null;

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {NormalizedCacheObject} initialState
 * @param  {NextPageContext} ctx
 */
export const initApolloClient = (
  initialState: any,
  options: ClientOptions,
  ctx: NextContextPayload
): ApolloClient<NormalizedCacheObject> => {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(initialState, options, ctx);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState, options, ctx);
  }

  return globalApolloClient;
};

/**
 * Installs the Apollo Client on NextPageContext
 * or NextAppContext. Useful if you want to use apolloClient
 * inside getStaticProps, getStaticPaths or getServerSideProps
 * @param {NextPageContext | NextAppContext} ctx
 */
export const initOnContext = (
  options: ClientOptions,
  ctx: NextContextPayload
): any => {
  const inAppContext = Boolean(ctx.ctx);

  // We consider installing `withApollo({ ssr: true })` on global App level
  // as antipattern since it disables project wide Automatic Static Optimization.
  if (process.env.NODE_ENV === "development") {
    if (inAppContext) {
      // eslint-disable-next-line
      console.warn(
        "Warning: You have opted-out of Automatic Static Optimization due to `withApollo` in `pages/_app`.\n" +
          "Read more: https://err.sh/next.js/opt-out-auto-static-optimization\n"
      );
    }
  }

  // Initialize ApolloClient if not already done
  const apolloClient =
    ctx.apolloClient ||
    initApolloClient(
      ctx.apolloState || {},
      options,
      inAppContext ? ctx.ctx : ctx
    );

  // We send the Apollo Client as a prop to the component to avoid calling initApollo() twice in the server.
  // Otherwise, the component would have to call initApollo() again but this
  // time without the context. Once that happens, the following code will make sure we send
  // the prop as `null` to the browser.
  apolloClient.toJSON = () => null;

  // Add apolloClient to NextPageContext & NextAppContext.
  // This allows us to consume the apolloClient inside our
  // custom `getInitialProps({ apolloClient })`.
  ctx.apolloClient = apolloClient;
  if (inAppContext) {
    ctx.ctx.apolloClient = apolloClient;
  }

  return ctx;
};

export default initOnContext;
