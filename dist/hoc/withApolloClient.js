"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withApolloClient = void 0;
const react_1 = __importDefault(require("react"));
const app_1 = __importDefault(require("next/app"));
const head_1 = __importDefault(require("next/head"));
const client_1 = require("@apollo/client");
const initApolloClient_1 = require("../client/initApolloClient");
exports.withApolloClient = (config) => (PageComponent) => {
    const { ssr = false, options } = config;
    const WithApollo = (_a) => {
        var { apolloClient, apolloState } = _a, pageProps = __rest(_a, ["apolloClient", "apolloState"]);
        let client;
        if (apolloClient) {
            client = apolloClient;
        }
        else {
            client = initApolloClient_1.initApolloClient(apolloState, options, undefined);
        }
        return (react_1.default.createElement(client_1.ApolloProvider, { client: client },
            react_1.default.createElement(PageComponent, Object.assign({}, pageProps))));
    };
    if (process.env.NODE_ENV !== "production") {
        const displayName = PageComponent.displayName || PageComponent.name || "Component";
        WithApollo.displayName = `withApollo(${displayName})`;
    }
    if (ssr || PageComponent.getInitialProps) {
        WithApollo.getInitialProps = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const inAppContext = Boolean(ctx.ctx);
            const { apolloClient } = initApolloClient_1.initOnContext(options, ctx);
            let pageProps = {};
            if (PageComponent.getInitialProps) {
                pageProps = yield PageComponent.getInitialProps(ctx);
            }
            else if (inAppContext) {
                pageProps = yield app_1.default.getInitialProps(ctx);
            }
            if (typeof window === "undefined") {
                const { AppTree } = ctx;
                if (ctx.res && ctx.res.finished) {
                    return pageProps;
                }
                if (ssr && AppTree) {
                    try {
                        const { getDataFromTree } = yield Promise.resolve().then(() => __importStar(require("@apollo/client/react/ssr")));
                        let props;
                        if (inAppContext) {
                            props = Object.assign(Object.assign({}, pageProps), { apolloClient });
                        }
                        else {
                            props = { pageProps: Object.assign(Object.assign({}, pageProps), { apolloClient }) };
                        }
                        yield getDataFromTree(react_1.default.createElement(AppTree, Object.assign({}, props)));
                    }
                    catch (error) {
                        console.error("Error while running `getDataFromTree`", error);
                    }
                    head_1.default.rewind();
                }
            }
            return Object.assign(Object.assign({}, pageProps), { apolloState: apolloClient.cache.extract(), apolloClient: ctx.apolloClient });
        });
    }
    return WithApollo;
};
exports.default = exports.withApolloClient;
//# sourceMappingURL=withApolloClient.js.map