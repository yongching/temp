"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApolloClient = void 0;
const get_1 = __importDefault(require("lodash/get"));
const isNil_1 = __importDefault(require("lodash/isNil"));
const isEmpty_1 = __importDefault(require("lodash/isEmpty"));
const client_1 = require("@apollo/client");
const cache_1 = require("@apollo/client/cache");
const error_1 = require("@apollo/client/link/error");
const ws_1 = require("@apollo/client/link/ws");
const context_1 = require("@apollo/client/link/context");
const utilities_1 = require("@apollo/client/utilities");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const apollo_upload_client_1 = require("apollo-upload-client");
const cookies_1 = require("../helpers/cookies");
const registerWebsocketEvents = (wsClient, listeners) => {
    if (!wsClient)
        return;
    if (isNil_1.default(listeners) || isEmpty_1.default(listeners))
        return;
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
function createApolloClient(initialState = {}, options, context) {
    const { getAuthToken, resolvers = {}, typeDefs = {}, websocketRequest } = options;
    const retrieveAuthToken = (ctx) => __awaiter(this, void 0, void 0, function* () {
        return getAuthToken ? getAuthToken(ctx) : cookies_1.getCookie("token", ctx);
    });
    const ssrMode = typeof window === "undefined";
    const authLink = context_1.setContext((_, { headers }) => __awaiter(this, void 0, void 0, function* () {
        const token = yield retrieveAuthToken(context);
        const authprops = token ? { authorization: `Bearer ${token}` } : {};
        return {
            headers: Object.assign(Object.assign({}, headers), authprops)
        };
    }));
    const httpLink = new client_1.HttpLink(options.graphqlRequest);
    const onErrorLink = error_1.onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.map(({ message, locations, path }) => console.log(`[GraphQL error]: Message: `, message, " Location: ", locations, "Path: ", path));
        }
        if (networkError)
            console.log(`[Network error]: ${networkError}`);
    });
    const uploadLink = apollo_upload_client_1.createUploadLink(options.graphqlRequest);
    let link = client_1.ApolloLink.from([onErrorLink, authLink, uploadLink, httpLink]);
    if (!ssrMode && !isNil_1.default(websocketRequest) && !isEmpty_1.default(websocketRequest)) {
        const wsClient = new subscriptions_transport_ws_1.SubscriptionClient(websocketRequest.uri, Object.assign(Object.assign({}, websocketRequest.options), { connectionParams: () => __awaiter(this, void 0, void 0, function* () {
                const authToken = yield retrieveAuthToken(context);
                return {
                    headers: {
                        authorization: authToken ? `Bearer ${authToken}` : ""
                    }
                };
            }) }));
        registerWebsocketEvents(wsClient, get_1.default(options, "websocketEvents"));
        const wsLink = new ws_1.WebSocketLink(wsClient);
        link = client_1.ApolloLink.split(({ query }) => {
            const definition = utilities_1.getMainDefinition(query);
            return (definition.kind === "OperationDefinition" &&
                definition.operation === "subscription");
        }, wsLink, link);
    }
    const cache = new cache_1.InMemoryCache().restore(initialState);
    const client = new client_1.ApolloClient({
        ssrMode,
        connectToDevTools: options.connectToDevTools || false,
        cache,
        link,
        typeDefs,
        resolvers
    });
    return client;
}
exports.createApolloClient = createApolloClient;
exports.default = createApolloClient;
//# sourceMappingURL=createApolloClient.js.map