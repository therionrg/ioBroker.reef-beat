"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var reefBeatApi_exports = {};
__export(reefBeatApi_exports, {
  ReefBeatApi: () => ReefBeatApi
});
module.exports = __toCommonJS(reefBeatApi_exports);
var import_axios = __toESM(require("axios"));
class ReefBeatApi {
  adapter;
  ip;
  baseUrl;
  secure;
  data;
  headers = {};
  constructor(ip, secure = false, adapter) {
    this.ip = ip;
    this.secure = secure;
    this.baseUrl = (secure ? "https://" : "http://") + ip;
    this.adapter = adapter;
    this.data = {
      sources: [
        { name: "/device-info", type: "device-info", data: null },
        { name: "/firmware", type: "device-info", data: null },
        { name: "/mode", type: "config", data: null },
        { name: "/cloud", type: "config", data: null },
        { name: "/wifi", type: "data", data: null },
        { name: "/dashboard", type: "data", data: null }
      ]
    };
  }
  // GET Request
  async httpGetAsync(path) {
    const url = this.baseUrl + path;
    try {
      this.adapter.log.info(`GET ${url}`);
      const resp = await import_axios.default.get(url, { headers: this.headers });
      return resp.data;
    } catch (ex) {
      const status = ex.response ? ex.response.status : "N/A";
      this.adapter.log.error(`GET ${path} failed (Status: ${status}): ${ex.message}`);
      return null;
    }
  }
  // POST/PUT Request (verwendet axios)
  async httpSendAsync(path, payload, method) {
    const url = this.baseUrl + path;
    try {
      this.adapter.log.debug(`${method} ${url} Payload: ${JSON.stringify(payload)}`);
      await (0, import_axios.default)({
        method,
        url,
        headers: {
          ...this.headers,
          "Content-Type": "application/json"
        },
        data: payload
      });
      return true;
    } catch (ex) {
      const status = ex.response ? ex.response.status : "N/A";
      this.adapter.log.error(`${method} ${path} failed (Status: ${status}): ${ex.message}`);
      return false;
    }
  }
  async getDataAsync(sourceName) {
    const source = this.data.sources.find((s) => s.name === sourceName);
    if (!source) return null;
    const result = await this.httpGetAsync(sourceName);
    this.adapter.log.info(`Data from ${sourceName}: ${JSON.stringify(result)}`);
    if (result) source.data = result;
    return source.data;
  }
  async fetchAllDataAsync() {
    for (const source of this.data.sources) {
      await this.getDataAsync(source.name);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefBeatApi
});
//# sourceMappingURL=reefBeatApi.js.map
