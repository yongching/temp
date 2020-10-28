import { AppContext } from "next/app";
import { WebSocketParams } from "@apollo/client/link/ws";

/**
 * @param  {Function} [onConnected] optional
 * @param  {Function} [onReconnected] optional
 * @param  {Function} [onReconnecting] optional
 * @param  {Function} [onDisconnected] optional
 * @param  {Function} [onError] optional
 */
export type SocketEvents = {
  onConnected(): void;
  onReconnected(): void;
  onReconnecting(): void;
  onDisconnected(): void;
  onError(): void;
};

/**
 * Creates and configures the ApolloClient
 * @param  {Function(context)} [getAuthToken] compulsory
 * @param  {Object} [graphqlRequest]
 * @param  {String} [graphqlRequest.uri]
 * @param  {String} [graphqlRequest.credentials]
 * @param  {Object} [websocketRequest] optional (for subscription)
 * @param  {Object} [resolvers] optional
 * @param  {Object} [resolvers.resolvers] optional
 * @param  {Object} [resolvers.defaults] optional
 * @param  {Object} [typeDefs] optional
 * @param  {Boolean} [connectToDevTools]
 * @param  {SocketEvents} [websocketEvents] optional
 */
export type ClientOptions = {
  getAuthToken(context: AppContext): string | null;
  graphqlRequest: {
    uri: string;
    credentials: string;
  };
  websocketRequest?: WebSocketParams;
  resolvers?: any;
  typeDefs?: any;
  defaults?: any;
  connectToDevTools: boolean;
  websocketEvents?: SocketEvents;
};

/**
 * @param  {boolean} [ssr]
 * @param  {ClientOptions} [options] optional
 */
export type ClientConfig = {
  ssr: boolean;
  options: ClientOptions;
};
