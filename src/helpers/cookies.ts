import * as nookies from "nookies";
import { NextContextPayload } from "../@types";

export const eraseCookieFromAllPaths = (name: string): void => {
  // This function will attempt to remove a cookie from all paths.
  // eslint-disable-next-line
  const pathBits = location.pathname.split("/");
  let pathCurrent = " path=";
  // do a simple pathless delete first.
  document.cookie = `${name}=; expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
  // eslint-disable-next-line
  for (let i = 0; i < pathBits.length; i++) {
    pathCurrent += (pathCurrent.substr(-1) !== "/" ? "/" : "") + pathBits[i];
    document.cookie = `${name}=; expires=Thu, 01-Jan-1970 00:00:01 GMT;${pathCurrent};`;
  }
};

export const destroyCookie = (key: string, ctx: NextContextPayload): void => {
  nookies.destroyCookie(ctx || {}, key);
  eraseCookieFromAllPaths(key);
};

export const getCookie = (
  key: string,
  ctx?: NextContextPayload
): string | null => {
  const cookies = nookies.parseCookies(ctx || {});
  return cookies[key] || null;
};

export const setCookie = (
  key: string,
  token: string,
  ctx: any = {},
  days = 30,
  path = "/"
): void => {
  nookies.setCookie(ctx, key, token, {
    maxAge: days * 24 * 60 * 60,
    path
  });
};

export default {
  eraseCookieFromAllPaths,
  destroyCookie,
  getCookie,
  setCookie
};
