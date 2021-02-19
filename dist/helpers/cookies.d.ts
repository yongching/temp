import { NextContextPayload } from "../@types";
export declare const eraseCookieFromAllPaths: (name: string) => void;
export declare const destroyCookie: (key: string, ctx: NextContextPayload) => void;
export declare const getCookie: (key: string, ctx?: NextContextPayload) => string | null;
export declare const setCookie: (key: string, token: string, ctx?: any, days?: number, path?: string) => void;
declare const _default: {
    eraseCookieFromAllPaths: (name: string) => void;
    destroyCookie: (key: string, ctx: any) => void;
    getCookie: (key: string, ctx?: any) => string;
    setCookie: (key: string, token: string, ctx?: any, days?: number, path?: string) => void;
};
export default _default;
