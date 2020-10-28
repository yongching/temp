import get from "lodash/get";
import isNil from "lodash/isNil";
import isEmpty from "lodash/isEmpty";
import { ApolloClient, HttpLink, ApolloLink } from "@apollo/client";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client/cache";
import { onError } from "@apollo/client/link/error";
import { WebSocketLink } from "@apollo/client/link/ws";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { ClientOptions, SocketEvents } from "../@types/with-client";
import { getCookie } from "../helpers/cookies";
import { NextContextPayload } from "../@types";

/**
 * Apply websocket events
 * @param {SubscriptionClient} wsClient
 * @param {Object} listeners
 * @param  {Function} [listeners.onConnected] optional
 * @param  {Function} [listeners.onReconnected] optional
 * @param  {Function} [listeners.onReconnecting] optional
 * @param  {Function} [listeners.onDisconnected] optional
 * @param  {Function} [listeners.onError] optional
 */
const registerWebsocketEvents = (
  wsClient: SubscriptionClient,
  listeners: SocketEvents
): void => {
  if (!wsClient) return;
  if (isNil(listeners) || isEmpty(listeners)) return;

  if (listeners.onConnected) {
    wsClient.onConnected(listeners.onConnected);
  }
  if (listeners.onReconnected) {
    wsClient.onReconnected(listeners.onReconnected);
  }
  if (listeners.onReconnecting) {
    wsClient.onReconnecting(listeners.onReconnecting);
  }
  if (listeners.onDisconnected) {
    wsClient.onDisconnected(listeners.onDisconnected);
  }
  if (listeners.onError) {
    wsClient.onError(listeners.onError);
  }
};

export function createApolloClient(
  initialState: any = {},
  options: ClientOptions,
  context: NextContextPayload
): ApolloClient<NormalizedCacheObject> {
  const {
    getAuthToken,
    resolvers = {},
    typeDefs = {},
    websocketRequest
  } = options;

  // method to retrieve auth token
  const retrieveAuthToken = (ctx: any): string | null => {
    return getAuthToken ? getAuthToken(ctx) : getCookie("token", ctx);
  };

  const ssrMode = typeof window === "undefined";

  // ===== create auth link
  const authLink = setContext((_, { headers }) => {
    const token = retrieveAuthToken(context);
    const authprops = token ? { authorization: `Bearer ${token}` } : {};
    // attach authorization token to headers
    return {
      headers: {
        ...headers,
        ...authprops
      }
    };
  });

  // ===== create htttp link
  const httpLink = new HttpLink(options.graphqlRequest);

  // ===== error link
  const onErrorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        // eslint-disable-next-line
        console.log(
          `[GraphQL error]: Message: `,
          message,
          " Location: ",
          locations,
          "Path: ",
          path
        )
      );
    }
    // eslint-disable-next-line
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  let link = ApolloLink.from([onErrorLink, authLink, httpLink]);

  if (!ssrMode && !isNil(websocketRequest) && !isEmpty(websocketRequest)) {
    // refer to subscription setup https://www.apollographql.com/docs/react/data/subscriptions/
    const authToken = retrieveAuthToken(context);
    // create websocket subscription client
    const wsClient = new SubscriptionClient(websocketRequest.uri, {
      ...websocketRequest.options,
      connectionParams() {
        return {
          headers: {
            authorization: authToken ? `Bearer ${authToken}` : ""
          }
        };
      }
    });
    // apply websocket events with options
    registerWebsocketEvents(wsClient, get(options, "websocketEvents"));
    // use SubscriptionClient interface
    const wsLink = new WebSocketLink(wsClient);
    link = ApolloLink.split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      link
    );
  }

  const cache = new InMemoryCache().restore(initialState);
  const client = new ApolloClient({
    ssrMode, // Disables forceFetch on the server (so queries are only run once)
    connectToDevTools: options.connectToDevTools || false,
    cache,
    link,
    typeDefs,
    resolvers
  });

  return client;
}

export default createApolloClient;
