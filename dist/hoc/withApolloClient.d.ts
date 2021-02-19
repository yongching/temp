import { NextComponentType } from "next";
import { ClientConfig } from "../@types/with-client";
export declare const withApolloClient: (config: ClientConfig) => (PageComponent: NextComponentType) => any;
export default withApolloClient;
