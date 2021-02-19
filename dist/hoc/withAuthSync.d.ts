import { AuthConfig } from "../@types/with-auth";
import { NextContextPayload } from "../@types";
export declare const getTokenFromCookies: (ctx: NextContextPayload) => string;
export declare const clearAuthToken: () => void;
export declare const setAuthToken: (token: string, days?: number) => void;
export declare const withAuthSync: (config: AuthConfig) => any;
export default withAuthSync;
