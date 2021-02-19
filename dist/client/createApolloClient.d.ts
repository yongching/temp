import { ApolloClient } from "@apollo/client";
import { NormalizedCacheObject } from "@apollo/client/cache";
import { ClientOptions } from "../@types/with-client";
import { NextContextPayload } from "../@types";
export declare function createApolloClient(initialState: any, options: ClientOptions, context: NextContextPayload): ApolloClient<NormalizedCacheObject>;
export default createApolloClient;
