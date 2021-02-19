import { NextPageContext } from "next";
import { AuthOptions } from "../@types/with-auth";
export declare const initialAuthProps: (context: NextPageContext, authUser: any, options: AuthOptions) => Promise<{
    [key: string]: any;
}>;
export default initialAuthProps;
