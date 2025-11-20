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
var reefMat_exports = {};
__export(reefMat_exports, {
  ReefMat: () => ReefMat
});
module.exports = __toCommonJS(reefMat_exports);
var import_reefBeatApi = require("./reefBeatApi");
class ReefMat extends import_reefBeatApi.ReefBeatApi {
  MAT_MIN_ROLL_DIAMETER = 50;
  MAT_MAX_ROLL_DIAMETERS = {
    modelA: 200,
    modelB: 180
  };
  MAT_ROLL_THICKNESS = 5;
  constructor(ip, adapter, helper) {
    super(ip, false, adapter, helper);
    this.localCapabilities.push("configuration");
    this.adapter.log.info("ReefMat initialized.");
  }
  async newRollAsync() {
    const config = await this.getDataAsync("/configuration");
    const model = (config == null ? void 0 : config.model) || "modelA";
    let diameter = 0;
    let name;
    let isPartial;
    if (diameter === this.MAT_MIN_ROLL_DIAMETER) {
      name = "New Roll";
      isPartial = false;
      diameter = this.MAT_MAX_ROLL_DIAMETERS[model] || this.MAT_MAX_ROLL_DIAMETERS["modelA"];
    } else {
      name = "Started Roll";
      isPartial = true;
    }
    const payload = {
      external_diameter: diameter,
      name,
      thickness: this.MAT_ROLL_THICKNESS,
      is_partial: isPartial
    };
    const success = await this.httpSendAsync("/new-roll", payload, "POST");
    if (success) {
      this.adapter.log.info(`ReefMat: Befehl 'New Roll' erfolgreich an ${this.ip} gesendet.`);
    } else {
      this.adapter.log.error(`ReefMat: Befehl 'New Roll' fehlgeschlagen.`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefMat
});
//# sourceMappingURL=reefMat.js.map
