"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var reefCloud_exports = {};
__export(reefCloud_exports, {
  ReefCloud: () => ReefCloud
});
module.exports = __toCommonJS(reefCloud_exports);
var import_reefBeatApi = require("./reefBeatApi");
class ReefCloud extends import_reefBeatApi.ReefBeatApi {
  username;
  password;
  constructor(ip, adapter, helper, username, password) {
    super(ip, false, adapter, helper);
    this.username = username;
    this.password = password;
  }
  async pollCloudAsync() {
    if (!this.token || Date.now() >= this.tokenExpires) {
      await this.connectAsync();
    }
    this.getAndSetDataAsync("aquarium");
    this.getAndSetDataAsync("device");
    this.getAndSetDataAsync("reef-wave/library");
  }
  async connectAsync() {
    try {
      const url = `https://${this.ip}/oauth/token`;
      const headers = {
        Authorization: "Basic Z0ZqSHRKcGE6Qzlmb2d3cmpEV09SVDJHWQ==",
        "Content-Type": "application/x-www-form-urlencoded"
      };
      const payload = new URLSearchParams({
        grant_type: "password",
        username: this.username,
        password: this.password
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
  ReefCloud
});
//# sourceMappingURL=reefCloud.js.map
