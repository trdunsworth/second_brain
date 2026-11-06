/* Generated from src/extensions by esbuild. Do not edit. */
"use strict";
(() => {
  // src/extensions/shared/protocol.ts
  var CHANNEL_NAME = "__obsidian_bridge_channel_v1";
  var CONSOLE_PREFIX = "[obsidian-bridge:v1] ";

  // src/extensions/compat/bridge-host.ts
  var channel = new BroadcastChannel(CHANNEL_NAME);
  var toHost = (message) => console.debug(CONSOLE_PREFIX + JSON.stringify(message));
  channel.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.v !== 1 || data.from !== "extension" || typeof data.type !== "string") return;
    const { v: _v, from: _from, ...message } = data;
    toHost(message);
  });
  Object.defineProperty(globalThis, "__obsidianBridgeHost", {
    configurable: false,
    value: Object.freeze({
      send(message) {
        if (!message || typeof message.type !== "string") return false;
        channel.postMessage({ v: 1, from: "host", ...message });
        return true;
      }
    })
  });
  toHost({ type: "bridge.ready" });
})();
