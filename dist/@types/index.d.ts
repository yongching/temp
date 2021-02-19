import { AppContext, AppProps } from "next/app";
import { NextComponentType, NextPageContext } from "next";
export * from "./apollo";
export * from "./with-auth";
export * from "./with-client";
export declare type NextContextPayload = AppContext | NextPageContext | any;
export interface MyAppContext extends AppContext {
    apolloClient?: any;
    authUser?: any;
    [key: string]: any;
}
export interface MyAppProps extends AppProps {
    Component: NextComponentType & any;
    pageProps: {
        authUser?: any;
        config?: {
            [key: string]: any;
        };
        [key: string]: any;
    };
    signOutAuthUser?: (callback?: (isRestrict: boolean) => void) => void;
}
export interface MyPageContext extends NextPageContext {
    apolloClient?: any;
    authUser?: any;
    [key: string]: any;
}
