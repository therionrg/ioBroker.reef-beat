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
  async httpGetAsync(path, isCloud = false) {
    const url = isCloud ? path : this.baseUrl + "/" + path;
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
    this.adapter.log.debug("Calling " + url);
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
    const result = await this.httpGetAsync(sourceName);
    this.adapter.log.debug(`Data from ${sourceName}: ${JSON.stringify(result)}`);
    return result;
  }
  async getAndSetDataAsync(sourceName) {
    const result = await this.getDataAsync(sourceName);
    this.json2iob.parse(this.constructor.name + "." + sourceName, result, { forceIndex: true });
    this.helper.ensureStateAsync(
      this.constructor.name + "." + sourceName + "._Refresh",
      "Refresh data",
      "boolean",
      "button",
      true,
      true
    );
  }
  async pollBasicDataAsync() {
    const requests = this.localCapabilities.map(async (capability) => {
      this.getAndSetDataAsync(capability);
    });
    await Promise.all(requests);
  }
  async getAquariumAsync(ip, username, password) {
    if (!this.token || Date.now() >= this.tokenExpires) {
      await this.connectAsync(ip, username, password);
      const result = await this.httpGetAsync("https://cloud.reef-beat.com/aquarium", true);
      this.adapter.log.info("Aquarium replay: " + JSON.stringify(result));
      this.json2iob.parse(this.constructor.name + ".aquariums", result, { forceIndex: true });
    }
  }
  async pollCloudAsync(ip, username, password) {
    if (!this.token || Date.now() >= this.tokenExpires) {
      await this.connectAsync(ip, username, password);
    }
    const result = await this.httpGetAsync("https://cloud.reef-beat.com/reef-wave/library", true);
    const result2 = await this.httpGetAsync("https://cloud.reef-beat.com/device", true);
    const result3 = await this.httpGetAsync("https://cloud.reef-beat.com/aquarium", true);
    this.adapter.log.info("Cloud replay: " + JSON.stringify(result));
    this.adapter.log.info("Cloud replay: " + JSON.stringify(result2));
    this.adapter.log.info("Cloud replay: " + JSON.stringify(result3));
  }
  async connectAsync(ip, username, password) {
    try {
      const url = `https://${ip}/oauth/token`;
      const headers = {
        Authorization: "Basic Z0ZqSHRKcGE6Qzlmb2d3cmpEV09SVDJHWQ==",
        "Content-Type": "application/x-www-form-urlencoded"
      };
      const payload = new URLSearchParams({
        grant_type: "password",
        username,
        password
      });
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: payload.toString()
      });
      this.adapter.log.info("HTTP Status:" + response.status);
      const text = await response.text();
      this.adapter.log.info("Response body:\n" + text);
      if (!response.ok) {
        this.adapter.log.error("Fehlerhafte Antwort vom Server.");
        return null;
      }
      const json = JSON.parse(text);
      const token = json["access_token"];
      if (!token) {
        this.adapter.log.error("Kein access_token im Response.");
        return null;
      }
      const now = Date.now();
      this.token = json["access_token"];
      this.tokenExpires = now + json["expires_in"] * 1e3;
      this.headers["Authorization"] = `Bearer ${this.token}`;
      this.adapter.log.info("Access Token:" + token);
      return token;
    } catch (err) {
      this.adapter.log.error("ConnectAsync Fehler:" + err);
      return null;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefBeatApi
});
//# sourceMappingURL=reefBeatApi.js.map
