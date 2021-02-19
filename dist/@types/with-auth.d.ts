export declare type AuthPaths = {
    notFoundPath?: string;
    signInPath: string;
    afterAuthPath: string;
    beforeAuthPath: string;
    onboardingPath?: string;
    allowedBeforeAuthPaths: string[];
    restrictAfterAuthPaths: string[];
    allowedAdminPaths?: string[];
    noLayoutPaths?: string[];
};
export declare type AuthOptions = {
    paths: AuthPaths;
    logging?: boolean;
    enableAdmin?: boolean;
    enableOnboarding?: boolean;
    enableNotFoundRedirection?: boolean;
    valueKeyAdmin?: string;
    valueKeyOnboard?: string;
    tokenValidityInDays?: number;
    syncAuthEventKeyName?: string;
    checkAuthProfile: (client: any) => Promise<any>;
    checkRequiredOnboard?: (data: any) => Promise<boolean>;
};
export declare type AuthConfig = {
    ssr?: boolean;
    options: AuthOptions;
};
