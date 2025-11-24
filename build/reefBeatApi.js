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
var import_json2iob = __toESM(require("json2iob"));
class ReefBeatApi {
  adapter;
  ip;
  baseUrl;
  secure;
  localCapabilities;
  headers = {};
  json2iob;
  token;
  tokenExpires = 0;
  helper;
  aquariumSource = "aquarium";
  constructor(ip, secure = false, adapter, helper) {
    this.ip = ip;
    this.secure = secure;
    this.baseUrl = (secure ? "https://" : "http://") + ip;
    this.adapter = adapter;
    this.json2iob = new import_json2iob.default(adapter);
    this.localCapabilities = ["device-info", "mode", "dashboard"];
    this.helper = helper;
  }
  // GET Request
  async httpGetAsync(path) {
    const url = this.baseUrl + "/" + path;
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
  // PPOST or PUT request
  async httpSendAsync(path, payload, method) {
    const url = this.baseUrl + path;
    this.adapter.log.debug("Calling " + url);
    try {
      this.adapter.log.debug(`${method} ${url} Payload: ${JSON.stringify(payload)}`);
      const response = await (0, import_axios.default)({
        method,
        url,
        headers: {
          ...this.headers,
          "Content-Type": "application/json"
        },
        data: void 0
      });
      if (response.status === 200) {
        return true;
      } else {
        const text = response.statusText;
        this.adapter.log.info("Error calling: " + text);
        return false;
      }
    } catch (ex) {
      const status = ex.response ? ex.response.status : "N/A";
      this.adapter.log.error(`${method} ${path} failed (Status: ${status}): ${ex.message}`);
      return false;
    }
  }
  async getDataAsync(sourceName) {
    const result = await this.httpGetAsync(sourceName);
    this.adapter.log.debug(`Data from ${sourceName}: ${JSON.stringify(result)}`);
    return result;
  }
  async applyFeedMaintMode(baseDataPoint) {
    this.helper.ensureStateAsync(baseDataPoint + ".feedMode", "Feed Mode", "boolean", "switch", true, true);
    this.helper.ensureStateAsync(baseDataPoint + ".maintMode", "Maintenance Mode", "boolean", "switch", true, true);
  }
  async getAndSetDataAsync(sourceName) {
    var _a;
    const result = await this.getDataAsync(sourceName);
    const count = (_a = result == null ? void 0 : result.length) != null ? _a : 0;
    if (this.constructor.name != "ReefCloud") {
      const prefix = `${this.constructor.name}.${sourceName}`;
      this.json2iob.parse(prefix, result, { forceIndex: true });
      this.helper.ensureStateAsync(
        this.constructor.name + "." + sourceName + "._refresh",
        "Refresh data",
        "boolean",
        "button",
        true,
        true
      );
      if (sourceName === "aquarium") this.applyFeedMaintMode(prefix);
    } else {
      result.forEach((entry, counter) => {
        var _a2;
        const key = ((_a2 = entry.model) == null ? void 0 : _a2.trim()) || counter + 1;
        const prefix = `${this.constructor.name}.${sourceName}${count === 1 ? "" : "s." + key}`;
        this.json2iob.parse(prefix, entry, { forceIndex: true });
        this.helper.ensureStateAsync(
          this.constructor.name + "." + sourceName + (count === 1 ? "" : "s") + "._refresh",
          "Refresh data",
          "boolean",
          "button",
          true,
          true
        );
        if (sourceName === "aquarium") this.applyFeedMaintMode(prefix);
      });
    }
  }
  async pollBasicDataAsync(sourceName) {
    if (sourceName) {
      await this.getAndSetDataAsync(sourceName);
    } else {
      const requests = this.localCapabilities.map(async (capability) => {
        this.getAndSetDataAsync(capability);
      });
      await Promise.all(requests);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefBeatApi
});
//# sourceMappingURL=reefBeatApi.js.map
