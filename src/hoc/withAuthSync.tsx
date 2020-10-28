import React, { useEffect } from "react";
import includes from "lodash/includes";
import App from "next/app";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { NextPageContext, NextComponentType } from "next";
import {
  setCookie,
  getCookie,
  destroyCookie,
  eraseCookieFromAllPaths
} from "../helpers/cookies";
import { redirect } from "../helpers/redirect";
import { AuthConfig } from "../@types/with-auth";
import { initialAuthProps } from "../client/initialAuthProps";
import { NextContextPayload } from "../@types";

// ======================= HELPER
export const getTokenFromCookies = (ctx: NextContextPayload): string => {
  return getCookie("token", ctx);
};

export const clearAuthToken = (): void => {
  destroyCookie("token", {});
  eraseCookieFromAllPaths("token");
};

export const setAuthToken = (token: string, days: number = 30): void => {
  setCookie("token", token, {}, days);
};

// ======================= HOC
// Session is synchronized across tabs. If you logout your session gets removed on all the windows as well. We use the HOC withAuthSync for this.
export const withAuthSync = (config: AuthConfig): any => <P,>(
  PageComponent: NextComponentType<NextPageContext, any, P>
) => {
  const { ssr = true, options } = config;
  const { checkAuthProfile, getAuthToken } = options;

  // check whether `checkAuthProfile` provided
  if (!checkAuthProfile) {
    throw new Error("checkAuthProfile is not defined");
  }

  const WithAuth = (props) => {
    const apolloClient = useApolloClient();
    const router = useRouter();

    useEffect(() => {
      const syncSignout = (event) => {
        if (event.key === options.syncAuthEventKeyName) {
          apolloClient.cache.reset().then(() => {
            clearAuthToken();
            redirect(
              {},
              options.paths.beforeAuthPath || options.paths.signInPath,
              "force-reload"
            );
          });
        }
      };
      window.addEventListener("storage", syncSignout);
      return () => {
        window.removeEventListener("storage", syncSignout);
        window.localStorage.removeItem(options.syncAuthEventKeyName);
      };
    }, [apolloClient]);

    // sign out auth user
    const signOut = (callback: (isRestrict: boolean) => void) => {
      apolloClient.cache.reset().then(() => {
        clearAuthToken();
        window.localStorage.setItem(
          options.syncAuthEventKeyName,
          Date.now().toString()
        );
        const isAtRestrictPath = !includes(
          options.paths.afterAuthPath,
          router.pathname
        );
        if (callback) {
          callback(isAtRestrictPath);
          return;
        }
        redirect(
          {},
          options.paths.beforeAuthPath || options.paths.signInPath,
          "force-reload"
        );
      });
    };

    return <PageComponent {...props} signOutAuthUser={signOut} />;
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";
    WithAuth.displayName = `withAuth(${displayName})`;
  }

  // retrieve auth token from context
  const retrieveAuthToken = (ctx: any) => {
    const inAppContext = Boolean(ctx.ctx);
    if (inAppContext) {
      return getAuthToken
        ? getAuthToken(ctx.ctx)
        : getTokenFromCookies(ctx.ctx);
    }
    return getAuthToken ? getAuthToken(ctx) : getTokenFromCookies(ctx);
  };

  if (ssr || PageComponent.getInitialProps) {
    WithAuth.getInitialProps = async (ctx) => {
      const inAppContext = Boolean(ctx.ctx);
      const hasAuthToken = !!retrieveAuthToken(ctx);

      const { authUser } = hasAuthToken
        ? await checkAuthProfile(ctx.apolloClient)
        : { authUser: null };

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps({ ...ctx, authUser });
      } else if (inAppContext) {
        pageProps = await App.getInitialProps({ ...ctx, authUser });
      }

      const authConfig = initialAuthProps(ctx.ctx, authUser, options);
      const outProps = {
        pageProps: {
          ...pageProps,
          authUser,
          config: authConfig
        },
        apolloClient: ctx.apolloClient
      };

      return outProps;
    };
  }

  return WithAuth;
};

export default withAuthSync;
