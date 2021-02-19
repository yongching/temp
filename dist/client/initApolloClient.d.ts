import { ApolloClient } from "@apollo/client";
import { NormalizedCacheObject } from "@apollo/client/cache";
import { ClientOptions } from "../@types/with-client";
import { NextContextPayload } from "../@types";
export declare const initApolloClient: (initialState: any, options: ClientOptions, ctx: NextContextPayload) => ApolloClient<NormalizedCacheObject>;
export declare const initOnContext: (options: ClientOptions, ctx: NextContextPayload) => any;
export default initOnContext;
