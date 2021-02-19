"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = void 0;
const includes_1 = __importDefault(require("lodash/includes"));
const router_1 = __importDefault(require("next/router"));
exports.redirect = (context, target, method = "replace") => {
    if (context.res) {
        context.res.writeHead(303, { Location: target });
        context.res.end();
        return;
    }
    if (typeof window === "undefined") {
        console.error("window object is undefined!");
        return;
    }
    if (method === "external") {
        window.location.href = target;
        return;
    }
    if (method === "reload" || method === "force-reload") {
        router_1.default.reload();
        return;
    }
    if (!includes_1.default(["replace", "push"], method)) {
        console.error("redirect method not valid!");
        return;
    }
    router_1.default[method](target);
};
exports.default = exports.redirect;
//# sourceMappingURL=redirect.js.map