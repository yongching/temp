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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookie = exports.getCookie = exports.destroyCookie = exports.eraseCookieFromAllPaths = void 0;
const nookies = __importStar(require("nookies"));
exports.eraseCookieFromAllPaths = (name) => {
    const pathBits = location.pathname.split("/");
    let pathCurrent = " path=";
    document.cookie = `${name}=; expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
    for (let i = 0; i < pathBits.length; i++) {
        pathCurrent += (pathCurrent.substr(-1) !== "/" ? "/" : "") + pathBits[i];
        document.cookie = `${name}=; expires=Thu, 01-Jan-1970 00:00:01 GMT;${pathCurrent};`;
    }
};
exports.destroyCookie = (key, ctx) => {
    nookies.destroyCookie(ctx || {}, key);
    exports.eraseCookieFromAllPaths(key);
};
exports.getCookie = (key, ctx) => {
    const cookies = nookies.parseCookies(ctx || {});
    return cookies[key] || null;
};
exports.setCookie = (key, token, ctx = {}, days = 30, path = "/") => {
    nookies.setCookie(ctx, key, token, {
        maxAge: days * 24 * 60 * 60,
        path
    });
};
exports.default = {
    eraseCookieFromAllPaths: exports.eraseCookieFromAllPaths,
    destroyCookie: exports.destroyCookie,
    getCookie: exports.getCookie,
    setCookie: exports.setCookie
};
//# sourceMappingURL=cookies.js.map