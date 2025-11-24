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
  refreshToken;
  constructor(ip, adapter, helper, username, password) {
    super(ip, false, adapter, helper);
    this.username = username;
    this.password = password;
    this.adapter.log.info("ReefCloud initialized.");
  }
  async pollCloudAsync(sourceName) {
    if (await this.ensureTokenAsync()) {
      this.adapter.log.info("Start cloud polling for " + sourceName + "...");
      if (sourceName) {
        if (sourceName.endsWith("s")) {
          sourceName = sourceName.slice(0, -1);
        }
        this.getAndSetDataAsync(sourceName);
      } else {
        this.getAndSetDataAsync("aquarium");
        this.getAndSetDataAsync("device");
        this.getAndSetDataAsync("reef-wave/library");
      }
      this.adapter.log.info("Finished cloud polling...");
    }
  }
  async enableFeedingMaintenanceAsync(aquariumUid, feedMode, command) {
    if (await this.ensureTokenAsync()) {
      const path = `/aquarium/${aquariumUid}/${command}/${feedMode ? "start" : "stop"}`;
      const result = await this.httpSendAsync(path, {}, "POST");
      if (result) {
        this.adapter.log.info(`Feeding mode for aquarium ${aquariumUid} set to ${feedMode}`);
      } else {
        this.adapter.log.error(`Failed to set feeding mode for aquarium ${aquariumUid} to ${feedMode}`);
      }
    }
  }
  async connectAsync() {
    const payload = new URLSearchParams({
      grant_type: "password",
      username: this.username,
      password: this.password
    });
    return await this.requestTokenAsync(payload);
  }
  async refreshTokenAsync() {
    if (!this.refreshToken) {
      this.adapter.log.warn("No refresh token available.");
      return false;
    }
    const payload = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.refreshToken
    });
    return await this.requestTokenAsync(payload);
  }
  async requestTokenAsync(payload) {
    try {
      const url = `https://${this.ip}/oauth/token`;
      const headers = {
        Authorization: "Basic Z0ZqSHRKcGE6Qzlmb2d3cmpEV09SVDJHWQ==",
        "Content-Type": "application/x-www-form-urlencoded"
      };
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: payload.toString()
      });
      const text = await response.text();
      if (!response.ok) {
        this.adapter.log.error("Token Request failed:\n" + text);
        return false;
      }
      const json = JSON.parse(text);
      this.token = json["access_token"];
      this.tokenExpires = Date.now() + json["expires_in"] * 1e3;
      if (json["refresh_token"]) {
        this.refreshToken = json["refresh_token"];
      }
      this.headers["Authorization"] = `Bearer ${this.token}`;
      this.adapter.log.info("Successfully received access token.");
      return true;
    } catch (err) {
      this.adapter.log.error("Token Request Error:" + err);
      return false;
    }
  }
  async ensureTokenAsync() {
    const now = Date.now();
    if (this.token) {
      if (this.token && now < this.tokenExpires - 3e4) {
        return true;
      }
      if (this.refreshToken) {
        const ok = await this.refreshTokenAsync();
        if (ok) return true;
        this.adapter.log.warn("Refresh token expired or invalid.");
      }
    }
    if (!await this.connectAsync()) {
      this.adapter.log.error("New authetification failed. Check username and/or password.");
      return false;
    }
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefCloud
});
//# sourceMappingURL=reefCloud.js.map
