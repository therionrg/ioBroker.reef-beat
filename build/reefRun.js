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
var reefRun_exports = {};
__export(reefRun_exports, {
  ReefRun: () => ReefRun
});
module.exports = __toCommonJS(reefRun_exports);
var import_reefBeatApi = require("./reefBeatApi");
class ReefRun extends import_reefBeatApi.ReefBeatApi {
  constructor(ip, adapter) {
    super(ip, false, adapter);
    this.data.sources.push({
      name: "/configuration",
      type: "config",
      data: null
    });
  }
  async pushValuesAsync() {
    var _a;
    const config = await this.getDataAsync("/configuration");
    const payload = {
      auto_fill: (_a = config == null ? void 0 : config.auto_fill) != null ? _a : false
    };
    await this.httpSendAsync("/configuration", payload, "PUT");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReefRun
});
//# sourceMappingURL=reefRun.js.map
