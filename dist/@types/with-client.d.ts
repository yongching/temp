import { AppContext } from "next/app";
import { WebSocketParams } from "@apollo/client/link/ws";
export declare type SocketEvents = {
    onConnected(): void;
    onReconnected(): void;
    onReconnecting(): void;
    onDisconnected(): void;
    onError(): void;
};
export declare type ClientOptions = {
    getAuthToken?: (context: AppContext) => Promise<string | null>;
    graphqlRequest: {
        uri: string;
        credentials: string;
    };
    websocketRequest?: WebSocketParams;
    resolvers?: any;
    typeDefs?: any;
    defaults?: any;
    connectToDevTools: boolean;
    websocketEvents?: SocketEvents;
};
export declare type ClientConfig = {
    ssr: boolean;
    options: ClientOptions;
};
