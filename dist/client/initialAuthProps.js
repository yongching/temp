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
exports.initialAuthProps = void 0;
const get_1 = __importDefault(require("lodash/get"));
const some_1 = __importDefault(require("lodash/some"));
const filter_1 = __importDefault(require("lodash/filter"));
const isString_1 = __importDefault(require("lodash/isString"));
const includes_1 = __importDefault(require("lodash/includes"));
const redirect_1 = require("../helpers/redirect");
const checkIsPathMatchesAny = (paths, checkPaths, partial = false) => {
    const results = filter_1.default(paths, (e) => {
        if (isString_1.default(checkPaths)) {
            if (partial)
                return includes_1.default(e, checkPaths);
            return e === checkPaths;
        }
        return some_1.default(checkPaths, (o) => {
            if (partial)
                return includes_1.default(e, o);
            return e === o;
        });
    });
    return results.length > 0;
};
exports.initialAuthProps = (context, authUser, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { asPath, pathname } = context;
    const navigatingToPaths = [asPath, pathname];
    const { paths } = options;
    const enableLogging = options.logging || false;
    const shouldHideLayout = checkIsPathMatchesAny(paths.noLayoutPaths, navigatingToPaths);
    const props = { shouldHideLayout };
    if (pathname === "/_error") {
        if (enableLogging) {
            console.log("===== error path:", asPath, pathname);
        }
        if (options.enableNotFoundRedirection && !authUser) {
            const notFoundPath = paths.notFoundPath || "/page-not-found";
            const isNotFound = checkIsPathMatchesAny(navigatingToPaths, notFoundPath);
            if (!isNotFound) {
                redirect_1.redirect(context, notFoundPath);
                return props;
            }
        }
        return props;
    }
    if (authUser) {
        if (options.enableAdmin) {
            const adminValueKey = options.valueKeyAdmin || "isAdmin";
            const isNotAdmin = !authUser[adminValueKey];
            const adminPaths = paths.allowedAdminPaths || [];
            const afterAuthPath = paths.afterAuthPath || "/app";
            if (isNotAdmin && checkIsPathMatchesAny(navigatingToPaths, adminPaths)) {
                redirect_1.redirect(context, afterAuthPath);
                return props;
            }
        }
        if (options.enableOnboarding) {
            const hasOnboardFunc = !!options.checkRequiredOnboard;
            const onboardValueKey = options.valueKeyOnboard || "setupIsRequired";
            const isAuthUserRequiredOnboard = hasOnboardFunc
                ? yield options.checkRequiredOnboard(authUser)
                : get_1.default(authUser, onboardValueKey, false);
            const onboardPath = paths.onboardingPath || "/get-started";
            if (isAuthUserRequiredOnboard &&
                !checkIsPathMatchesAny(navigatingToPaths, [onboardPath])) {
                redirect_1.redirect(context, onboardPath);
                return props;
            }
        }
        const isRestrictPathForAuth = checkIsPathMatchesAny(paths.restrictAfterAuthPaths, navigatingToPaths);
        if (isRestrictPathForAuth) {
            if (enableLogging) {
                console.log("===== isAtRestrictPath ");
            }
            const afterAuthPath = paths.afterAuthPath || "/";
            redirect_1.redirect(context, afterAuthPath);
        }
        return props;
    }
    if (enableLogging) {
        console.log("===== check paths: ", navigatingToPaths);
    }
    const isRestrictBeforeAuth = !checkIsPathMatchesAny([
        ...paths.allowedBeforeAuthPaths,
        ...paths.restrictAfterAuthPaths
    ], navigatingToPaths);
    if (isRestrictBeforeAuth) {
        if (enableLogging) {
            console.log("===== isRestrictBeforeAuth ");
        }
        const defaultPath = paths.beforeAuthPath || paths.signInPath || "/signin";
        if (!checkIsPathMatchesAny(navigatingToPaths, defaultPath)) {
            redirect_1.redirect(context, defaultPath);
        }
        return props;
    }
    if (enableLogging) {
        console.log("===== nothingForAuth ");
    }
    return props;
});
exports.default = exports.initialAuthProps;
//# sourceMappingURL=initialAuthProps.js.map