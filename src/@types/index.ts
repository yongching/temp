import { AppContext, AppProps } from "next/app";
import { NextComponentType, NextPageContext } from "next";

export * from "./apollo";
export * from "./with-auth";
export * from "./with-client";

export type NextContextPayload = AppContext | NextPageContext | any;

// === for NextJs custom _app
export interface MyAppContext extends AppContext {
  apolloClient?: any;
  authUser?: any;
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

// === for NextJs page
export interface MyPageContext extends NextPageContext {
  apolloClient?: any;
  authUser?: any;
}
