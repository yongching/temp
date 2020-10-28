import { AppContext } from "next/app";
import { NextPageContext } from "next";

/**
 * @param {string} [notFoundPath]
 * @param {string} [signInPath]
 * @param {string} [afterAuthPath]
 * @param {string} [beforeAuthPath]
 * @param {string} [onboardingPath]
 * @param {string[]} [allowedBeforeAuthPaths]
 * @param {string[]} [restrictAfterAuthPaths]
 * @param {string[]} [allowedAdminPaths]
 * @param {string[]} [noLayoutPaths]
 */
export type AuthPaths = {
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

/**
 * ================ HOC
 * @param {Promise<any>} [checkAuthProfile]
 * @param {Function(context)} [getAuthToken]
 * @param {string} [syncAuthEventKeyName]
 * @param {int} [tokenValidityInDays]
 * @param {boolean} [logging]
 * @param {boolean} [enableAdmin]
 * @param {boolean} [enableOnboarding]
 * @param {string} [valueKeyOnboard]
 * @param {string} [valueKeyAdmin]
 * @param {AuthPaths} [paths]
 */

/**
 * Example Options
  {
    checkAuthProfile: (apolloClient) => {},
    syncAuthEventKeyName: "signout",
    tokenValidityInDays: 30,
    logging: true,
    enableAdmin: false,
    enableOnboarding: true,
    valueKeyOnboard: "requiredSetup",
    valueKeyAdmin: "isAdmin",
    paths: {
      signInPath: SIGN_IN_PATH,
      afterAuthPath: DEFAULT_PATH_AFTER_SIGN_IN,
      onboardingPath: ONBOARDING_PATH,
      allowedBeforeAuthPaths: PATHS_ONLY_ALLOWED_BEFORE_AUTH,
      restrictAfterAuthPaths: PATHS_NOT_ALLOWED_AFTER_AUTH,
      allowedAdminPaths: PATHS_FOR_ADMIN_ONLY,
      noLayoutPaths: NO_LAYOUT_PATH
    }
  };
 */
export type AuthOptions = {
  logging?: boolean;
  enableAdmin?: boolean;
  enableOnboarding?: boolean;
  enableNotFoundRedirection?: boolean;
  valueKeyAdmin?: string;
  valueKeyOnboard?: string;
  tokenValidityInDays?: number;
  syncAuthEventKeyName?: string;
  paths: AuthPaths;
  checkAuthProfile(client: any): Promise<any>;
  getAuthToken?: (context: AppContext | NextPageContext) => string | null;
  checkRequiredOnboard(data: any): boolean;
};

export type AuthConfig = {
  ssr?: boolean;
  options: AuthOptions;
};
