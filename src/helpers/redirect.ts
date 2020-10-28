import includes from "lodash/includes";
import Router from "next/router";

export const redirect = (
  context: any,
  target: string,
  method:
    | "replace"
    | "force-reload"
    | "external"
    | "push"
    | "prefetch" = "replace"
): void => {
  if (context.res) {
    // server
    // 303: "See other"
    context.res.writeHead(303, { Location: target });
    context.res.end();
    return;
  }

  // if windows object is undefined stop right away
  if (typeof window === "undefined") {
    // eslint-disable-next-line
    console.error("window object is undefined!");
    return;
  }

  // to redirect user to different domain name
  if (method === "external") {
    window.location.href = target;
    return;
  }

  if (method === "force-reload") {
    Router.reload();
    return;
  }

  // "next/router" supported methods
  if (!includes(["replace", "push"], method)) {
    // eslint-disable-next-line
    console.error("redirect method not valid!");
    return;
  }
  // In the browser, we just pretend like this never even happened ;)
  Router[method](target);
};

export default redirect;
