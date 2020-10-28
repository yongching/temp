import get from "lodash/get";
import some from "lodash/some";
import filter from "lodash/filter";
import isString from "lodash/isString";
import includes from "lodash/includes";
import { NextPageContext } from "next";
import { redirect } from "../helpers/redirect";
import { AuthOptions } from "../@types/with-auth";

const checkIsPathMatchesAny = (
  paths: string[],
  checkPaths: string | string[],
  partial = false
): boolean => {
  const results = filter(paths, (e) => {
    if (isString(checkPaths)) {
      if (partial) return includes(e, checkPaths);
      return e === checkPaths;
    }
    return some(checkPaths, (o) => {
      if (partial) return includes(e, o);
      return e === o;
    });
  });
  return results.length > 0;
};

export const initialAuthProps = (
  context: NextPageContext,
  authUser: any,
  options: AuthOptions
): { [key: string]: any } => {
  const { asPath, pathname } = context;
  const navigatingToPaths: string[] = [asPath, pathname];
  const { paths } = options;
  const enableLogging = options.logging || false;

  // --- Check path whether should hide layout
  const shouldHideLayout = checkIsPathMatchesAny(
    paths.noLayoutPaths, // NO_LAYOUT_PATH
    navigatingToPaths
  );

  // --- Props that will return to application
  const props = { shouldHideLayout };

  // --- Check whether the path is error
  if (pathname === "/_error") {
    if (enableLogging) {
      // eslint-disable-next-line
      console.log("page not found:", asPath);
    }

    if (options.enableNotFoundRedirection && !authUser) {
      const notFoundPath = paths.notFoundPath || "/page-not-found";
      const isNotFound = checkIsPathMatchesAny(navigatingToPaths, notFoundPath);
      if (!isNotFound) {
        redirect(context, notFoundPath);
        return props;
      }
    }
    return props;
  }

  if (authUser) {
    // you can do things like checking user roles
    // and see if they are trying to navigate somewhere else
    if (options.enableAdmin) {
      const adminValueKey = options.valueKeyAdmin || "isAdmin";
      const isNotAdmin = !authUser[adminValueKey];
      const adminPaths = paths.allowedAdminPaths || []; // PATHS_FOR_ADMIN_ONLY
      const afterAuthPath = paths.afterAuthPath || "/app"; // DEFAULT_PATH_AFTER_SIGN_IN
      if (isNotAdmin && checkIsPathMatchesAny(navigatingToPaths, adminPaths)) {
        redirect(context, afterAuthPath);
        return props;
      }
    }

    // you can also do things to check on user onboarding states
    // and ensure they have to go through the onboarding before doing anything else
    if (options.enableOnboarding) {
      const hasOnboardFunc = !!options.checkRequiredOnboard;
      const onboardValueKey = options.valueKeyOnboard || "setupIsRequired";
      const isAuthUserRequiredOnboard = hasOnboardFunc
        ? options.checkRequiredOnboard(authUser)
        : get(authUser, onboardValueKey, false);
      const onboardPath = paths.onboardingPath || "/get-started"; // ONBOARDING_PATH

      if (
        isAuthUserRequiredOnboard &&
        !checkIsPathMatchesAny(navigatingToPaths, [onboardPath])
      ) {
        redirect(context, onboardPath);
        return props;
      }
    }

    // always redirect user goes to account whenever user try to access path that is forbidden or restricted
    const isRestrictPathForAuth = checkIsPathMatchesAny(
      paths.restrictAfterAuthPaths, // PATHS_NOT_ALLOWED_AFTER_AUTH,
      navigatingToPaths
    );
    if (isRestrictPathForAuth) {
      if (enableLogging) {
        // eslint-disable-next-line
        // console.log("===== isAtRestrictPath ");
      }
      const afterAuthPath = paths.afterAuthPath || "/";
      redirect(context, afterAuthPath);
    }
    return props;
  }

  // always redirect user to signin whenever user access path that is required signin or restricted
  if (enableLogging) {
    // eslint-disable-next-line
    // console.log("********* check paths: ", navigatingToPaths);
  }

  // Check current path whether is accessible for non login user
  // whitelist path + signed in user restrict path = non login user path
  const isRestrictBeforeAuth = !checkIsPathMatchesAny(
    [
      ...paths.allowedBeforeAuthPaths, // PATHS_ONLY_ALLOWED_BEFORE_AUTH
      ...paths.restrictAfterAuthPaths // PATHS_NOT_ALLOWED_AFTER_AUTH
    ],
    navigatingToPaths
  );

  // eslint-disable-next-line no-console
  // console.log("isRestrictBeforeAuth ------>", isRestrictBeforeAuth);
  if (isRestrictBeforeAuth) {
    if (enableLogging) {
      // eslint-disable-next-line
      // console.log("===== isRestrictBeforeAuth ");
    }
    const defaultPath = paths.beforeAuthPath || paths.signInPath || "/signin";
    if (!checkIsPathMatchesAny(navigatingToPaths, defaultPath)) {
      redirect(context, defaultPath);
    }
    return props;
  }

  // allow user to access path if passed all condition above
  if (enableLogging) {
    // eslint-disable-next-line
    // console.log("===== nothingForAuth ");
  }
  return props;
};

export default initialAuthProps;
