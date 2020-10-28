import { AppContext } from "next/app";
import { NextPageContext } from "next";

export * from "./apollo";
export * from "./with-auth";
export * from "./with-client";

export type NextContextPayload = AppContext | NextPageContext | any;
