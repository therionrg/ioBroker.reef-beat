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
var IoBrokerHelper_exports = {};
__export(IoBrokerHelper_exports, {
  IoBrokerHelper: () => IoBrokerHelper
});
module.exports = __toCommonJS(IoBrokerHelper_exports);
class IoBrokerHelper {
  adapter;
  constructor(adapter) {
    this.adapter = adapter;
  }
  async ensureStateAsync(id, name, type, role, write = false, read = true) {
    await this.adapter.setObjectNotExistsAsync(id, {
      type: "state",
      common: {
        name,
        type,
        role,
        read,
        write
      },
      native: {}
    });
    this.adapter.subscribeStates(id);
  }
  async ensureStateWithChannelAsync(id, name, type, role, write = false, read = true) {
    const parts = id.split(".");
    if (parts.length > 1) {
      const channelId = parts.slice(0, -1).join(".");
      await this.adapter.setObjectNotExistsAsync(channelId, {
        type: "channel",
        common: { name: channelId },
        native: {}
      });
    }
    await this.ensureStateAsync(id, name, type, role, write, read);
  }
  async setAckedStateAsync(id, value) {
    await this.adapter.setStateAsync(id, { val: value, ack: true });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IoBrokerHelper
});
//# sourceMappingURL=IoBrokerHelper.js.map
