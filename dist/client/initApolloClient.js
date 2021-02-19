"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOnContext = exports.initApolloClient = void 0;
const isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
const createApolloClient_1 = require("./createApolloClient");
if (!process.browser) {
    global.fetch = isomorphic_unfetch_1.default;
}
let globalApolloClient = null;
exports.initApolloClient = (initialState, options, ctx) => {
    if (typeof window === "undefined") {
        return createApolloClient_1.createApolloClient(initialState, options, ctx);
    }
    if (!globalApolloClient) {
        globalApolloClient = createApolloClient_1.createApolloClient(initialState, options, ctx);
    }
    return globalApolloClient;
};
exports.initOnContext = (options, ctx) => {
    const inAppContext = Boolean(ctx.ctx);
    if (process.env.NODE_ENV === "development") {
        if (inAppContext) {
            console.warn("Warning: You have opted-out of Automatic Static Optimization due to `withApollo` in `pages/_app`.\n" +
                "Read more: https://err.sh/next.js/opt-out-auto-static-optimization\n");
        }
    }
    const apolloClient = ctx.apolloClient ||
        exports.initApolloClient(ctx.apolloState || {}, options, inAppContext ? ctx.ctx : ctx);
    apolloClient.toJSON = () => null;
    ctx.apolloClient = apolloClient;
    if (inAppContext) {
        ctx.ctx.apolloClient = apolloClient;
    }
    return ctx;
};
exports.default = exports.initOnContext;
//# sourceMappingURL=initApolloClient.js.map