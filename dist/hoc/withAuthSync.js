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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuthSync = exports.setAuthToken = exports.clearAuthToken = exports.getTokenFromCookies = void 0;
const react_1 = __importStar(require("react"));
const includes_1 = __importDefault(require("lodash/includes"));
const app_1 = __importDefault(require("next/app"));
const router_1 = require("next/router");
const client_1 = require("@apollo/client");
const cookies_1 = require("../helpers/cookies");
const redirect_1 = require("../helpers/redirect");
const initialAuthProps_1 = require("../client/initialAuthProps");
exports.getTokenFromCookies = (ctx) => {
    return cookies_1.getCookie("token", ctx);
};
exports.clearAuthToken = () => {
    cookies_1.destroyCookie("token", {});
    cookies_1.eraseCookieFromAllPaths("token");
};
exports.setAuthToken = (token, days = 30) => {
    cookies_1.setCookie("token", token, {}, days);
};
exports.withAuthSync = (config) => (PageComponent) => {
    const { ssr = true, options } = config;
    const { checkAuthProfile } = options;
    if (!checkAuthProfile) {
        throw new Error("checkAuthProfile is not defined");
    }
    const WithAuth = (props) => {
        const apolloClient = client_1.useApolloClient();
        const router = router_1.useRouter();
        react_1.useEffect(() => {
            const syncSignout = (event) => {
                if (event.key === options.syncAuthEventKeyName) {
                    apolloClient.cache.reset().then(() => {
                        exports.clearAuthToken();
                        redirect_1.redirect({}, options.paths.beforeAuthPath || options.paths.signInPath, "force-reload");
                    });
                }
            };
            window.addEventListener("storage", syncSignout);
            return () => {
                window.removeEventListener("storage", syncSignout);
                window.localStorage.removeItem(options.syncAuthEventKeyName);
            };
        }, [apolloClient]);
        const signOut = (callback) => {
            apolloClient.cache.reset().then(() => {
                exports.clearAuthToken();
                window.localStorage.setItem(options.syncAuthEventKeyName, Date.now().toString());
                const isAtRestrictPath = !includes_1.default(options.paths.afterAuthPath, router.pathname);
                if (callback) {
                    callback(isAtRestrictPath);
                    return;
                }
                redirect_1.redirect({}, options.paths.beforeAuthPath || options.paths.signInPath, "force-reload");
            });
        };
        return react_1.default.createElement(PageComponent, Object.assign({}, props, { signOutAuthUser: signOut }));
    };
    if (process.env.NODE_ENV !== "production") {
        const displayName = PageComponent.displayName || PageComponent.name || "Component";
        WithAuth.displayName = `withAuth(${displayName})`;
    }
    const retrieveAuthToken = (ctx) => {
        const inAppContext = Boolean(ctx.ctx);
        if (inAppContext) {
            return exports.getTokenFromCookies(ctx.ctx);
        }
        return exports.getTokenFromCookies(ctx);
    };
    if (ssr || PageComponent.getInitialProps) {
        WithAuth.getInitialProps = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const inAppContext = Boolean(ctx.ctx);
            const hasAuthToken = !!(yield retrieveAuthToken(ctx));
            const { authUser } = hasAuthToken
                ? yield checkAuthProfile(ctx.apolloClient)
                : { authUser: null };
            let pageProps = {};
            if (PageComponent.getInitialProps) {
                pageProps = yield PageComponent.getInitialProps(Object.assign(Object.assign({}, ctx), { authUser }));
            }
            else if (inAppContext) {
                pageProps = yield app_1.default.getInitialProps(Object.assign(Object.assign({}, ctx), { authUser }));
            }
            const authConfig = yield initialAuthProps_1.initialAuthProps(ctx.ctx, authUser, options);
            const outProps = {
                pageProps: Object.assign(Object.assign({}, pageProps), { authUser, config: authConfig }),
                apolloClient: ctx.apolloClient
            };
            return outProps;
        });
    }
    return WithAuth;
};
exports.default = exports.withAuthSync;
//# sourceMappingURL=withAuthSync.js.map