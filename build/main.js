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
var main_exports = {};
__export(main_exports, {
  ReefBeat: () => ReefBeat
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_reefAto = require("./reefAto");
var import_reefDose = require("./reefDose");
var import_reefMat = require("./reefMat");
var import_reefRun = require("./reefRun");
class ReefBeat extends utils.Adapter {
  intervalHandle;
  reefMat;
  reefAto;
  reefRun;
  reefDose;
  constructor(options = {}) {
    super({
      ...options,
      name: "reef-beat"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    this.reefMat = new import_reefMat.ReefMat(this.config.ipReefMat, this);
    this.reefAto = new import_reefAto.ReefAto(this.config.ipReefAto, this);
    this.reefRun = new import_reefRun.ReefRun(this.config.ipReefRun, this);
    this.reefDose = new import_reefDose.ReefDose(this.config.ipReefDose, this);
    await this.startPolling();
    this.intervalHandle = setInterval(
      async () => {
        await this.startPolling();
      },
      this.config.localPollingInterval * 60 * 1e3
    );
  }
  async startPolling() {
    this.log.info("Start polling...");
    await this.reefMat.pollBasicDataAsync();
    await this.reefAto.pollBasicDataAsync();
    await this.reefRun.pollBasicDataAsync();
    await this.reefDose.pollBasicDataAsync();
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      if (this.intervalHandle) {
        clearInterval(this.intervalHandle);
        this.log.debug("Polling-Timer gestoppt");
      }
      callback();
    } catch (_e) {
      callback();
    }
  }
  /**
   * Is called if a subscribed state changes
   */
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new ReefBeat(options);
} else {
  (() => new ReefBeat())();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefBeat
});
//# sourceMappingURL=main.js.map
