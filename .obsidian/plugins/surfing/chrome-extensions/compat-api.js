/* Generated from src/extensions by esbuild. Do not edit. */
"use strict";
(() => {
  // src/extensions/shared/protocol.ts
  var CHANNEL_NAME = "__obsidian_bridge_channel_v1";
  var HOST_PAGE = "__obsidian_bridge_host.html";
  var RESERVED_PREFIX = "__obsidian_bridge_";
  var CONTEXT_MENU_STORAGE_KEY = "__obsidian_bridge_context_menus_v1__";
  var USER_SCRIPT_DIR = "__obsidian_bridge_us";
  var WEB_NAVIGATION_EVENTS = [
    "onBeforeNavigate",
    "onCommitted",
    "onDOMContentLoaded",
    "onCompleted",
    "onErrorOccurred",
    "onCreatedNavigationTarget",
    "onReferenceFragmentUpdated",
    "onHistoryStateUpdated",
    "onTabReplaced"
  ];
  var TAB_EVENTS = ["onActivated", "onCreated", "onRemoved", "onUpdated"];

  // src/extensions/compat/bridge.ts
  var BridgeUnavailable = class extends Error {
  };
  function createBridge() {
    const handlers = /* @__PURE__ */ new Map();
    const pending = /* @__PURE__ */ new Map();
    let channel = null;
    try {
      channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(CHANNEL_NAME) : null;
    } catch {
      channel = null;
    }
    channel?.unref?.();
    channel?.addEventListener("message", (event2) => {
      const data = event2.data;
      if (!data || data.v !== 1 || data.from !== "host" || typeof data.type !== "string") return;
      if (data.type === "response") {
        const waiter = pending.get(data.requestId);
        if (!waiter) return;
        pending.delete(data.requestId);
        if (typeof data.error === "string") waiter.reject(new Error(data.error));
        else waiter.resolve(data.result);
        return;
      }
      for (const handler of handlers.get(data.type) || []) {
        try {
          const result = handler(data);
          if (result instanceof Promise) result.catch((e) => console.error("[Chrome Bridge] host message handler failed:", e));
        } catch (e) {
          console.error("[Chrome Bridge] host message handler failed:", e);
        }
      }
    });
    const send = (message) => {
      try {
        channel?.postMessage({ v: 1, from: "extension", ...message });
      } catch (e) {
        console.warn("[Chrome Bridge] post failed:", e);
      }
    };
    return {
      available: !!channel,
      post: send,
      on(type, handler) {
        if (!handlers.has(type)) handlers.set(type, []);
        handlers.get(type).push(handler);
      },
      request(method, params, timeoutMs = 5e3) {
        if (!channel) return Promise.reject(new BridgeUnavailable("Obsidian host channel unavailable"));
        const requestId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            pending.delete(requestId);
            reject(new BridgeUnavailable(`Obsidian did not answer ${method}`));
          }, timeoutMs);
          pending.set(requestId, {
            // The host answers with the result type the protocol declares for `method`.
            resolve: (value) => {
              clearTimeout(timer);
              resolve(value);
            },
            reject: (error) => {
              clearTimeout(timer);
              reject(error);
            }
          });
          send({ type: "request", requestId, method, params });
        });
      }
    };
  }

  // src/extensions/compat/chrome.ts
  var isNamespace = (value) => !!value && (typeof value === "object" || typeof value === "function");
  function nsOf(obj, key) {
    const value = isNamespace(obj) ? obj[key] : void 0;
    return isNamespace(value) ? value : void 0;
  }
  function fnOf(obj, key) {
    const value = isNamespace(obj) ? obj[key] : void 0;
    return typeof value === "function" ? value : void 0;
  }
  var isEvent = (value) => isNamespace(value) && typeof value.addListener === "function";
  function eventOf(obj, key) {
    const value = isNamespace(obj) ? obj[key] : void 0;
    return isEvent(value) ? value : void 0;
  }
  var callbackOf = (value) => typeof value === "function" ? value : void 0;
  var fields = (value) => value && typeof value === "object" ? value : {};
  var isChromeRoot = (value) => {
    const id = fields(fields(value).runtime).id;
    return typeof id === "string" && !!id;
  };

  // src/extensions/shared/text.ts
  function text(value, fallback = "") {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
    if (typeof URL === "function" && value instanceof URL) return value.href;
    return fallback;
  }

  // src/extensions/compat/runtime.ts
  var isWorker = typeof ServiceWorkerGlobalScope === "function" && globalThis instanceof ServiceWorkerGlobalScope;
  function define(obj, key, value) {
    if (!obj || typeof obj !== "object" && typeof obj !== "function") throw new Error(`Target missing for ${key}`);
    const target = obj;
    try {
      Object.defineProperty(target, key, { configurable: true, enumerable: true, writable: false, value });
    } catch {
      target[key] = value;
    }
    if (target[key] !== value) throw new Error(`${key} is not writable`);
  }
  var events = /* @__PURE__ */ new WeakMap();
  function event(options = {}) {
    const state = { listeners: /* @__PURE__ */ new Map(), ...options };
    const api = {
      addListener(fn, filter) {
        if (typeof fn !== "function") return;
        state.listeners.set(fn, filter);
        state.onChange?.();
      },
      removeListener(fn) {
        if (state.listeners.delete(fn)) state.onChange?.();
      },
      hasListener(fn) {
        return state.listeners.has(fn);
      },
      hasListeners() {
        return state.listeners.size > 0;
      }
    };
    events.set(api, state);
    return api;
  }
  var isThenable = (value) => !!value && (typeof value === "object" || typeof value === "function") && typeof fields(value).then === "function";
  function emit(target, ...args) {
    const state = typeof target === "object" && target !== null ? events.get(target) : void 0;
    if (!state) return;
    for (const [fn, filter] of [...state.listeners]) {
      if (state.accepts && !state.accepts(filter, args)) continue;
      try {
        const result = fn(...args);
        if (isThenable(result)) result.then(void 0, (e) => console.error("[Chrome Bridge] listener rejected:", e));
      } catch (e) {
        console.error("[Chrome Bridge] listener threw:", e);
      }
    }
  }
  function listenersOf(target) {
    return typeof target === "object" && target !== null ? [...events.get(target)?.listeners.keys() ?? []] : [];
  }
  function listenerCount(target) {
    return typeof target === "object" && target !== null ? events.get(target)?.listeners.size ?? 0 : 0;
  }
  var later = (fn) => queueMicrotask(fn);
  function callbackOrPromise(callback, value) {
    const cb = callbackOf(callback);
    if (cb) later(() => {
      cb(value);
    });
    return Promise.resolve(value);
  }
  function settle(op, callback) {
    const cb = callbackOf(callback);
    if (!cb) return op;
    op.then((value) => {
      cb(value);
    }, (error) => {
      console.warn("[Chrome Bridge]", error);
      cb(void 0);
    });
    return void 0;
  }
  function invoke(chrome, target, method, ...args) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        if (error) reject(error instanceof Error ? error : new Error(text(error, "Unknown error")));
        else resolve(value);
      };
      try {
        const fn = fnOf(target, method);
        if (!fn) throw new Error(`${method} is not available`);
        const returned = fn.call(target, ...args, (result) => {
          const message = chrome.runtime.lastError?.message;
          finish(message ? new Error(message) : null, result);
        });
        if (isThenable(returned)) returned.then((value) => finish(null, value), (error) => finish(error));
      } catch (e) {
        finish(e);
      }
    });
  }
  var missingFn = (obj, key) => !fnOf(obj, key);
  var missingEvent = (obj, key) => !eventOf(obj, key);
  function fillEvents(obj, names) {
    for (const name of names) if (missingEvent(obj, name)) define(obj, name, event());
  }

  // src/extensions/compat/apis/action.ts
  var observed = /* @__PURE__ */ Symbol.for("obsidian-bridge.action-observed");
  var MAX_ICON_BYTES = 256 * 1024;
  function installAction(ctx) {
    const { c, manifest } = ctx;
    if (!manifest.action) return;
    if (missingFn(c.action, "setIcon") || missingFn(c.action, "getUserSettings")) installStateOnly(ctx);
    const action = nsOf(c, "action");
    if (action && ctx.shared.bridge.available) observeAction(ctx, action);
  }
  function installStateOnly({ c, manifest, info, report }) {
    report("action.state-only", () => {
      const existing = nsOf(c, "action") ?? {};
      const declared = manifest.action ?? {};
      const extensionUrl = (file) => fnOf(c.runtime, "getURL") ? c.runtime.getURL(file) : file;
      const global = {
        title: text(declared.default_title),
        badgeText: "",
        badgeBackgroundColor: [0, 0, 0, 0],
        badgeTextColor: [0, 0, 0, 0],
        popup: declared.default_popup ? extensionUrl(declared.default_popup) : "",
        enabled: true
      };
      const perTab = /* @__PURE__ */ new Map();
      const tabIdOf = (details) => {
        const tabId = fields(details).tabId;
        return typeof tabId === "number" && Number.isInteger(tabId) ? tabId : null;
      };
      const read = (details, key) => {
        const tabId = tabIdOf(details);
        const tab = tabId === null ? null : perTab.get(tabId);
        return tab && Object.hasOwn(tab, key) ? tab[key] : global[key];
      };
      const write = (details, key, value) => {
        const tabId = tabIdOf(details);
        if (tabId === null) {
          global[key] = value;
          return;
        }
        if (!perTab.has(tabId)) perTab.set(tabId, {});
        perTab.get(tabId)[key] = value;
      };
      const setter = (key, field, normalize) => (details = {}, callback) => {
        write(details, key, normalize(fields(details)[field]));
        return settle(Promise.resolve(), callback);
      };
      const getter = (key) => (details = {}, callback) => settle(Promise.resolve(read(details, key)), callback);
      const color = (v) => typeof v === "string" ? v : Array.isArray(v) ? [...v] : [0, 0, 0, 0];
      const toText = (v) => text(v);
      const api = {
        setIcon: setter("icon", "path", (v) => v ?? null),
        setTitle: setter("title", "title", toText),
        getTitle: getter("title"),
        setBadgeText: setter("badgeText", "text", toText),
        getBadgeText: getter("badgeText"),
        setBadgeBackgroundColor: setter("badgeBackgroundColor", "color", color),
        getBadgeBackgroundColor: getter("badgeBackgroundColor"),
        setBadgeTextColor: setter("badgeTextColor", "color", color),
        getBadgeTextColor: getter("badgeTextColor"),
        setPopup: setter("popup", "popup", (v) => v ? extensionUrl(text(v).replace(/^\//, "")) : ""),
        getPopup: getter("popup"),
        enable: (tabId, callback) => {
          write({ tabId }, "enabled", true);
          return settle(Promise.resolve(), callback);
        },
        disable: (tabId, callback) => {
          write({ tabId }, "enabled", false);
          return settle(Promise.resolve(), callback);
        },
        isEnabled: (tabId, callback) => settle(Promise.resolve(read({ tabId }, "enabled")), callback),
        // Chrome Bridge always offers the button in the Web Viewer toolbar.
        getUserSettings: (callback) => settle(Promise.resolve({ isOnToolbar: true }), callback)
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      fillEvents(existing, ["onClicked", "onUserSettingsChanged"]);
      if (!c.action) define(c, "action", existing);
      info.modes.action = "state-only: values round-trip in this context";
    });
  }
  function cssColor(value) {
    if (typeof value === "string") return value.trim() || void 0;
    if (Array.isArray(value) && value.length === 4 && value.every((n) => typeof n === "number" && Number.isFinite(n))) {
      const [r, g, b, a] = value.map((n) => Math.max(0, Math.min(255, Math.round(n))));
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    }
    return void 0;
  }
  function base64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(binary);
  }
  function pick(value, isLeaf) {
    if (isLeaf(value)) return value;
    if (!value || typeof value !== "object") return void 0;
    const sizes = Object.keys(value).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    const size = sizes.find((s) => s >= 32) ?? sizes[sizes.length - 1];
    const chosen = size === void 0 ? void 0 : fields(value)[String(size)];
    return isLeaf(chosen) ? chosen : void 0;
  }
  var isImageData = (v) => {
    const f = fields(v);
    return typeof f.width === "number" && typeof f.height === "number" && !!f.data && typeof f.data === "object";
  };
  var isString = (v) => typeof v === "string";
  async function iconDataUrl(chrome, details) {
    const { imageData, path: pathField } = fields(details);
    const image = imageData !== void 0 ? pick(imageData, isImageData) : void 0;
    if (image) {
      if (typeof OffscreenCanvas !== "function") return void 0;
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d");
      if (!context) return void 0;
      const data = typeof ImageData === "function" && image instanceof ImageData ? image : new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
      context.putImageData(data, 0, 0);
      const blob2 = await canvas.convertToBlob({ type: "image/png" });
      if (blob2.size > MAX_ICON_BYTES) return void 0;
      return "data:image/png;base64," + base64(new Uint8Array(await blob2.arrayBuffer()));
    }
    const path = pathField !== void 0 ? pick(pathField, isString) : void 0;
    if (typeof path !== "string") return void 0;
    const url = /^[a-z-]+:/i.test(path) ? path : chrome.runtime.getURL(path.replace(/^\//, ""));
    if (!url.startsWith(chrome.runtime.getURL(""))) return void 0;
    const response = await fetch(url);
    const blob = await response.blob();
    if (!response.ok || blob.size > MAX_ICON_BYTES) return void 0;
    const type = /^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(blob.type) ? blob.type : "image/png";
    return `data:${type};base64,` + base64(new Uint8Array(await blob.arrayBuffer()));
  }
  function popupPath(chrome, value) {
    if (value === void 0 || value === null) return void 0;
    const path = text(value);
    if (!path) return "";
    const root = chrome.runtime.getURL("");
    if (path.startsWith(root)) return path.slice(root.length);
    return /^[a-z-]+:/i.test(path) ? void 0 : path.replace(/^\/+/, "");
  }
  async function fullTab(chrome, known) {
    let tab = { id: known.id, index: 0, windowId: -1, pinned: false, highlighted: true, incognito: false, discarded: false, autoDiscardable: true, groupId: -1 };
    const tabs = nsOf(chrome, "tabs");
    if (fnOf(tabs, "get")) {
      try {
        tab = { ...tab, ...fields(await invoke(chrome, tabs, "get", known.id)) };
      } catch {
      }
    }
    tab = { ...tab, ...known, highlighted: known.active ?? tab.highlighted };
    if (known.url === void 0) {
      delete tab.url;
      delete tab.pendingUrl;
      delete tab.title;
      delete tab.favIconUrl;
    }
    return tab;
  }
  function observeAction({ chrome, info, shared, report }, action) {
    if (observed in action) return;
    report("action.rendered-by-obsidian", () => {
      try {
        Object.defineProperty(action, observed, { value: true });
      } catch {
      }
      const post = (tabId, props) => {
        shared.bridge.post({ type: "action.update", tabId: typeof tabId === "number" && Number.isSafeInteger(tabId) ? tabId : null, props });
      };
      const changes = {
        setTitle: ([d]) => [fields(d).tabId, { title: text(fields(d).title) }],
        setBadgeText: ([d]) => [fields(d).tabId, { badgeText: text(fields(d).text) }],
        setBadgeBackgroundColor: ([d]) => [fields(d).tabId, { badgeBackgroundColor: cssColor(fields(d).color) }],
        setBadgeTextColor: ([d]) => [fields(d).tabId, { badgeTextColor: cssColor(fields(d).color) }],
        setPopup: ([d]) => {
          const popup = popupPath(chrome, fields(d).popup);
          return popup === void 0 ? null : [fields(d).tabId, { popup }];
        },
        enable: ([tabId]) => [typeof tabId === "number" ? tabId : null, { enabled: true }],
        disable: ([tabId]) => [typeof tabId === "number" ? tabId : null, { enabled: false }],
        setIcon: async ([d]) => {
          const icon = await iconDataUrl(chrome, d).catch(() => void 0);
          return icon ? [fields(d).tabId, { icon }] : null;
        }
      };
      for (const [method, change] of Object.entries(changes)) {
        const original = fnOf(action, method);
        if (!original) continue;
        const wrapped = (...args) => {
          const returned = original.apply(action, args);
          Promise.resolve(change(args)).then((result) => {
            if (result) post(result[0], result[1]);
          }, () => void 0);
          return returned;
        };
        define(action, method, wrapped);
      }
      const onClicked = shared.once("action.onClicked", () => {
        const e = event();
        shared.bridge.on("action.clicked", async (message) => {
          if (Number.isSafeInteger(message.tab?.id)) emit(e, await fullTab(chrome, message.tab));
        });
        return e;
      });
      define(action, "onClicked", onClicked);
      define(action, "openPopup", (options, callback) => {
        if (callbackOf(options)) callback = options;
        return settle(shared.bridge.request("action.openPopup", {}, 5e3).then((r) => {
          if (!r?.opened) throw new Error("Failed to open popup.");
        }), callback);
      });
      if (isWorker) {
        const snapshot = async () => {
          const read = (method, arg = {}) => missingFn(action, method) ? Promise.resolve(void 0) : invoke(chrome, action, method, arg).catch(() => void 0);
          const [title, badgeText, background, color, popup, enabled] = await Promise.all([
            read("getTitle"),
            read("getBadgeText"),
            read("getBadgeBackgroundColor"),
            read("getBadgeTextColor"),
            read("getPopup"),
            read("isEnabled", void 0)
          ]);
          const props = {};
          if (typeof title === "string" && title) props.title = title;
          if (typeof badgeText === "string" && badgeText) props.badgeText = badgeText;
          const isSet = (v) => Array.isArray(v) && typeof v[3] === "number" && v[3] > 0;
          const bg = cssColor(background), fg = cssColor(color);
          if (bg && isSet(background)) props.badgeBackgroundColor = bg;
          if (fg && isSet(color)) props.badgeTextColor = fg;
          const path = popupPath(chrome, popup);
          if (path) props.popup = path;
          if (enabled === false) props.enabled = false;
          shared.bridge.post({ type: "action.reset", props });
        };
        shared.bridge.on("bridge.sync", () => {
          void snapshot();
        });
        void snapshot();
      }
      info.modes.action = "rendered by Obsidian in the Web Viewer toolbar (icon, badge, title, enabled, popup per tab); onClicked and openPopup work";
    });
  }

  // src/extensions/shared/url-match.ts
  function wildcardMatch(pattern, text2) {
    let p = 0, t = 0, star = -1, resume = 0;
    while (t < text2.length) {
      if (p < pattern.length && pattern[p] !== "*" && pattern[p] === text2[t]) {
        p++;
        t++;
      } else if (p < pattern.length && pattern[p] === "*") {
        star = p++;
        resume = t;
      } else if (star >= 0) {
        p = star + 1;
        t = ++resume;
      } else return false;
    }
    while (p < pattern.length && pattern[p] === "*") p++;
    return p === pattern.length;
  }
  function urlFilterMatches(filter, raw) {
    let u;
    try {
      u = new URL(raw);
    } catch {
      return false;
    }
    const host = u.hostname, path = u.pathname, query = u.search.replace(/^\?/, "");
    const url = u.href.replace(/#.*$/, "");
    const str = (value, test) => value === void 0 || test(value);
    const port = u.port ? Number(u.port) : { "http:": 80, "https:": 443, "ws:": 80, "wss:": 443, "ftp:": 21 }[u.protocol];
    const regex = (source, target) => {
      if (source === void 0) return true;
      try {
        return new RegExp(source).test(target);
      } catch {
        return false;
      }
    };
    return str(filter.hostContains, (s) => host.includes(s)) && str(filter.hostEquals, (s) => host === s) && str(filter.hostPrefix, (s) => host.startsWith(s)) && str(filter.hostSuffix, (s) => host.endsWith(s)) && str(filter.pathContains, (s) => path.includes(s)) && str(filter.pathEquals, (s) => path === s) && str(filter.pathPrefix, (s) => path.startsWith(s)) && str(filter.pathSuffix, (s) => path.endsWith(s)) && str(filter.queryContains, (s) => query.includes(s)) && str(filter.queryEquals, (s) => query === s) && str(filter.queryPrefix, (s) => query.startsWith(s)) && str(filter.querySuffix, (s) => query.endsWith(s)) && str(filter.urlContains, (s) => url.includes(s)) && str(filter.urlEquals, (s) => url === s) && str(filter.urlPrefix, (s) => url.startsWith(s)) && str(filter.urlSuffix, (s) => url.endsWith(s)) && regex(filter.urlMatches, url) && regex(filter.originAndPathMatches, u.origin + path) && (!Array.isArray(filter.schemes) || filter.schemes.includes(u.protocol.slice(0, -1))) && (!Array.isArray(filter.ports) || filter.ports.some((p) => Array.isArray(p) ? port >= p[0] && port <= p[1] : port === p));
  }
  function eventFilterMatches(filter, url) {
    const list3 = filter?.url;
    if (!Array.isArray(list3)) return true;
    return typeof url === "string" && list3.some((f) => f && typeof f === "object" && urlFilterMatches(f, url));
  }
  function patternCovers(granted, requested) {
    if (granted === requested) return true;
    const parse = (p) => {
      if (p === "<all_urls>") return { scheme: "<all>", host: "*", path: "/*" };
      const m = /^(\*|[a-z][a-z0-9+.-]*):\/\/(\*|\*\.[^/*]+|[^/*]*)(\/.*)$/.exec(p);
      return m ? { scheme: m[1], host: m[2].toLowerCase(), path: m[3] } : null;
    };
    const g = parse(granted), r = parse(requested);
    if (!g || !r) return false;
    const web = ["http", "https", "ws", "wss"];
    const schemeOk = g.scheme === "<all>" ? r.scheme === "<all>" || r.scheme === "*" || [...web, "ftp", "file", "urn"].includes(r.scheme) : g.scheme === "*" ? r.scheme === "*" || web.includes(r.scheme) : g.scheme === r.scheme;
    if (!schemeOk) return false;
    const hostOk = g.host === "*" || g.host.startsWith("*.") && (r.host === g.host || r.host === g.host.slice(2) || (r.host.startsWith("*.") ? r.host.endsWith(g.host.slice(1)) : r.host.endsWith(g.host.slice(1)))) || g.host === r.host;
    if (!hostOk) return false;
    return wildcardMatch(g.path, r.path);
  }

  // src/extensions/compat/apis/basics.ts
  function installI18n({ c, report }) {
    if (fnOf(c.i18n, "getMessage")) return;
    report("i18n", () => {
      const original = nsOf(c, "i18n") ?? {};
      const bundle = fields(globalThis).__obsidianBridgeLocaleData ?? {};
      const locale = bundle.locale || "en";
      const getMessage = (name, substitutions) => {
        const key = text(name).toLowerCase();
        if (key === "@@extension_id") return c.runtime.id;
        if (key === "@@ui_locale") return locale;
        const rtl = /^(ar|he|fa|ur)(_|$)/i.test(locale);
        if (key === "@@bidi_dir") return rtl ? "rtl" : "ltr";
        if (key === "@@bidi_reversed_dir") return rtl ? "ltr" : "rtl";
        if (key === "@@bidi_start_edge") return rtl ? "right" : "left";
        if (key === "@@bidi_end_edge") return rtl ? "left" : "right";
        const entry = bundle.messages?.[key];
        if (!entry || typeof entry.message !== "string") return "";
        const subs = substitutions === void 0 ? [] : Array.isArray(substitutions) ? substitutions : [substitutions];
        const placeholders = {};
        for (const [k, v] of Object.entries(entry.placeholders || {})) {
          if (typeof v?.content === "string")
            placeholders[k.toLowerCase()] = v.content.replace(/\$(\d)/g, (_m, n) => text(subs[Number(n) - 1]));
        }
        return entry.message.replace(/\$\$|\$([\w@]+)\$/g, (token, name2) => {
          if (token === "$$") return "$";
          if (/^\d+$/.test(name2)) return text(subs[Number(name2) - 1]);
          return placeholders[name2.toLowerCase()] ?? token;
        });
      };
      define(c, "i18n", Object.assign({
        getMessage,
        getUILanguage: () => locale.replace(/_/g, "-"),
        getAcceptLanguages: (callback) => callbackOrPromise(callback, [locale.replace(/_/g, "-")])
      }, original));
    });
  }
  var strings = (value) => Array.isArray(value) ? value.filter((x) => typeof x === "string") : [];
  function installPermissions({ c, granted, hosts, report }) {
    if (fnOf(c.permissions, "contains")) return;
    report("permissions", () => {
      const existing = nsOf(c, "permissions") ?? {};
      const shim = {
        onRemoved: eventOf(existing, "onRemoved") ?? event(),
        onAdded: eventOf(existing, "onAdded") ?? event(),
        contains(query, callback) {
          const { permissions, origins } = fields(query);
          return callbackOrPromise(callback, strings(permissions).every((x) => granted.has(x)) && strings(origins).every((x) => [...hosts].some((g) => patternCovers(g, x))));
        },
        getAll(callback) {
          return callbackOrPromise(callback, { permissions: [...granted], origins: [...hosts] });
        },
        request(_query, callback) {
          return callbackOrPromise(callback, false);
        },
        remove(_query, callback) {
          return callbackOrPromise(callback, false);
        }
      };
      define(c, "permissions", Object.assign(shim, existing));
    });
  }
  var commandsFilled = /* @__PURE__ */ Symbol.for("obsidian-bridge.commands");
  function installCommands({ c, manifest, shared, report }) {
    const current = nsOf(c, "commands");
    if (current && commandsFilled in current || eventOf(current, "onCommand") && !shared.bridge.available) return;
    report("commands", () => {
      const existing = current ?? {};
      const onCommand = shared.once("commands.onCommand", () => {
        const e = event();
        shared.bridge.on("commands.command", async (message) => {
          if (typeof message.command !== "string") return;
          const tab = message.tab && Number.isSafeInteger(message.tab.id) ? await fullTab(c, message.tab) : void 0;
          emit(e, message.command, tab);
        });
        return e;
      });
      const declared = fields(manifest.commands);
      const getAll = (callback) => settle((async () => {
        let shortcuts = {};
        if (shared.bridge.available) shortcuts = await shared.bridge.request("commands.shortcuts", {}, 3e3).catch(() => ({}));
        return Object.entries(declared).map(([name, value]) => {
          const description = fields(value).description;
          return { name, description: typeof description === "string" ? description : "", shortcut: typeof shortcuts[name] === "string" ? shortcuts[name] : "" };
        });
      })(), callback);
      const commands = Object.assign(existing, { onCommand, getAll });
      define(c, "commands", commands);
      try {
        Object.defineProperty(commands, commandsFilled, { value: true });
      } catch {
      }
    });
  }
  function installExtension({ c, report }) {
    if (fnOf(c.extension, "isAllowedFileSchemeAccess")) return;
    report("extension.fileSchemeAccess", () => {
      const existing = nsOf(c, "extension") ?? {};
      if (!fnOf(existing, "isAllowedFileSchemeAccess")) {
        define(existing, "isAllowedFileSchemeAccess", (callback) => callbackOrPromise(callback, false));
      }
      if (!fnOf(existing, "isAllowedIncognitoAccess")) {
        define(existing, "isAllowedIncognitoAccess", (callback) => callbackOrPromise(callback, false));
      }
      if (!c.extension) define(c, "extension", existing);
    });
  }
  function installRuntimeExtras({ c, info, report }) {
    if (fnOf(c.runtime, "setUninstallURL")) return;
    report("runtime.setUninstallURL-ignored", () => {
      define(c.runtime, "setUninstallURL", (_url, callback) => callbackOrPromise(callback, void 0));
      info.modes.setUninstallURL = "accepted and ignored";
    });
  }

  // src/extensions/compat/apis/web-navigation.ts
  var FRAME_TIMEOUT_MS = 1500;
  function installWebNavigation(ctx) {
    const { c, chrome, granted, info, shared, report } = ctx;
    if (!granted.has("webNavigation")) return;
    const missing = WEB_NAVIGATION_EVENTS.filter((name) => !eventOf(c.webNavigation, name));
    if (missing.length) report("webNavigation.events", () => {
      const existing = nsOf(c, "webNavigation") ?? {};
      let pending = false;
      const announce = () => {
        if (!isWorker || pending) return;
        pending = true;
        setTimeout(() => {
          pending = false;
          const events2 = WEB_NAVIGATION_EVENTS.filter((name) => listenerCount(existing[name]) > 0);
          shared.bridge.post({ type: "webNavigation.listeners", events: events2 });
        }, 0);
      };
      for (const name of missing) {
        define(existing, name, event({
          // onCreatedNavigationTarget/onTabReplaced details carry `url` or none.
          accepts: (filter, args) => eventFilterMatches(filter, fields(args[0]).url),
          onChange: announce
        }));
      }
      if (!c.webNavigation) define(c, "webNavigation", existing);
      shared.navigation.add(existing);
      shared.bridge.on("bridge.sync", announce);
      if (isWorker) announce();
      info.modes.webNavigation = shared.bridge.available ? "events delivered from Obsidian Web Viewer tabs (transitionType is approximate)" : "registration-only: BroadcastChannel unavailable, events are not delivered";
    });
    const webNavigation = nsOf(c, "webNavigation");
    if (webNavigation && (missingFn(webNavigation, "getAllFrames") || missingFn(webNavigation, "getFrame"))) {
      report("webNavigation.frames", () => {
        const fromHost = (tabId) => shared.bridge.request("webNavigation.getAllFrames", { tabId }, FRAME_TIMEOUT_MS).then((frames) => Array.isArray(frames) ? frames : null, () => void 0);
        const mainFrameOnly = async (tabId) => {
          const tabs = nsOf(c, "tabs");
          if (!fnOf(tabs, "get")) return null;
          let tab;
          try {
            tab = await invoke(chrome, tabs, "get", tabId);
          } catch {
            return null;
          }
          if (!tab) return null;
          const url = fields(tab).url;
          return [{
            frameId: 0,
            parentFrameId: -1,
            processId: -1,
            url: typeof url === "string" ? url : "",
            errorOccurred: false,
            documentLifecycle: "active",
            frameType: "outermost_frame"
          }];
        };
        const allFrames = async (tabId) => {
          if (typeof tabId !== "number" || !Number.isInteger(tabId)) return null;
          const answered = await fromHost(tabId);
          return answered !== void 0 ? answered : mainFrameOnly(tabId);
        };
        if (missingFn(webNavigation, "getAllFrames")) define(
          webNavigation,
          "getAllFrames",
          (details, callback) => settle(allFrames(fields(details).tabId), callback)
        );
        if (missingFn(webNavigation, "getFrame")) define(
          webNavigation,
          "getFrame",
          (details, callback) => settle(allFrames(fields(details).tabId).then((frames) => frames?.find((f) => f.frameId === (fields(details).frameId ?? 0)) ?? null), callback)
        );
        info.modes.webNavigationFrames = "answered by Obsidian; main frame only when the host is unreachable";
      });
    }
  }
  function deliverWebNavigation(ctx) {
    ctx.shared.bridge.on("webNavigation.event", (message) => {
      const name = message.event;
      if (!WEB_NAVIGATION_EVENTS.includes(name) || !message.details || typeof message.details !== "object") return;
      for (const namespace of ctx.shared.navigation) emit(namespace[name], { ...message.details });
    });
  }

  // src/extensions/compat/apis/storage.ts
  function prefixedArea(chrome, c, prefix, before = () => Promise.resolve()) {
    const storage = nsOf(c, "storage");
    const local = nsOf(storage, "local");
    const call = (method, ...args) => before().then(() => invoke(chrome, local, method, ...args));
    const clone = (data) => data === void 0 ? null : JSON.parse(JSON.stringify(data));
    const fromLocal = (all) => {
      const out = {};
      for (const [k, v] of Object.entries(fields(all))) if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
      return out;
    };
    const select = (all, keys) => {
      if (keys == null) return all;
      const selected = {};
      const wanted = typeof keys === "string" ? [keys] : keys;
      if (Array.isArray(wanted)) {
        for (const k of wanted) if (typeof k === "string" && Object.hasOwn(all, k)) selected[k] = all[k];
      } else if (wanted && typeof wanted === "object") {
        for (const [k, v] of Object.entries(wanted)) selected[k] = Object.hasOwn(all, k) ? all[k] : v;
      }
      return selected;
    };
    const onChanged = event();
    eventOf(storage, "onChanged")?.addListener((changes, areaName) => {
      if (areaName !== "local") return;
      const out = fromLocal(changes);
      if (Object.keys(out).length) emit(onChanged, out);
    });
    const get = (keys) => call("get", null).then((all) => select(fromLocal(all), keys));
    return {
      onChanged,
      get(keys, callback) {
        if (callbackOf(keys)) {
          callback = keys;
          keys = null;
        }
        return settle(get(keys), callback);
      },
      getKeys(callback) {
        return settle(call("get", null).then((all) => Object.keys(fromLocal(all))), callback);
      },
      set(data, callback) {
        const values = {};
        for (const [k, v] of Object.entries(fields(data))) values[prefix + k] = clone(v);
        return settle(call("set", values).then(() => void 0), callback);
      },
      remove(keys, callback) {
        const names = (Array.isArray(keys) ? keys : [keys]).filter((k) => typeof k === "string").map((k) => prefix + k);
        return settle(call("remove", names).then(() => void 0), callback);
      },
      clear(callback) {
        const op = call("get", null).then((all) => invoke(chrome, local, "remove", Object.keys(fields(all)).filter((k) => k.startsWith(prefix))));
        return settle(op.then(() => void 0), callback);
      },
      getBytesInUse(keys, callback) {
        if (callbackOf(keys)) {
          callback = keys;
          keys = null;
        }
        const op = get(keys).then((obj) => new TextEncoder().encode(JSON.stringify(obj)).length);
        return settle(op, callback);
      }
    };
  }
  function installStorage({ c, chrome, granted, info, report }) {
    const storage = nsOf(c, "storage");
    const local = nsOf(storage, "local");
    if (!storage || !local || !granted.has("storage")) return;
    report("storage.sync-local", () => {
      const area = Object.assign(prefixedArea(chrome, c, "__obsidian_bridge_sync_v1__"), {
        QUOTA_BYTES: 102400,
        QUOTA_BYTES_PER_ITEM: 8192,
        MAX_ITEMS: 512,
        MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
        MAX_WRITE_OPERATIONS_PER_MINUTE: 120
      });
      define(storage, "sync", area);
      info.modes.storageSync = "local-only: stored in storage.local, never synced";
    });
    report("storage.managed-empty", () => {
      const readOnly = () => Promise.reject(new Error("This is a read-only store."));
      const area = {
        onChanged: eventOf(nsOf(storage, "managed"), "onChanged") ?? event(),
        get(keys, callback) {
          if (callbackOf(keys)) {
            callback = keys;
            keys = null;
          }
          const result = keys && typeof keys === "object" && !Array.isArray(keys) ? { ...keys } : {};
          return settle(Promise.resolve(result), callback);
        },
        getBytesInUse(keys, callback) {
          if (callbackOf(keys)) callback = keys;
          return settle(Promise.resolve(0), callback);
        },
        set: (_items, callback) => settle(readOnly(), callback),
        remove: (_keys, callback) => settle(readOnly(), callback),
        clear: (callback) => settle(readOnly(), callback)
      };
      define(storage, "managed", area);
      info.modes.storageManaged = "empty and read-only (no enterprise policies in Obsidian)";
    });
    if (!storage.session) report("storage.session-local", () => {
      const prefix = "__obsidian_bridge_session_v1__";
      const markerKey = "__obsidian_bridge_session_boot_v1__";
      const bootId = fields(fields(globalThis).__obsidianBridgeLocaleData).bridgeBootId;
      let ready = null;
      const resetIfNewBoot = () => ready ||= typeof bootId !== "string" ? Promise.resolve() : invoke(chrome, local, "get", null).then((raw) => {
        const all = fields(raw);
        if (all[markerKey] === bootId) return;
        const stale = Object.keys(all).filter((k) => k.startsWith(prefix));
        return (stale.length ? invoke(chrome, local, "remove", stale) : Promise.resolve()).then(() => invoke(chrome, local, "set", { [markerKey]: bootId }));
      }).catch((e) => console.warn("[Chrome Bridge] storage.session reset:", e));
      const area = Object.assign(prefixedArea(chrome, c, prefix, resetIfNewBoot), {
        QUOTA_BYTES: 10485760,
        setAccessLevel: (_options, callback) => callbackOrPromise(callback, void 0)
      });
      define(storage, "session", area);
      info.modes.storageSession = typeof bootId === "string" ? "kept in storage.local under a private prefix; cleared on each Obsidian start" : "kept in storage.local under a private prefix; NOT cleared (host boot id missing)";
      void resetIfNewBoot();
    });
  }

  // src/extensions/compat/apis/alarms.ts
  function installAlarms({ c, chrome, granted, info, report }) {
    if (!granted.has("alarms") || !missingFn(c.alarms, "create")) return;
    report("alarms.worker-timers", () => {
      const existing = nsOf(c, "alarms") ?? {};
      const onAlarm = eventOf(existing, "onAlarm") ?? event();
      const KEY = "__obsidian_bridge_alarms_v1__";
      const MAX_TIMER = 2147483647;
      const storage = nsOf(c, "storage");
      const local = nsOf(storage, "local");
      const persistent = granted.has("storage") && !missingFn(local, "get");
      let memory = {};
      const load = async () => persistent ? { ...fields(fields(await invoke(chrome, local, "get", KEY))[KEY]) } : { ...memory };
      const timers = /* @__PURE__ */ new Map();
      const arm = (alarm) => {
        const current = timers.get(alarm.name);
        if (current?.scheduledTime === alarm.scheduledTime) return;
        if (current) clearTimeout(current.timer);
        const wait = Math.max(0, Math.min(alarm.scheduledTime - Date.now(), MAX_TIMER));
        timers.set(alarm.name, { scheduledTime: alarm.scheduledTime, timer: setTimeout(() => fire(alarm.name, alarm.scheduledTime), wait) });
      };
      const reconcile = (all) => {
        if (!isWorker) return;
        for (const [name, t] of timers) if (!all[name]) {
          clearTimeout(t.timer);
          timers.delete(name);
        }
        for (const alarm of Object.values(all)) arm(alarm);
      };
      let queue = Promise.resolve();
      const mutate = (fn) => {
        const op = queue.then(async () => {
          const all = await load();
          const result = fn(all);
          if (persistent) await invoke(chrome, local, "set", { [KEY]: all });
          else memory = all;
          reconcile(all);
          return result;
        });
        queue = op.then(() => void 0, () => void 0);
        return op;
      };
      const fire = (name, scheduledTime) => {
        timers.delete(name);
        mutate((all) => {
          const alarm = all[name];
          if (!alarm || alarm.scheduledTime !== scheduledTime || Date.now() < scheduledTime) return null;
          if (alarm.periodInMinutes) {
            const period = alarm.periodInMinutes * 6e4;
            let next = alarm.scheduledTime + period;
            if (next <= Date.now()) next = Date.now() + period;
            all[name] = { ...alarm, scheduledTime: next };
          } else delete all[name];
          return { ...alarm };
        }).then((fired) => {
          if (fired) emit(onAlarm, fired);
        }, (e) => console.warn("[Chrome Bridge] alarms:", e));
      };
      const finite = (v) => typeof v === "number" && Number.isFinite(v);
      const nameAndCallback = (name, callback) => callbackOf(name) ? ["", name] : [typeof name === "string" ? name : "", callback];
      const api = {
        create(nameArg, infoArg, callbackArg) {
          let name = "", alarmInfo = infoArg, callback = callbackArg;
          if (typeof nameArg === "string") name = nameArg;
          else {
            callback = infoArg;
            alarmInfo = nameArg;
          }
          if (callbackOf(alarmInfo)) {
            callback = alarmInfo;
            alarmInfo = {};
          }
          const { when, delayInMinutes, periodInMinutes } = fields(alarmInfo);
          if (!finite(when) && !finite(delayInMinutes) && !finite(periodInMinutes)) {
            return settle(Promise.reject(new Error("Must set at least one of when, delayInMinutes, or periodInMinutes")), callback);
          }
          const delay = finite(delayInMinutes) ? delayInMinutes : finite(periodInMinutes) ? periodInMinutes : 0;
          const scheduledTime = finite(when) ? when : Date.now() + delay * 6e4;
          const alarm = { name, scheduledTime, ...finite(periodInMinutes) ? { periodInMinutes } : {} };
          return settle(mutate((all) => {
            all[name] = alarm;
          }).then(() => void 0), callback);
        },
        get(nameArg, callbackArg) {
          const [key, callback] = nameAndCallback(nameArg, callbackArg);
          return settle(queue.then(load).then((all) => all[key] ? { ...all[key] } : void 0), callback);
        },
        getAll(callback) {
          return settle(queue.then(load).then((all) => Object.values(all)), callback);
        },
        clear(nameArg, callbackArg) {
          const [key, callback] = nameAndCallback(nameArg, callbackArg);
          return settle(mutate((all) => {
            const had = Object.hasOwn(all, key);
            delete all[key];
            return had;
          }), callback);
        },
        clearAll(callback) {
          return settle(mutate((all) => {
            const had = Object.keys(all).length > 0;
            for (const k of Object.keys(all)) delete all[k];
            return had;
          }), callback);
        }
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      if (missingEvent(existing, "onAlarm")) define(existing, "onAlarm", onAlarm);
      if (!c.alarms) define(c, "alarms", existing);
      if (isWorker) {
        mutate(() => void 0).catch((e) => console.warn("[Chrome Bridge] alarms restore:", e));
        const onChanged = eventOf(storage, "onChanged");
        if (persistent && onChanged) onChanged.addListener((changes, areaName) => {
          const change = fields(changes)[KEY];
          if (areaName === "local" && change) reconcile(fields(fields(change).newValue));
        });
      }
      info.modes.alarms = "timers in the service worker; a stopped worker is not woken" + (persistent ? "" : "; not persisted (no storage permission)");
    });
  }

  // src/extensions/compat/apis/context-menus.ts
  var FIELDS = [
    "id",
    "parentId",
    "title",
    "type",
    "contexts",
    "checked",
    "enabled",
    "visible",
    "documentUrlPatterns",
    "targetUrlPatterns"
  ];
  function serializable(id, properties) {
    const item = { id };
    for (const key of FIELDS) {
      const value = properties[key];
      if (value !== void 0 && typeof value !== "function") item[key] = JSON.parse(JSON.stringify(value));
    }
    item.id = id;
    return item;
  }
  function installContextMenus(ctx) {
    const { c, chrome, granted, info, shared, report } = ctx;
    if (!granted.has("contextMenus") || !missingFn(c.contextMenus, "create")) return;
    report("contextMenus", () => {
      const existing = nsOf(c, "contextMenus") ?? {};
      const storage = nsOf(c, "storage");
      const local = nsOf(storage, "local");
      const items = /* @__PURE__ */ new Map();
      const onclick = /* @__PURE__ */ new Map();
      const persistent = granted.has("storage") && !missingFn(local, "get");
      let sequence = 0;
      let announcing = false;
      const announce = () => {
        if (announcing) return;
        announcing = true;
        setTimeout(() => {
          announcing = false;
          shared.bridge.post({ type: "contextMenus.items", items: [...items.values()] });
        }, 0);
      };
      const save = () => {
        if (persistent) invoke(chrome, local, "set", { [CONTEXT_MENU_STORAGE_KEY]: [...items.values()] }).catch((e) => console.warn("[Chrome Bridge] contextMenus persist:", e));
      };
      const replaceAll = (list3) => {
        items.clear();
        if (!Array.isArray(list3)) return;
        for (const raw of list3) {
          const id = fields(raw).id;
          if (typeof id === "string" || typeof id === "number") items.set(id, raw);
        }
      };
      let chain = persistent ? invoke(chrome, local, "get", CONTEXT_MENU_STORAGE_KEY).then((all) => replaceAll(fields(all)[CONTEXT_MENU_STORAGE_KEY])).catch((e) => console.warn("[Chrome Bridge] contextMenus restore:", e)) : Promise.resolve();
      const enqueue = (op) => {
        const result = chain.then(op);
        chain = result.then(() => void 0, () => void 0);
        return result.then((value) => {
          save();
          announce();
          return value;
        });
      };
      const onStorageChanged = eventOf(storage, "onChanged");
      if (persistent && onStorageChanged) onStorageChanged.addListener((changes, areaName) => {
        const change = fields(changes)[CONTEXT_MENU_STORAGE_KEY];
        if (areaName === "local" && change) replaceAll(fields(change).newValue);
      });
      const removeTree = (id) => {
        items.delete(id);
        onclick.delete(id);
        for (const item of [...items.values()]) if (item.parentId === id) removeTree(item.id);
      };
      const notFound = (id) => new Error(`Cannot find menu item with id ${text(id)}`);
      const isId = (v) => typeof v === "string" || typeof v === "number";
      const api = {
        create(createProperties = {}, callback) {
          const properties = fields(createProperties);
          const id = isId(properties.id) ? properties.id : ++sequence;
          const done = enqueue(() => {
            if (items.has(id)) throw new Error(`Cannot create item with duplicate id ${id}`);
            const parentId = properties.parentId;
            if (parentId !== void 0 && !(isId(parentId) && items.has(parentId))) throw new Error(`Cannot find menu item with id ${text(parentId)}`);
            items.set(id, serializable(id, properties));
            const handler = callbackOf(properties.onclick);
            if (handler) onclick.set(id, handler);
          });
          const cb = callbackOf(callback);
          done.then(
            () => {
              cb?.();
            },
            (e) => {
              console.warn("[Chrome Bridge] contextMenus.create:", e instanceof Error ? e.message : e);
              cb?.();
            }
          );
          return id;
        },
        update(id, updateProperties = {}, callback) {
          const properties = fields(updateProperties);
          return settle(enqueue(() => {
            const current = isId(id) ? items.get(id) : void 0;
            if (!isId(id) || !current) throw notFound(id);
            items.set(id, serializable(id, { ...current, ...properties }));
            const handler = callbackOf(properties.onclick);
            if (handler) onclick.set(id, handler);
          }), callback);
        },
        remove(id, callback) {
          return settle(enqueue(() => {
            if (!isId(id) || !items.has(id)) throw notFound(id);
            removeTree(id);
          }), callback);
        },
        removeAll(callback) {
          return settle(enqueue(() => {
            items.clear();
            onclick.clear();
          }), callback);
        }
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      const onClicked = eventOf(existing, "onClicked") ?? event();
      if (missingEvent(existing, "onClicked")) define(existing, "onClicked", onClicked);
      if (existing.ACTION_MENU_TOP_LEVEL_LIMIT === void 0) define(existing, "ACTION_MENU_TOP_LEVEL_LIMIT", 6);
      if (!c.contextMenus) define(c, "contextMenus", existing);
      shared.contextMenus.add(existing);
      shared.bridge.on("contextMenus.clicked", async (message) => {
        const clicked = message.info;
        if (!clicked) return;
        const item = items.get(clicked.menuItemId);
        if (!item && !isWorker) return;
        if (isWorker && item && (item.type === "checkbox" || item.type === "radio")) {
          await enqueue(() => {
            if (item.type === "checkbox") item.checked = !item.checked;
            else {
              const siblings = [...items.values()].filter((x) => x.parentId === item.parentId);
              const index = siblings.indexOf(item);
              let start = index, end = index;
              while (start > 0 && siblings[start - 1].type === "radio") start--;
              while (end < siblings.length - 1 && siblings[end + 1].type === "radio") end++;
              for (let i = start; i <= end; i++) siblings[i].checked = i === index;
            }
          });
        }
        let tab;
        const tabs = nsOf(c, "tabs");
        if (Number.isInteger(message.tabId) && fnOf(tabs, "get")) {
          try {
            tab = await invoke(chrome, tabs, "get", message.tabId);
          } catch {
            tab = void 0;
          }
        }
        const data = { ...clicked, ...item?.type === "checkbox" || item?.type === "radio" ? { checked: !!item.checked } : {} };
        emit(onClicked, data, tab);
        const legacy = onclick.get(clicked.menuItemId);
        if (legacy) later(() => {
          try {
            legacy(data, tab);
          } catch (e) {
            console.error("[Chrome Bridge] contextMenus onclick:", e);
          }
        });
      });
      if (isWorker) shared.bridge.on("bridge.sync", () => {
        void chain.then(announce);
      });
      info.modes.contextMenus = shared.bridge.available ? "shown in the Obsidian Web Viewer context menu and on the toolbar button; icons are not shown" : "registration-only: BroadcastChannel unavailable, menus are not shown";
    });
  }

  // src/extensions/compat/apis/windows.ts
  var OBSIDIAN_WINDOW_ID = 0;
  var WINDOW_ID_NONE = -1;
  var WINDOW_ID_CURRENT = -2;
  var isBridgePage = (url) => typeof url === "string" && /^chrome-extension:\/\/[a-p]{32}\//.test(url) && url.slice("chrome-extension://".length + 33).startsWith(RESERVED_PREFIX);
  function windowOf(tabs) {
    const screen = typeof globalThis.screen === "object" ? globalThis.screen : void 0;
    const doc = typeof document === "object" ? document : void 0;
    return {
      id: OBSIDIAN_WINDOW_ID,
      focused: doc ? doc.hasFocus() : true,
      alwaysOnTop: false,
      incognito: false,
      type: "normal",
      state: "normal",
      top: 0,
      left: 0,
      width: Number(screen?.availWidth) || 1280,
      height: Number(screen?.availHeight) || 800,
      ...tabs ? { tabs } : {}
    };
  }
  var optionsAndCallback = (options, callback) => callbackOf(options) ? [void 0, options] : [options, callback];
  function installWindows(ctx) {
    const { c, chrome, info, report } = ctx;
    const windows = nsOf(c, "windows");
    if (!windows || !missingFn(windows, "getCurrent")) return;
    report("windows.obsidian-window", () => {
      const tabs = (populate) => populate ? invoke(chrome, c.tabs, "query", {}).then((rows) => Array.isArray(rows) ? rows.filter((t) => !isBridgePage(fields(t).url)) : []).catch(() => []) : Promise.resolve(void 0);
      const lookup = (windowId, options) => {
        if (windowId !== OBSIDIAN_WINDOW_ID && windowId !== WINDOW_ID_CURRENT) return Promise.reject(new Error(`No window with id: ${text(windowId)}.`));
        return tabs(fields(options).populate).then(windowOf);
      };
      const api = {
        get: (windowId, options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          return settle(lookup(windowId, opts), cb);
        },
        getCurrent: (options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          return settle(lookup(OBSIDIAN_WINDOW_ID, opts), cb);
        },
        getLastFocused: (options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          return settle(lookup(OBSIDIAN_WINDOW_ID, opts), cb);
        },
        getAll: (options, callback) => {
          const [opts, cb] = optionsAndCallback(options, callback);
          const types = fields(opts).windowTypes;
          const wantsNormal = !Array.isArray(types) || types.includes("normal");
          return settle(wantsNormal ? lookup(OBSIDIAN_WINDOW_ID, opts).then((w) => [w]) : Promise.resolve([]), cb);
        },
        // Obsidian's window is not the extension's to move, resize or close.
        update: (windowId, _info, callback) => settle(lookup(windowId, {}), callback),
        remove: (windowId, callback) => settle(Promise.reject(new Error(`Window ${text(windowId)} cannot be closed by an extension in Obsidian.`)), callback)
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(windows, key)) define(windows, key, value);
      fillEvents(windows, ["onCreated", "onRemoved", "onFocusChanged", "onBoundsChanged"]);
      if (windows.WINDOW_ID_NONE === void 0) define(windows, "WINDOW_ID_NONE", WINDOW_ID_NONE);
      if (windows.WINDOW_ID_CURRENT === void 0) define(windows, "WINDOW_ID_CURRENT", WINDOW_ID_CURRENT);
      if (windows.WindowType === void 0) define(windows, "WindowType", { NORMAL: "normal", POPUP: "popup", PANEL: "panel", APP: "app", DEVTOOLS: "devtools" });
      if (windows.WindowState === void 0) define(windows, "WindowState", { NORMAL: "normal", MINIMIZED: "minimized", MAXIMIZED: "maximized", FULLSCREEN: "fullscreen", LOCKED_FULLSCREEN: "locked_fullscreen" });
      info.modes.windows = "Obsidian is one window (id 0, as Electron reports for every tab); windows cannot be moved or closed; window events are registration-only";
    });
  }
  function installTabExtras(ctx) {
    const { c, chrome, info, shared, report } = ctx;
    const tabs = nsOf(c, "tabs");
    if (!tabs || !shared.bridge.available) return;
    report("tabs.extras", () => {
      const added = [];
      const add = (name, fn) => {
        if (missingFn(tabs, name)) {
          define(tabs, name, fn);
          added.push(name);
        }
      };
      add("getCurrent", (callback) => settle((async () => {
        if (isWorker || !globalThis.location) return void 0;
        const rows = await invoke(chrome, tabs, "query", {}).catch(() => []);
        const popup = chrome.runtime.getManifest?.()?.action?.default_popup;
        if (typeof popup === "string" && globalThis.location.pathname === "/" + popup.replace(/^\//, "").split(/[?#]/)[0]) return void 0;
        return Array.isArray(rows) ? rows.find((t) => fields(t).url === globalThis.location.href) : void 0;
      })(), callback));
      const history = (delta) => (tabId, callback) => {
        if (callbackOf(tabId)) {
          callback = tabId;
          tabId = void 0;
        }
        return settle(shared.bridge.request("tabs.history", { tabId: typeof tabId === "number" && Number.isSafeInteger(tabId) ? tabId : null, delta }, 5e3).then(() => void 0), callback);
      };
      add("goBack", history(-1));
      add("goForward", history(1));
      add("captureVisibleTab", (...args) => {
        const callback = callbackOf(args[args.length - 1]) ? args.pop() : void 0;
        const options = fields(args.find((a) => a && typeof a === "object"));
        const quality = options.quality;
        return settle(shared.bridge.request("tabs.capture", {
          format: options.format === "png" ? "png" : "jpeg",
          ...typeof quality === "number" && Number.isInteger(quality) ? { quality } : {}
        }, 1e4).then((r) => r.dataUrl), callback);
      });
      add("duplicate", (tabId, callback) => settle((async () => {
        const url = fields(await invoke(chrome, tabs, "get", tabId)).url;
        if (typeof url !== "string" || !url) throw new Error(`No tab with id: ${text(tabId)}.`);
        const { tabId: id } = await shared.bridge.request("tabs.open", { url, active: true, reason: "tabs.create" }, 1e4);
        return Number.isSafeInteger(id) ? invoke(chrome, tabs, "get", id).catch(() => ({ id, url })) : void 0;
      })(), callback));
      add("highlight", (highlightInfo, callback) => settle((async () => {
        const requested = fields(highlightInfo).tabs;
        const ids = Array.isArray(requested) ? requested : [requested];
        const first = ids.find((x) => typeof x === "number" && Number.isSafeInteger(x));
        if (first !== void 0) await shared.bridge.request("tabs.activate", { tabId: first }, 5e3).catch(() => void 0);
        return windowOf();
      })(), callback));
      if (tabs.TAB_ID_NONE === void 0) define(tabs, "TAB_ID_NONE", -1);
      if (tabs.TAB_INDEX_NONE === void 0) define(tabs, "TAB_INDEX_NONE", -1);
      if (added.length) info.modes.tabsExtras = added.join(", ") + " via Obsidian (captureVisibleTab: the active Web Viewer tab)";
    });
  }

  // src/extensions/compat/apis/tabs.ts
  var OTHER_TAB_EVENTS = ["onAttached", "onDetached", "onHighlighted", "onMoved", "onReplaced", "onZoomChange"];
  var filtered = /* @__PURE__ */ Symbol.for("obsidian-bridge.tabs-query-filtered");
  var tabRows = (value) => Array.isArray(value) ? value.map(fields) : null;
  function installTabs(ctx) {
    const { c, chrome, info, report } = ctx;
    const tabs = nsOf(c, "tabs");
    if (!tabs) return;
    const registrationOnly = ctx.shared.bridge.available ? OTHER_TAB_EVENTS : [...OTHER_TAB_EVENTS, ...TAB_EVENTS];
    if (registrationOnly.some((name) => missingEvent(tabs, name))) report("tabs.events-registration-only", () => {
      info.modes.otherTabsEvents = "registration-only: " + registrationOnly.filter((name) => missingEvent(tabs, name)).join(", ");
      fillEvents(tabs, registrationOnly);
    });
    installTabEvents(ctx, tabs);
    const nativeQuery = fnOf(tabs, "query");
    if (nativeQuery && !(filtered in nativeQuery)) report("tabs.hide-bridge-pages", () => {
      const holder = { query: nativeQuery.bind(tabs) };
      const query = (queryInfo = {}, callback) => {
        const op = invoke(chrome, holder, "query", queryInfo).then((result) => tabRows(result)?.filter((tab) => !isBridgePage(tab.url)) ?? result);
        const cb = callbackOf(callback);
        if (!cb) return op;
        op.then((rows) => {
          cb(rows);
        }, (error) => {
          console.warn("[Chrome Bridge] tabs.query:", error);
          cb([]);
        });
        return void 0;
      };
      Object.defineProperty(query, filtered, { value: true });
      define(tabs, "query", query);
    });
    installActiveTab(ctx, tabs);
  }
  var TARGET_TIMEOUT_MS = 2e3;
  var WINDOW_ID_CURRENT2 = -2;
  function isPopupDocument(manifest) {
    if (typeof document !== "object" || !globalThis.location || isWorker) return false;
    const popup = manifest.action?.default_popup || manifest.browser_action?.default_popup || manifest.page_action?.default_popup;
    if (typeof popup !== "string") return false;
    return globalThis.location.pathname === "/" + popup.split(/[?#]/)[0].replace(/^\//, "");
  }
  var validTab = (r) => {
    const tabId = r?.tabId;
    return typeof tabId === "number" && Number.isSafeInteger(tabId) && tabId > 0 ? tabId : null;
  };
  function installActiveTab({ c, chrome, info, manifest, shared, report }, tabs) {
    const nativeQuery = fnOf(tabs, "query");
    if (!shared.bridge.available || !nativeQuery) return;
    const popup = isPopupDocument(manifest);
    report(popup ? "tabs.active-webviewer" : "tabs.active-from-obsidian", () => {
      let popupTarget = null;
      let inFlight = null;
      const activeTab = () => {
        if (popup) {
          return popupTarget ??= shared.bridge.request("popup.targetTab", {}, TARGET_TIMEOUT_MS).then(validTab, () => null).then((id) => {
            info.targetTabId = id;
            return id;
          });
        }
        return inFlight ??= shared.bridge.request("tabs.activeTab", {}, TARGET_TIMEOUT_MS).then(validTab, () => null).finally(() => {
          inFlight = null;
        });
      };
      if (popup) void activeTab();
      const holder = { query: nativeQuery.bind(tabs) };
      const native = (queryInfo) => invoke(chrome, holder, "query", queryInfo);
      const ownPage = (tab) => {
        if (!popup || typeof tab.url !== "string") return false;
        try {
          const u = new URL(tab.url);
          return u.protocol === "chrome-extension:" && u.hostname === c.runtime.id && u.pathname === globalThis.location.pathname;
        } catch {
          return false;
        }
      };
      const patchedQuery = (queryInfo = {}, callback) => {
        const requested = fields(queryInfo);
        const has = (k) => Object.hasOwn(requested, k);
        const active = has("active") ? !!requested.active : has("highlighted") ? !!requested.highlighted : null;
        const current = has("currentWindow") ? !!requested.currentWindow : has("lastFocusedWindow") ? !!requested.lastFocusedWindow : requested.windowId === WINDOW_ID_CURRENT2 ? true : null;
        const op = activeTab().then((target) => {
          const nativeFilter = { ...requested };
          for (const k of ["active", "highlighted", "currentWindow", "lastFocusedWindow"]) delete nativeFilter[k];
          if (nativeFilter.windowId === WINDOW_ID_CURRENT2) delete nativeFilter.windowId;
          return native(nativeFilter).then((result) => {
            const all = tabRows(result);
            if (!all) return result;
            const rows = all.filter((tab) => !ownPage(tab));
            const focused = target === null ? void 0 : rows.find((tab) => tab.id === target);
            if (!focused) return rows.filter(() => active !== true && current !== true).map((tab) => ({ ...tab, active: false }));
            return rows.filter((tab) => {
              if (current === true && tab.windowId !== focused.windowId) return false;
              if (current === false && tab.windowId === focused.windowId) return false;
              if (active !== null && active !== (tab.id === focused.id)) return false;
              return true;
            }).map((tab) => ({ ...tab, active: tab.id === focused.id, highlighted: tab.id === focused.id }));
          });
        });
        const cb = callbackOf(callback);
        if (!cb) return op;
        op.then((value) => {
          cb(value);
        }, (error) => {
          console.warn("[Chrome Bridge] tabs.query compatibility:", error);
          cb([]);
        });
        return void 0;
      };
      define(tabs, "query", patchedQuery);
      info.modes.tabsActive = popup ? "the popup's active tab is the Web Viewer it was opened from" : "active tab = the Web Viewer tab focused in Obsidian";
    });
  }
  var tabNamespaces = /* @__PURE__ */ new Set();
  var tabDelivery = false;
  function installTabEvents(ctx, namespace) {
    const { chrome, granted, hosts, info, shared, report } = ctx;
    if (!shared.bridge.available || tabNamespaces.has(namespace)) return;
    report("tabs.events-from-obsidian", () => {
      let pending = false;
      const announce = () => {
        if (!isWorker || pending) return;
        pending = true;
        setTimeout(() => {
          pending = false;
          const events2 = TAB_EVENTS.filter((name) => [...tabNamespaces].some((ns) => listenerCount(ns[name]) > 0));
          shared.bridge.post({ type: "tabs.listeners", events: events2 });
        }, 0);
      };
      for (const name of TAB_EVENTS) define(namespace, name, event({ onChange: announce }));
      tabNamespaces.add(namespace);
      shared.bridge.on("bridge.sync", announce);
      if (isWorker) announce();
      const sensitive = granted.has("tabs") || hosts.size > 0;
      if (!tabDelivery) {
        tabDelivery = true;
        const nativeTabs = nsOf(chrome, "tabs");
        shared.bridge.on("tabs.event", async (message) => {
          const name = message.event;
          if (!TAB_EVENTS.includes(name) || !Number.isSafeInteger(message.tab?.id)) return;
          const known = { ...message.tab };
          if (!sensitive) {
            delete known.url;
            delete known.title;
            delete known.favIconUrl;
          }
          let tab = { id: known.id };
          if (name !== "onRemoved" && fnOf(nativeTabs, "get")) {
            try {
              tab = fields(await invoke(chrome, nativeTabs, "get", known.id));
            } catch {
            }
          }
          tab = { id: known.id, ...tab, ...known, ...known.active !== void 0 ? { highlighted: known.active } : {} };
          if (!sensitive) {
            delete tab.url;
            delete tab.title;
            delete tab.favIconUrl;
            delete tab.pendingUrl;
          }
          const change = { ...message.changeInfo || {} };
          if (!sensitive) {
            delete change.url;
            delete change.title;
            delete change.favIconUrl;
          }
          for (const ns of tabNamespaces) {
            if (name === "onUpdated") emit(ns.onUpdated, tab.id, change, tab);
            else if (name === "onCreated") emit(ns.onCreated, tab);
            else if (name === "onActivated") emit(ns.onActivated, { tabId: tab.id, windowId: tab.windowId ?? -1 });
            else if (name === "onRemoved") emit(ns.onRemoved, tab.id, message.removeInfo || { windowId: -1, isWindowClosing: false });
          }
        });
      }
      info.modes.tabsEvents = "onActivated/onCreated/onRemoved/onUpdated delivered from Obsidian Web Viewer tabs";
    });
  }

  // src/extensions/compat/apis/open.ts
  var OPENABLE = /^(https?:|chrome-extension:|about:blank$)/i;
  var activates = /* @__PURE__ */ Symbol.for("obsidian-bridge.tabs-update-activates");
  var extensionRoot;
  function resolveUrl(raw) {
    const value = raw === void 0 || raw === null || raw === "" ? "about:blank" : text(raw);
    try {
      const url = new URL(value, globalThis.location?.href ?? extensionRoot);
      return OPENABLE.test(url.href) ? url.href : null;
    } catch {
      return null;
    }
  }
  function installOpen(ctx) {
    const { c, chrome, info, shared, report } = ctx;
    if (!shared.bridge.available) return;
    if (fnOf(chrome.runtime, "getURL")) extensionRoot ??= chrome.runtime.getURL("");
    const tabs = nsOf(c, "tabs");
    const open = async (raw, active, reason) => {
      const url = resolveUrl(raw);
      if (!url) throw new Error(`Cannot open URL in Obsidian: ${text(raw, typeof raw)}`);
      const { tabId } = await shared.bridge.request("tabs.open", { url, active, reason }, 1e4);
      return Number.isSafeInteger(tabId) ? tabId : null;
    };
    const tabFor = async (tabId, url, active) => {
      if (tabId !== null && fnOf(tabs, "get")) {
        try {
          const tab = await invoke(chrome, tabs, "get", tabId);
          if (tab) return tab;
        } catch {
        }
      }
      return {
        id: tabId ?? -1,
        index: 0,
        windowId: -1,
        url: url ?? void 0,
        active,
        highlighted: active,
        pinned: false,
        incognito: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1
      };
    };
    if (tabs && missingFn(tabs, "create")) report("tabs.create", () => {
      define(tabs, "create", (createProperties = {}, callback) => {
        const properties = fields(createProperties);
        const active = properties.active !== false;
        const op = open(properties.url, active, "tabs.create").then((tabId) => tabFor(tabId, resolveUrl(properties.url), active));
        return settle(op, callback);
      });
      info.modes.tabsCreate = "opens in an Obsidian tab (web URLs in Web Viewer, extension pages in an extension tab)";
    });
    if (tabs && missingFn(tabs, "remove")) report("tabs.remove", () => {
      define(tabs, "remove", (tabIds, callback) => {
        const ids = (Array.isArray(tabIds) ? tabIds : [tabIds]).filter((id) => typeof id === "number" && Number.isSafeInteger(id));
        return settle(shared.bridge.request("tabs.remove", { tabIds: ids }, 1e4).then(() => void 0), callback);
      });
    });
    const nativeUpdate = fnOf(tabs, "update");
    if (tabs && nativeUpdate && !(activates in nativeUpdate)) report("tabs.update.active", () => {
      const update = (...args) => {
        const [tabId, properties] = typeof args[0] === "number" ? [args[0], args[1]] : [void 0, args[0]];
        if (fields(properties).active === true && typeof tabId === "number") {
          shared.bridge.request("tabs.activate", { tabId }, 5e3).catch(() => void 0);
        }
        return nativeUpdate.apply(tabs, args);
      };
      Object.defineProperty(update, activates, { value: true });
      define(tabs, "update", update);
    });
    if (missingFn(c.windows, "create")) report("windows.create", () => {
      const existing = nsOf(c, "windows") ?? {};
      define(existing, "create", (createData = {}, callback) => {
        const data = fields(createData);
        const urls = Array.isArray(data.url) ? data.url : [data.url];
        const op = (async () => {
          const opened = [];
          for (const [i, url] of urls.entries()) {
            const active = i === 0 && data.focused !== false;
            opened.push(await tabFor(await open(url, active, "windows.create"), resolveUrl(url), active));
          }
          return {
            id: OBSIDIAN_WINDOW_ID,
            focused: data.focused !== false,
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            incognito: false,
            type: typeof data.type === "string" ? data.type : "normal",
            state: "normal",
            alwaysOnTop: false,
            tabs: opened
          };
        })();
        return settle(op, callback);
      });
      if (existing.WINDOW_ID_NONE === void 0) define(existing, "WINDOW_ID_NONE", -1);
      if (existing.WINDOW_ID_CURRENT === void 0) define(existing, "WINDOW_ID_CURRENT", -2);
      if (!c.windows) define(c, "windows", existing);
      info.modes.windowsCreate = "opens the URLs as Obsidian tabs; the returned window is not a real window";
    });
    if (missingFn(c.runtime, "openOptionsPage")) report("runtime.openOptionsPage", () => {
      define(c.runtime, "openOptionsPage", (callback) => settle(
        shared.bridge.request("runtime.openOptionsPage", {}, 1e4).then(() => void 0),
        callback
      ));
    });
  }
  function installPageOpen(ctx) {
    const doc = typeof document === "object" ? document : void 0;
    if (isWorker || !doc || !ctx.shared.bridge.available) return;
    const request = (raw, reason) => {
      const url = resolveUrl(raw);
      if (!url) return false;
      ctx.shared.bridge.request("tabs.open", { url, active: true, reason }, 1e4).catch((e) => console.warn("[Chrome Bridge] open:", e));
      return true;
    };
    const nativeOpen = globalThis.open;
    define(globalThis, "open", (url, target, features) => {
      if (target === "_self" || target === "_top" || target === "_parent") return nativeOpen.call(globalThis, url, target, features);
      request(url, "window.open");
      return null;
    });
    const onClick = (event2) => {
      if (event2.defaultPrevented) return;
      const anchor = event2.target?.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const target = (anchor.getAttribute("target") || "").toLowerCase();
      const newTab = target && !["_self", "_top", "_parent"].includes(target) || event2.ctrlKey || event2.metaKey || event2.shiftKey || event2.button === 1;
      if (!newTab || /^javascript:/i.test(anchor.href)) return;
      if (request(anchor.href, "link")) event2.preventDefault();
    };
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("auxclick", onClick, true);
    ctx.info.installed.push("page.open-in-obsidian");
  }

  // src/extensions/shared/re2.ts
  var MAX_REPEAT = 1e3;
  var MAX_PROGRAM = 2e4;
  var SyntaxError2 = class extends Error {
  };
  var isWord = (c) => !!c && /[A-Za-z0-9_]/.test(c);
  var DIGIT = (c) => c >= "0" && c <= "9";
  var WORD = (c) => isWord(c);
  var SPACE = (c) => c === " " || c === "	" || c === "\n" || c === "\r" || c === "\f" || c === "\v";
  var not = (f) => (c) => !f(c);
  var POSIX = {
    alpha: (c) => /[A-Za-z]/.test(c),
    digit: DIGIT,
    alnum: (c) => /[A-Za-z0-9]/.test(c),
    upper: (c) => /[A-Z]/.test(c),
    lower: (c) => /[a-z]/.test(c),
    space: SPACE,
    xdigit: (c) => /[0-9A-Fa-f]/.test(c),
    word: WORD,
    punct: (c) => /[!-/:-@[-`{-~]/.test(c),
    blank: (c) => c === " " || c === "	",
    cntrl: (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
    print: (c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127,
    graph: (c) => c.charCodeAt(0) > 32 && c.charCodeAt(0) < 127,
    ascii: (c) => c.charCodeAt(0) < 128
  };
  var CONTROL = { n: "\n", t: "	", r: "\r", f: "\f", v: "\v", a: String.fromCharCode(7) };
  function folded(test, caseInsensitive) {
    if (!caseInsensitive) return test;
    return (c) => test(c) || test(c.toLowerCase()) || test(c.toUpperCase());
  }
  var Parser = class {
    constructor(src, ci) {
      this.src = src;
      this.ci = ci;
    }
    src;
    ci;
    pos = 0;
    groups = 0;
    parse() {
      const node = this.alternation();
      if (this.pos < this.src.length) throw new SyntaxError2("unexpected )");
      return node;
    }
    peek() {
      return this.src[this.pos];
    }
    alternation() {
      const branches = [this.concatenation()];
      while (this.peek() === "|") {
        this.pos++;
        branches.push(this.concatenation());
      }
      return branches.length === 1 ? branches[0] : { t: "alt", nodes: branches };
    }
    concatenation() {
      const nodes = [];
      while (this.pos < this.src.length && this.peek() !== "|" && this.peek() !== ")") {
        const atom = this.atom();
        if (atom) nodes.push(this.quantified(atom));
      }
      return nodes.length === 1 ? nodes[0] : { t: "cat", nodes };
    }
    quantified(atom) {
      let node = atom;
      for (; ; ) {
        const c = this.peek();
        let min, max;
        if (c === "*") {
          min = 0;
          max = Infinity;
          this.pos++;
        } else if (c === "+") {
          min = 1;
          max = Infinity;
          this.pos++;
        } else if (c === "?") {
          min = 0;
          max = 1;
          this.pos++;
        } else if (c === "{") {
          const m = /^\{(\d+)(,(\d*))?\}/.exec(this.src.slice(this.pos));
          if (!m) return node;
          min = Number(m[1]);
          max = m[2] === void 0 ? min : m[3] === "" ? Infinity : Number(m[3]);
          if (min > MAX_REPEAT || max !== Infinity && (max > MAX_REPEAT || max < min)) throw new SyntaxError2("bad repetition");
          this.pos += m[0].length;
        } else return node;
        if (node.t === "assert") throw new SyntaxError2("nothing to repeat");
        let greedy = true;
        if (this.peek() === "?") {
          greedy = false;
          this.pos++;
        }
        if (node.t === "repeat") throw new SyntaxError2("bad repetition operator");
        node = { t: "repeat", node, min, max, greedy };
      }
    }
    atom() {
      const c = this.src[this.pos++];
      switch (c) {
        case "(":
          return this.group();
        case "[":
          return { t: "char", test: folded(this.charClass(), this.ci) };
        case ".":
          return { t: "char", test: (ch) => ch !== "\n" };
        case "^":
          return { t: "assert", kind: "start" };
        case "$":
          return { t: "assert", kind: "end" };
        case "\\":
          return this.escape();
        case "*":
        case "+":
        case "?":
          throw new SyntaxError2("missing argument to repetition operator");
        default:
          return this.literal(c);
      }
    }
    literal(c) {
      const lit = c.toLowerCase();
      if (!this.ci) return { t: "char", test: (ch) => ch === c, lit };
      return { t: "char", test: (ch) => ch.toLowerCase() === lit, lit };
    }
    group() {
      let index = null;
      if (this.src.startsWith("?:", this.pos)) this.pos += 2;
      else if (this.src.startsWith("?P<", this.pos) || this.src.startsWith("?<", this.pos) && !/^\?<[=!]/.test(this.src.slice(this.pos))) {
        const close = this.src.indexOf(">", this.pos);
        if (close < 0) throw new SyntaxError2("bad named group");
        this.pos = close + 1;
        index = ++this.groups;
      } else if (this.peek() === "?") {
        const m = /^\?(i)(\)|:)/.exec(this.src.slice(this.pos));
        if (!m) throw new SyntaxError2("unsupported group (lookaround or flags)");
        this.pos += m[0].length;
        if (m[2] === ")") {
          this.ci = true;
          return null;
        }
        const outer = this.ci;
        this.ci = true;
        const node2 = this.alternation();
        this.ci = outer;
        if (this.src[this.pos++] !== ")") throw new SyntaxError2("missing )");
        return { t: "group", index: null, node: node2 };
      } else index = ++this.groups;
      const node = this.alternation();
      if (this.src[this.pos++] !== ")") throw new SyntaxError2("missing )");
      return { t: "group", index, node };
    }
    /** An escape outside a class: assertion, class shorthand or literal. */
    escape() {
      const c = this.src[this.pos++];
      if (c === void 0) throw new SyntaxError2("trailing backslash");
      if (c === "b") return { t: "assert", kind: "word" };
      if (c === "B") return { t: "assert", kind: "notword" };
      if (c === "A") return { t: "assert", kind: "start" };
      if (c === "z") return { t: "assert", kind: "end" };
      if ("dDwWsS".includes(c)) return { t: "char", test: folded(this.classEscape(c), this.ci) };
      return this.literal(this.escapedChar(c));
    }
    /** Escapes valid both inside and outside classes. */
    classEscape(c) {
      switch (c) {
        case "d":
          return DIGIT;
        case "D":
          return not(DIGIT);
        case "w":
          return WORD;
        case "W":
          return not(WORD);
        case "s":
          return SPACE;
        case "S":
          return not(SPACE);
      }
      const ch = this.escapedChar(c);
      return (x) => x === ch;
    }
    escapedChar(c) {
      if (CONTROL[c]) return CONTROL[c];
      if (c === "x") {
        const m = /^(?:\{([0-9A-Fa-f]{1,6})\}|([0-9A-Fa-f]{2}))/.exec(this.src.slice(this.pos));
        if (!m) throw new SyntaxError2("bad \\x escape");
        this.pos += m[0].length;
        return String.fromCodePoint(parseInt(m[1] ?? m[2], 16));
      }
      if (c === "0") return String.fromCharCode(0);
      if (/[0-9A-Za-z]/.test(c)) throw new SyntaxError2("invalid escape \\" + c);
      return c;
    }
    charClass() {
      let negated = false;
      if (this.peek() === "^") {
        negated = true;
        this.pos++;
      }
      const tests = [];
      let first = true;
      for (; ; ) {
        const c = this.src[this.pos++];
        if (c === void 0) throw new SyntaxError2("missing ]");
        if (c === "]" && !first) break;
        first = false;
        if (c === "[" && this.peek() === ":") {
          const m = /^:(\^?)([a-z]+):\]/.exec(this.src.slice(this.pos));
          if (m && POSIX[m[2]]) {
            this.pos += m[0].length;
            tests.push(m[1] ? not(POSIX[m[2]]) : POSIX[m[2]]);
            continue;
          }
        }
        let low;
        if (c === "\\") {
          const e = this.src[this.pos++];
          if (e === void 0) throw new SyntaxError2("trailing backslash");
          if ("dDwWsS".includes(e)) {
            tests.push(this.classEscape(e));
            continue;
          }
          low = this.escapedChar(e);
        } else low = c;
        if (this.peek() === "-" && this.src[this.pos + 1] !== void 0 && this.src[this.pos + 1] !== "]") {
          this.pos++;
          let high = this.src[this.pos++];
          if (high === "\\") high = this.escapedChar(this.src[this.pos++]);
          if (high < low) throw new SyntaxError2("bad character class range");
          tests.push((x) => x >= low && x <= high);
        } else tests.push((x) => x === low);
      }
      const any = (x) => tests.some((t) => t(x));
      return negated ? not(any) : any;
    }
  };
  function compileProgram(node) {
    const prog = [];
    const emit2 = (inst) => {
      if (prog.length >= MAX_PROGRAM) throw new SyntaxError2("pattern too large");
      prog.push(inst);
      return prog.length - 1;
    };
    const emitSplit = () => {
      const inst = { op: "split", x: 0, y: 0 };
      return [emit2(inst), inst];
    };
    const emitJump = (x = 0) => {
      const inst = { op: "jmp", x };
      emit2(inst);
      return inst;
    };
    const gen = (n) => {
      switch (n.t) {
        case "char":
          emit2({ op: "char", test: n.test });
          return;
        case "assert":
          emit2({ op: "assert", kind: n.kind });
          return;
        case "group":
          if (n.index === null) {
            gen(n.node);
            return;
          }
          emit2({ op: "save", slot: n.index * 2 });
          gen(n.node);
          emit2({ op: "save", slot: n.index * 2 + 1 });
          return;
        case "cat":
          for (const x of n.nodes) gen(x);
          return;
        case "alt": {
          const jumps = [];
          for (let i = 0; i < n.nodes.length; i++) {
            if (i < n.nodes.length - 1) {
              const [, split] = emitSplit();
              split.x = prog.length;
              gen(n.nodes[i]);
              jumps.push(emitJump());
              split.y = prog.length;
            } else gen(n.nodes[i]);
          }
          for (const jump of jumps) jump.x = prog.length;
          return;
        }
        case "repeat": {
          for (let i = 0; i < n.min; i++) gen(n.node);
          if (n.max === Infinity) {
            const [at, split] = emitSplit();
            gen(n.node);
            emitJump(at);
            const out = prog.length;
            split.x = n.greedy ? at + 1 : out;
            split.y = n.greedy ? out : at + 1;
          } else {
            const splits = [];
            for (let i = n.min; i < n.max; i++) {
              splits.push(emitSplit());
              gen(n.node);
            }
            const out = prog.length;
            for (const [at, split] of splits) {
              split.x = n.greedy ? at + 1 : out;
              split.y = n.greedy ? out : at + 1;
            }
          }
          return;
        }
      }
    };
    emit2({ op: "save", slot: 0 });
    gen(node);
    emit2({ op: "save", slot: 1 });
    emit2({ op: "match" });
    return prog;
  }
  function requiredLiteral(node) {
    let best = "";
    let run2 = "";
    const end = () => {
      if (run2.length > best.length) best = run2;
      run2 = "";
    };
    const walk = (n) => {
      if (n.t === "char" && n.lit !== void 0) run2 += n.lit;
      else if (n.t === "cat") n.nodes.forEach(walk);
      else if (n.t === "group") walk(n.node);
      else if (n.t === "assert") {
      } else {
        end();
        if (n.t === "repeat" && n.min > 0) {
          const inner = requiredLiteral(n.node);
          if (inner.length > best.length) best = inner;
        }
      }
    };
    walk(node);
    end();
    return best;
  }
  var lastInput = "";
  var lastLower = "";
  var lowerOf = (input) => input === lastInput ? lastLower : lastLower = (lastInput = input).toLowerCase();
  function anchoredAtStart(prog) {
    for (const inst of prog) {
      if (inst.op === "save") continue;
      return inst.op === "assert" && inst.kind === "start";
    }
    return false;
  }
  function run(prog, slots, anchored, input) {
    const n = prog.length;
    let clist = [];
    let nlist = [];
    const mark = new Int32Array(n).fill(-1);
    let generation = 0;
    let matched = null;
    const add = (list3, pc0, caps0, pos) => {
      const stack = [[pc0, caps0]];
      while (stack.length) {
        const [pc, caps] = stack.pop();
        if (mark[pc] === generation) continue;
        mark[pc] = generation;
        const inst = prog[pc];
        switch (inst.op) {
          case "jmp":
            stack.push([inst.x, caps]);
            break;
          case "split":
            stack.push([inst.y, caps], [inst.x, caps]);
            break;
          case "save": {
            const next = caps.slice();
            next[inst.slot] = pos;
            stack.push([pc + 1, next]);
            break;
          }
          case "assert": {
            const before = input[pos - 1], after = input[pos];
            const ok = inst.kind === "start" ? pos === 0 : inst.kind === "end" ? pos === input.length : isWord(before) !== isWord(after) === (inst.kind === "word");
            if (ok) stack.push([pc + 1, caps]);
            break;
          }
          default:
            list3.push({ pc, caps });
        }
      }
    };
    const empty = new Array(slots).fill(-1);
    generation++;
    add(clist, 0, empty, 0);
    for (let pos = 0; ; pos++) {
      if (!clist.length && (matched || anchored)) break;
      generation++;
      const ch = input[pos];
      for (const thread of clist) {
        const inst = prog[thread.pc];
        if (inst.op === "match") {
          matched = thread.caps;
          break;
        }
        if (inst.op === "char" && ch !== void 0 && inst.test(ch)) add(nlist, thread.pc + 1, thread.caps, pos + 1);
      }
      if (pos >= input.length) break;
      if (!matched && !anchored) add(nlist, 0, empty, pos + 1);
      [clist, nlist] = [nlist, clist];
      nlist.length = 0;
    }
    return matched;
  }
  var cache = /* @__PURE__ */ new Map();
  function compileRe2(source, caseInsensitive = false) {
    const key = (caseInsensitive ? "i:" : "s:") + source;
    if (cache.has(key)) return cache.get(key);
    let result = null;
    try {
      const parser = new Parser(source, caseInsensitive);
      const ast = parser.parse();
      const prog = compileProgram(ast);
      const literal = requiredLiteral(ast);
      const possible = (input) => !literal || lowerOf(input).includes(literal);
      const slots = (parser.groups + 1) * 2;
      const anchored = anchoredAtStart(prog);
      result = {
        source,
        test: (input) => possible(input) && run(prog, slots, anchored, input) !== null,
        exec(input) {
          const caps = possible(input) ? run(prog, slots, anchored, input) : null;
          if (!caps) return null;
          const out = [];
          for (let i = 0; i < slots; i += 2) out.push(caps[i] >= 0 && caps[i + 1] >= 0 ? input.slice(caps[i], caps[i + 1]) : void 0);
          return out;
        }
      };
    } catch {
      result = null;
    }
    if (cache.size > 4e3) cache.clear();
    cache.set(key, result);
    return result;
  }

  // src/extensions/shared/net-request.ts
  function appliesToMainFrame(rule) {
    const c = rule?.condition || {};
    if (Array.isArray(c.resourceTypes)) return c.resourceTypes.includes("main_frame");
    if (Array.isArray(c.excludedResourceTypes)) return !c.excludedResourceTypes.includes("main_frame");
    return false;
  }

  // src/extensions/compat/apis/net-request.ts
  var observed2 = /* @__PURE__ */ Symbol.for("obsidian-bridge.dnr-observed");
  var DYNAMIC_KEY = "__obsidian_bridge_dnr_dynamic_v1__";
  var SESSION_KEY = "__obsidian_bridge_dnr_session_v1__";
  var ENABLED_KEY = "__obsidian_bridge_dnr_enabled_rulesets_v1__";
  var LIMITS = {
    MAX_NUMBER_OF_DYNAMIC_RULES: 3e4,
    MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES: 5e3,
    MAX_NUMBER_OF_SESSION_RULES: 5e3,
    MAX_NUMBER_OF_UNSAFE_SESSION_RULES: 5e3,
    MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES: 5e3,
    MAX_NUMBER_OF_REGEX_RULES: 1e3,
    MAX_NUMBER_OF_STATIC_RULESETS: 100,
    MAX_NUMBER_OF_ENABLED_STATIC_RULESETS: 50,
    GUARANTEED_MINIMUM_STATIC_RULES: 3e4,
    GETMATCHEDRULES_QUOTA_INTERVAL: 10,
    MAX_GETMATCHEDRULES_CALLS_PER_INTERVAL: 20
  };
  function validate(rules, existing) {
    if (!Array.isArray(rules)) return [];
    const out = [];
    for (const raw of rules) {
      const rule = raw;
      if (!rule || !Number.isInteger(rule.id) || rule.id < 1) throw new Error(`Rule with id ${JSON.stringify(raw?.id)} does not have a valid ID.`);
      if (existing.has(rule.id) || out.some((r) => r.id === rule.id)) throw new Error(`Rule with id ${rule.id} does not have a unique ID.`);
      if (!rule.action || typeof rule.action.type !== "string") throw new Error(`Rule with id ${rule.id} does not specify a valid action.`);
      if (rule.priority !== void 0 && (!Number.isInteger(rule.priority) || rule.priority < 1)) throw new Error(`Rule with id ${rule.id} has an invalid priority.`);
      if (typeof rule.condition?.regexFilter === "string" && !compileRe2(rule.condition.regexFilter)) {
        throw new Error(`Rule with id ${rule.id} specified a non-supported regular expression.`);
      }
      out.push(JSON.parse(JSON.stringify({ ...rule, priority: rule.priority ?? 1, condition: rule.condition ?? {} })));
    }
    return out;
  }
  var ruleList = (value) => Array.isArray(value) ? value.filter((r) => Number.isInteger(fields(r).id)) : [];
  var list = (value) => Array.isArray(value) ? value : [];
  function declaredRulesets(manifest) {
    const resources = fields(manifest.declarative_net_request).rule_resources;
    const out = [];
    for (const raw of list(resources)) {
      const { id, path, enabled } = fields(raw);
      if (typeof id === "string" && typeof path === "string") out.push({ id, path, enabled: enabled !== false });
    }
    return out;
  }
  function staticLoader(chrome) {
    const cache2 = /* @__PURE__ */ new Map();
    return (ruleset) => {
      if (!cache2.has(ruleset.id)) cache2.set(ruleset.id, (async () => {
        try {
          const response = await fetch(chrome.runtime.getURL(ruleset.path.replace(/^\//, "")));
          const parsed = await response.json();
          return ruleList(parsed).filter(appliesToMainFrame);
        } catch (e) {
          console.warn("[Chrome Bridge] declarativeNetRequest ruleset", ruleset.id, e);
          return [];
        }
      })());
      return cache2.get(ruleset.id);
    };
  }
  var isBridgePage2 = () => !isWorker && globalThis.location?.pathname === "/" + HOST_PAGE;
  function observeNative(ctx, dnr) {
    const { chrome, info, manifest, shared, report } = ctx;
    if (observed2 in dnr) return;
    report("declarativeNetRequest.enforced-by-obsidian", () => {
      const declared = declaredRulesets(manifest);
      const loadStatic = staticLoader(chrome);
      let pending = false;
      const announce = () => {
        if (pending) return;
        pending = true;
        setTimeout(() => void (async () => {
          pending = false;
          try {
            const [session, dynamic, enabled] = await Promise.all([
              invoke(chrome, dnr, "getSessionRules"),
              invoke(chrome, dnr, "getDynamicRules"),
              missingFn(dnr, "getEnabledRulesets") ? Promise.resolve(declared.filter((r) => r.enabled).map((r) => r.id)) : invoke(chrome, dnr, "getEnabledRulesets")
            ]);
            const enabledIds = list(enabled);
            const statics = (await Promise.all(declared.filter((r) => enabledIds.includes(r.id)).map(loadStatic))).flat();
            const rules = [...ruleList(session), ...ruleList(dynamic), ...statics].filter(appliesToMainFrame);
            shared.bridge.post({ type: "netRequest.rules", rules });
          } catch (e) {
            console.warn("[Chrome Bridge] declarativeNetRequest snapshot:", e);
          }
        })(), 0);
      };
      for (const method of ["updateSessionRules", "updateDynamicRules", "updateEnabledRulesets", "updateStaticRules"]) {
        const original = fnOf(dnr, method);
        if (!original) continue;
        define(dnr, method, (...args) => {
          const last = args.length - 1;
          const callback = callbackOf(args[last]);
          if (callback) args[last] = (...result) => {
            announce();
            callback(...result);
          };
          const returned = original.apply(dnr, args);
          if (isThenable(returned)) returned.then(announce, announce);
          return returned;
        });
      }
      try {
        Object.defineProperty(dnr, observed2, { value: true });
      } catch {
      }
      shared.bridge.on("bridge.sync", announce);
      if (isWorker || isBridgePage2()) announce();
      info.modes.declarativeNetRequest = "native rules enforced by Obsidian for Web Viewer top-level navigations (block/allow/redirect/upgradeScheme); sub-resources and modifyHeaders are not";
    });
  }
  function installNetRequest(ctx) {
    const { c, chrome, granted, info, manifest, shared, report } = ctx;
    if (!granted.has("declarativeNetRequest") && !granted.has("declarativeNetRequestWithHostAccess")) return;
    if (!shared.bridge.available) return;
    const native = nsOf(c, "declarativeNetRequest");
    if (native && fnOf(native, "updateSessionRules")) {
      observeNative(ctx, native);
      return;
    }
    report("declarativeNetRequest", () => {
      const existing = native ?? {};
      const local = nsOf(nsOf(c, "storage"), "local");
      const persistent = granted.has("storage") && !missingFn(local, "get");
      const boot = fields(fields(globalThis).__obsidianBridgeLocaleData).bridgeBootId;
      const bootId = typeof boot === "string" ? boot : null;
      const dynamic = /* @__PURE__ */ new Map();
      const session = /* @__PURE__ */ new Map();
      const declared = declaredRulesets(manifest);
      let enabledRulesets = new Set(declared.filter((r) => r.enabled).map((r) => r.id));
      const loadStatic = staticLoader(chrome);
      let announcing = false;
      const announce = () => {
        if (!isWorker || announcing) return;
        announcing = true;
        setTimeout(() => void (async () => {
          announcing = false;
          const statics = (await Promise.all(declared.filter((r) => enabledRulesets.has(r.id)).map(loadStatic))).flat();
          const rules = [...session.values(), ...dynamic.values(), ...statics].filter(appliesToMainFrame);
          shared.bridge.post({ type: "netRequest.rules", rules });
        })(), 0);
      };
      const save = () => {
        if (!persistent) return;
        invoke(chrome, local, "set", {
          [DYNAMIC_KEY]: [...dynamic.values()],
          [SESSION_KEY]: { boot: bootId, rules: [...session.values()] },
          [ENABLED_KEY]: [...enabledRulesets]
        }).catch((e) => console.warn("[Chrome Bridge] declarativeNetRequest persist:", e));
      };
      let chain = persistent ? invoke(chrome, local, "get", [DYNAMIC_KEY, SESSION_KEY, ENABLED_KEY]).then((raw) => {
        const all = fields(raw);
        for (const rule of ruleList(all[DYNAMIC_KEY])) dynamic.set(rule.id, rule);
        const stored = fields(all[SESSION_KEY]);
        if (stored.boot === bootId) for (const rule of ruleList(stored.rules)) session.set(rule.id, rule);
        if (Array.isArray(all[ENABLED_KEY])) enabledRulesets = new Set(list(all[ENABLED_KEY]).filter((id) => declared.some((r) => r.id === id)));
      }).catch((e) => console.warn("[Chrome Bridge] declarativeNetRequest restore:", e)) : Promise.resolve();
      const enqueue = (op) => {
        const result = chain.then(op);
        chain = result.then(() => void 0, () => void 0);
        return result.then((value) => {
          save();
          announce();
          return value;
        });
      };
      const update = (store, options) => enqueue(() => {
        const { removeRuleIds, addRules } = fields(options);
        const next = new Map(store);
        for (const id of list(removeRuleIds)) if (typeof id === "number") next.delete(id);
        const added = validate(addRules, next);
        for (const rule of added) next.set(rule.id, rule);
        store.clear();
        for (const [id, rule] of next) store.set(id, rule);
      });
      const read = (store, filter) => chain.then(() => {
        const { ruleIds } = fields(filter);
        const ids = Array.isArray(ruleIds) ? list(ruleIds) : null;
        return [...store.values()].filter((r) => !ids || ids.includes(r.id)).map((r) => JSON.parse(JSON.stringify(r)));
      });
      const args = (a, b) => callbackOf(a) ? [void 0, a] : [a, b];
      const api = {
        updateDynamicRules: (options, callback) => settle(update(dynamic, options).then(() => void 0), callback),
        updateSessionRules: (options, callback) => settle(update(session, options).then(() => void 0), callback),
        getDynamicRules: (a, b) => {
          const [filter, cb] = args(a, b);
          return settle(read(dynamic, filter), cb);
        },
        getSessionRules: (a, b) => {
          const [filter, cb] = args(a, b);
          return settle(read(session, filter), cb);
        },
        getEnabledRulesets: (callback) => settle(chain.then(() => [...enabledRulesets]), callback),
        updateEnabledRulesets: (options, callback) => settle(enqueue(() => {
          const { disableRulesetIds, enableRulesetIds } = fields(options);
          const disable = list(disableRulesetIds), enable = list(enableRulesetIds);
          for (const id of [...disable, ...enable]) {
            if (!declared.some((r) => r.id === id)) throw new Error(`Invalid ruleset id: ${text(id)}.`);
          }
          for (const id of disable) if (typeof id === "string") enabledRulesets.delete(id);
          for (const id of enable) if (typeof id === "string") enabledRulesets.add(id);
        }).then(() => void 0), callback),
        getAvailableStaticRuleCount: (callback) => callbackOrPromise(callback, LIMITS.GUARANTEED_MINIMUM_STATIC_RULES),
        // RE2, as Chrome compiles regexFilter (no backreferences or lookaround).
        isRegexSupported: (options, callback) => {
          const supported = !!compileRe2(text(fields(options).regex));
          return callbackOrPromise(callback, supported ? { isSupported: true } : { isSupported: false, reason: "syntaxError" });
        },
        getMatchedRules: (filter, callback) => callbackOrPromise(callbackOf(filter) ? filter : callback, { rulesMatchedInfo: [] }),
        setExtensionActionOptions: (_options, callback) => callbackOrPromise(callback, void 0)
      };
      for (const [key, value] of Object.entries(api)) if (missingFn(existing, key)) define(existing, key, value);
      if (!existing.onRuleMatchedDebug) define(existing, "onRuleMatchedDebug", event());
      for (const [key, value] of Object.entries({ ...LIMITS, SESSION_RULESET_ID: "_session", DYNAMIC_RULESET_ID: "_dynamic" })) {
        if (existing[key] === void 0) define(existing, key, value);
      }
      if (!c.declarativeNetRequest) define(c, "declarativeNetRequest", existing);
      shared.bridge.on("bridge.sync", () => {
        void chain.then(announce);
      });
      if (isWorker) void chain.then(announce);
      info.modes.declarativeNetRequest = shared.bridge.available ? "applied to Obsidian Web Viewer top-level navigations (block/allow/redirect/upgradeScheme); sub-resources and modifyHeaders are not intercepted" : "registration-only: BroadcastChannel unavailable, rules are not applied";
    });
  }

  // src/extensions/compat/kv.ts
  var DB = "__obsidian_bridge";
  var STORE = "kv";
  function createKV() {
    const idb = typeof indexedDB === "object" ? indexedDB : void 0;
    if (!idb) {
      const memory = /* @__PURE__ */ new Map();
      return {
        persistent: false,
        get: async (key) => memory.get(key),
        set: async (key, value) => {
          memory.set(key, structuredClone(value));
        }
      };
    }
    let db = null;
    const open = () => db ??= new Promise((resolve, reject) => {
      const request = idb.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        db = null;
        reject(request.error ?? new Error("IndexedDB open failed"));
      };
    });
    const run2 = (mode, fn) => open().then((database) => new Promise((resolve, reject) => {
      const request = fn(database.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    }));
    return {
      persistent: true,
      get: (key) => run2("readonly", (store) => store.get(key)),
      set: (key, value) => run2("readwrite", (store) => store.put(value, key)).then(() => void 0)
    };
  }

  // src/extensions/shared/inline-script.ts
  function runInlineScript(detail) {
    const frameAttr = "data-obsidian-bridge-relay";
    let message;
    try {
      message = JSON.parse(String(detail));
    } catch {
      return false;
    }
    if (typeof message?.code !== "string") return false;
    const findFrame = (win, token, depth) => {
      for (let i = 0; i < win.frames.length; i++) {
        try {
          const doc2 = win.frames[i].document;
          if (doc2?.documentElement?.getAttribute(frameAttr) === token) return doc2;
          const nested = depth < 4 ? findFrame(win.frames[i], token, depth + 1) : null;
          if (nested) return nested;
        } catch {
        }
      }
      return null;
    };
    const doc = typeof message.frame === "string" && findFrame(window, message.frame, 0) || document;
    const script = doc.createElement("script");
    script.textContent = message.code;
    (doc.head || doc.documentElement).appendChild(script);
    script.remove();
    return true;
  }

  // src/extensions/compat/apis/user-scripts.ts
  var PREFIX = "obsidian-us-";
  var PORT_PREFIX = "__obsidian_us__";
  var STATE_KEY = "userScripts.v1";
  var DEFAULT_WORLD = "";
  var list2 = (value) => Array.isArray(value) ? value : [];
  function globsAllow(include, exclude, url) {
    const test = (glob) => {
      let source = "^";
      for (const ch of glob) source += ch === "*" ? ".*" : ch === "?" ? "." : ch.replace(/[.+^${}()|[\]\\/]/g, (m) => "\\" + m);
      return new RegExp(source + "$").test(url);
    };
    if (include && include.length && !include.some(test)) return false;
    if (exclude && exclude.some(test)) return false;
    return true;
  }
  function userScriptWorld(worldId, messaging, portPrefix, inlineEvent, execEvent = null) {
    const g = globalThis;
    const marker = "__obsidianBridgeUserScriptWorld";
    if (g[marker]) return;
    const rt = g.chrome?.runtime;
    if (!rt) return;
    Object.defineProperty(g, marker, { value: true });
    const runtime = { id: rt.id, getURL: (path) => rt.getURL(path) };
    Object.defineProperty(runtime, "lastError", { enumerable: true, get: () => rt.lastError });
    if (messaging) {
      runtime.onMessage = rt.onMessage;
      runtime.onConnect = rt.onConnect;
      const tag = (message) => ({ __obsidianUserScript: 1, worldId, message });
      runtime.sendMessage = (...args) => {
        if (args.length > 1 && typeof args[0] === "string" && /^[a-p]{32}$/.test(args[0])) args.shift();
        args[0] = tag(args[0]);
        return rt.sendMessage(...args);
      };
      runtime.connect = (...args) => {
        const info = args.find((a) => !!a && typeof a === "object");
        const name = typeof info?.name === "string" ? info.name : "";
        const port = rt.connect({ name: portPrefix + JSON.stringify({ worldId, name }) });
        try {
          Object.defineProperty(port, "name", { value: name, configurable: true, enumerable: true });
        } catch {
        }
        return port;
      };
    }
    const prototypeOf = (win, name) => win[name]?.prototype;
    if (inlineEvent && typeof Node === "function" && typeof HTMLScriptElement === "function") {
      const inert = "application/x-obsidian-bridge-relayed";
      const frameAttr = "data-obsidian-bridge-relay";
      const relay = (node, parent) => {
        const el = node;
        if (!el || el.nodeType !== 1 || el.nodeName.toUpperCase() !== "SCRIPT" || el.isConnected || el.hasAttribute("src")) return null;
        const type = (el.getAttribute("type") || "").trim().toLowerCase();
        if (type && !/^(text|application)\/(java|ecma)script$/.test(type)) return null;
        const code = el.textContent || "";
        if (!code) return null;
        const host = parent;
        const doc = host ? host.nodeType === 9 ? host : host.ownerDocument : null;
        let frame = null;
        if (doc && doc !== document && doc.documentElement) {
          frame = Math.random().toString(36).slice(2);
          doc.documentElement.setAttribute(frameAttr, frame);
        }
        try {
          const detail = JSON.stringify({ code, frame });
          const ran = !!execEvent && !document.dispatchEvent(new CustomEvent(execEvent, { detail, cancelable: true }));
          if (!ran) document.dispatchEvent(new CustomEvent(inlineEvent, { detail }));
        } finally {
          if (frame) doc?.documentElement.removeAttribute(frameAttr);
        }
        const original = el.getAttribute("type");
        el.setAttribute("type", inert);
        return () => {
          if (original === null) el.removeAttribute("type");
          else el.setAttribute("type", original);
        };
      };
      const patchedRealms = /* @__PURE__ */ new WeakSet();
      const patchRealm = (realm) => {
        const win = realm;
        try {
          if (!win || patchedRealms.has(win) || !win.Node) return;
          patchedRealms.add(win);
        } catch {
          return;
        }
        const patch = (proto, method, targets) => {
          const original = proto?.[method];
          if (!proto || typeof original !== "function") return;
          const call = original;
          proto[method] = function(...args) {
            const restore = targets(this, args).map(([node2, parent]) => relay(node2, parent)).filter((r) => !!r);
            try {
              return call.apply(this, args);
            } finally {
              for (const r of restore) r();
            }
          };
        };
        const intoSelf = (self, args) => [[args[0], self]];
        const siblings = (self, args) => args.map((a) => [a, self.parentNode || self]);
        const node = prototypeOf(win, "Node"), element = prototypeOf(win, "Element");
        patch(node, "appendChild", intoSelf);
        patch(node, "insertBefore", intoSelf);
        patch(node, "replaceChild", intoSelf);
        for (const m of ["append", "prepend"]) patch(element, m, (self, args) => args.map((a) => [a, self]));
        for (const m of ["before", "after", "replaceWith"]) patch(element, m, siblings);
        patch(element, "insertAdjacentElement", (self, args) => [[
          args[1],
          typeof args[0] === "string" && /^(beforebegin|afterend)$/i.test(args[0]) ? self.parentNode || self : self
        ]]);
        for (const name of ["HTMLIFrameElement", "HTMLFrameElement"]) {
          const proto = prototypeOf(win, name);
          for (const prop of ["contentWindow", "contentDocument"]) {
            const descriptor = proto && Object.getOwnPropertyDescriptor(proto, prop);
            const getter = descriptor?.get;
            if (!proto || !getter) continue;
            Object.defineProperty(proto, prop, {
              ...descriptor,
              get() {
                const value = getter.call(this);
                try {
                  patchRealm(prop === "contentWindow" ? value : value?.defaultView);
                } catch {
                }
                return value;
              }
            });
          }
        }
      };
      patchRealm(g);
    }
    const facade = { runtime };
    const install = (win) => {
      Object.defineProperty(win, "chrome", { value: facade, configurable: true, writable: true });
      if ("browser" in win) Object.defineProperty(win, "browser", { value: facade, configurable: true, writable: true });
      if (win !== g) Object.defineProperty(win, marker, { value: true });
    };
    try {
      install(g);
    } catch {
    }
    const checked = /* @__PURE__ */ new WeakSet();
    const guard = (value) => {
      const win = value;
      if (!win || win === g || checked.has(win)) return;
      checked.add(win);
      try {
        if (win.chrome && win.chrome !== facade) install(win);
      } catch {
      }
    };
    const sweep = (value, depth) => {
      guard(value);
      const win = value;
      try {
        for (let i = 0; win && i < win.length && depth < 8; i++) sweep(win[i], depth + 1);
      } catch {
      }
    };
    const sweepAll = () => {
      let top = g;
      try {
        while (top.parent && top.parent !== top) top = top.parent;
      } catch {
      }
      sweep(top, 0);
    };
    sweepAll();
    const after = (proto, method) => {
      const original = proto?.[method];
      if (!proto || typeof original !== "function") return;
      const call = original;
      proto[method] = function(...args) {
        try {
          return call.apply(this, args);
        } finally {
          sweepAll();
        }
      };
    };
    const afterSet = (proto, prop) => {
      const descriptor = proto && Object.getOwnPropertyDescriptor(proto, prop);
      const setter = descriptor?.set;
      if (!proto || !setter) return;
      Object.defineProperty(proto, prop, { ...descriptor, set(value) {
        try {
          setter.call(this, value);
        } finally {
          sweepAll();
        }
      } });
    };
    if (typeof Node === "function" && typeof document === "object") {
      document.addEventListener("load", (event2) => {
        const win = event2.target?.contentWindow;
        if (!win || typeof win !== "object") return;
        checked.delete(win);
        sweep(win, 0);
      }, true);
      for (const m of ["appendChild", "insertBefore", "replaceChild"]) after(prototypeOf(g, "Node"), m);
      for (const m of ["append", "prepend", "before", "after", "replaceWith", "replaceChildren", "insertAdjacentElement", "insertAdjacentHTML", "setHTMLUnsafe"]) after(prototypeOf(g, "Element"), m);
      for (const m of ["write", "writeln"]) after(prototypeOf(g, "Document"), m);
      after(prototypeOf(g, "Range"), "insertNode");
      for (const p of ["innerHTML", "outerHTML"]) afterSet(prototypeOf(g, "Element"), p);
      for (const name of ["HTMLIFrameElement", "HTMLFrameElement", "HTMLObjectElement"]) {
        const proto = prototypeOf(g, name);
        for (const prop of ["contentWindow", "contentDocument"]) {
          const descriptor = proto && Object.getOwnPropertyDescriptor(proto, prop);
          const getter = descriptor?.get;
          if (!proto || !getter) continue;
          Object.defineProperty(proto, prop, {
            ...descriptor,
            get() {
              const value = getter.call(this);
              const win = prop === "contentWindow" ? value : value?.defaultView;
              if (win) sweep(win, 0);
              return value;
            }
          });
        }
      }
    }
    if (typeof g.open === "function") {
      const open = g.open.bind(g);
      try {
        Object.defineProperty(g, "open", {
          configurable: true,
          writable: true,
          value: (url, target, features) => {
            const win = open(url, target, features);
            if (win) sweep(win, 0);
            return win;
          }
        });
      } catch {
      }
    }
  }
  function inlineRelay(eventName, run2) {
    const marker = "__obsidianBridgeInlineRelay";
    const g = globalThis;
    if (g[marker]) return;
    Object.defineProperty(g, marker, { value: true });
    document.addEventListener(eventName, (event2) => {
      if (run2(event2.detail)) event2.stopImmediatePropagation();
    }, true);
  }
  async function sha256(code) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function validate2(script, existing, requireNew) {
    const s = fields(script);
    const id = s.id;
    if (typeof id !== "string" || !id) throw new Error("User script must have a non-empty ID.");
    if (id.startsWith("_")) throw new Error(`User script with ID '${id}' must not start with '_'.`);
    if (requireNew && id === "relay") throw new Error(`User script ID 'relay' is reserved by Obsidian.`);
    if (requireNew && existing.has(id)) throw new Error(`Duplicate script ID '${id}'.`);
    if (!Array.isArray(s.js) || !s.js.length) throw new Error(`User script with ID '${id}' must specify at least one js source.`);
    for (const source of list2(s.js)) {
      const hasCode = typeof fields(source).code === "string", hasFile = typeof fields(source).file === "string";
      if (hasCode === hasFile) throw new Error(`User script with ID '${id}' must specify exactly one of 'code' or 'file' per source.`);
    }
    const hasMatches = list2(s.matches).length > 0;
    const hasGlobs = list2(s.includeGlobs).length > 0;
    if (!hasMatches && !hasGlobs) throw new Error(`User script with ID '${id}' must specify 'matches' or 'includeGlobs'.`);
    if (s.world !== void 0 && s.world !== "MAIN" && s.world !== "USER_SCRIPT") throw new Error(`Invalid world for user script '${id}'.`);
    return JSON.parse(JSON.stringify(script));
  }
  function installUserScripts(ctx) {
    const { c, chrome, granted, info, manifest, shared, report } = ctx;
    const scripting = nsOf(c, "scripting");
    if (!granted.has("userScripts") || c.userScripts || !shared.bridge.available) return;
    if (missingFn(scripting, "registerContentScripts")) return;
    report("userScripts", () => {
      const kv = createKV();
      const facadeAllowed = !(Array.isArray(manifest.content_scripts) && manifest.content_scripts.length);
      let chain = Promise.resolve();
      const serial = (op) => {
        const result = chain.then(op);
        chain = result.then(() => void 0, () => void 0);
        return result;
      };
      const load = async () => {
        const state = await kv.get(STATE_KEY).catch(() => void 0);
        return { scripts: Array.isArray(state?.scripts) ? state.scripts : [], worlds: Array.isArray(state?.worlds) ? state.worlds : [] };
      };
      const worldOf = (state, id) => state.worlds.find((w) => (w.worldId ?? DEFAULT_WORLD) === (id ?? DEFAULT_WORLD)) ?? state.worlds.find((w) => (w.worldId ?? DEFAULT_WORLD) === DEFAULT_WORLD);
      const plan = async (state) => {
        const files = /* @__PURE__ */ new Map();
        const generated = async (code) => {
          const hash = await sha256(code);
          files.set(hash, code);
          return `${USER_SCRIPT_DIR}/${hash}.js`;
        };
        const registrations = [];
        const inlineEvent = "__obsidian_bridge_inline_" + chrome.runtime.id;
        let execEvent = null;
        try {
          execEvent = (await shared.bridge.request("userScripts.pageExec", {}, 5e3))?.event ?? null;
        } catch {
        }
        let relayNeeded = false;
        const ordered = [...state.scripts].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
        for (const script of ordered) {
          const main = script.world === "MAIN";
          const globs = !!(script.includeGlobs?.length || script.excludeGlobs?.length);
          const js = [];
          if (!main && facadeAllowed) {
            const world = worldOf(state, script.worldId);
            const inline = typeof world?.csp === "string" && world.csp.includes("'unsafe-inline'");
            relayNeeded ||= inline;
            js.push(await generated(`(${userScriptWorld.toString()})(${JSON.stringify(script.worldId ?? null)}, ${!!world?.messaging}, ${JSON.stringify(PORT_PREFIX)}, ${inline ? JSON.stringify(inlineEvent) : "null"}, ${inline ? JSON.stringify(execEvent) : "null"});
`));
          }
          for (const source of script.js) {
            if ("file" in source && !globs) {
              js.push(source.file.replace(/^\//, ""));
              continue;
            }
            let code = "code" in source ? source.code : "";
            if ("file" in source) {
              try {
                code = await (await fetch(chrome.runtime.getURL(source.file.replace(/^\//, "")))).text();
              } catch (e) {
                console.warn("[Chrome Bridge] userScripts source", source.file, e);
                continue;
              }
            }
            if (globs) {
              code = `if ((${globsAllow.toString()})(${JSON.stringify(script.includeGlobs ?? null)}, ${JSON.stringify(script.excludeGlobs ?? null)}, location.href)) {
${code}
}
`;
            }
            js.push(await generated(code));
          }
          registrations.push({
            id: PREFIX + script.id,
            js,
            matches: script.matches?.length ? script.matches : ["<all_urls>"],
            ...script.excludeMatches?.length ? { excludeMatches: script.excludeMatches } : {},
            allFrames: !!script.allFrames,
            runAt: script.runAt || "document_idle",
            world: main ? "MAIN" : "ISOLATED",
            persistAcrossSessions: true
          });
        }
        if (relayNeeded) {
          registrations.unshift({
            id: PREFIX + "relay",
            js: [await generated(`(${inlineRelay.toString()})(${JSON.stringify(inlineEvent)}, ${runInlineScript.toString()});
`)],
            matches: ["<all_urls>"],
            allFrames: true,
            runAt: "document_start",
            world: "MAIN",
            persistAcrossSessions: true
          });
        }
        return { registrations, files };
      };
      const writeFiles = async (files) => {
        const { missing } = await shared.bridge.request("userScripts.syncFiles", { keep: [...files.keys()], prune: false }, 1e4);
        const pending = (Array.isArray(missing) ? missing : []).filter((h) => files.has(h));
        let batch = [], size = 0;
        const flush = async () => {
          if (batch.length) await shared.bridge.request("userScripts.writeFiles", { files: batch }, 3e4);
          batch = [];
          size = 0;
        };
        for (const hash of pending) {
          const code = files.get(hash);
          if (size + code.length > 4e6) await flush();
          batch.push({ hash, code });
          size += code.length;
        }
        await flush();
      };
      const comparable = (r) => JSON.stringify([r.id, r.js, r.matches, r.excludeMatches ?? [], !!r.allFrames, r.runAt ?? "document_idle", r.world ?? "ISOLATED"]);
      const reconcile = async () => {
        const state = await load();
        const { registrations, files } = await plan(state);
        await writeFiles(files);
        const current = list2(await invoke(chrome, scripting, "getRegisteredContentScripts")).map(fields).flatMap((r) => typeof r.id === "string" && r.id.startsWith(PREFIX) ? [{ ...r, id: r.id }] : []);
        const wanted = new Map(registrations.map((r) => [r.id, comparable({ ...r })]));
        const order = (ids2) => ids2.filter((id) => wanted.has(id)).join("\n");
        const reorder = order(current.map((r) => r.id)) !== order(registrations.map((r) => r.id).filter((id) => current.some((cur) => cur.id === id)));
        const stale = current.filter((r) => reorder || wanted.get(r.id) !== comparable(r)).map((r) => r.id);
        const kept = new Set(current.map((r) => r.id).filter((id) => !stale.includes(id)));
        if (stale.length) await invoke(chrome, scripting, "unregisterContentScripts", { ids: stale });
        const add = registrations.filter((r) => !kept.has(r.id));
        if (add.length) await invoke(chrome, scripting, "registerContentScripts", add);
        await shared.bridge.request("userScripts.syncFiles", { keep: [...files.keys()], prune: true }, 1e4);
      };
      let scheduled = null;
      const scheduleReconcile = () => scheduled ??= new Promise((resolve) => setTimeout(() => {
        scheduled = null;
        serial(reconcile).then(resolve, (e) => {
          console.warn("[Chrome Bridge] userScripts sync (retried when Obsidian reconnects):", e);
          resolve();
        });
      }, 30));
      const mutate = (change) => serial(async () => {
        const state = await load();
        change(state);
        await kv.set(STATE_KEY, state);
      }).then(() => scheduleReconcile());
      const ids = (filter) => {
        const value = fields(filter).ids;
        return Array.isArray(value) ? list2(value).map((id) => text(id)) : null;
      };
      const filterAndCallback = (filter, callback) => callbackOf(filter) ? [void 0, filter] : [filter, callback];
      const api = {
        register: (scripts, callback) => settle(mutate((state) => {
          const existing = new Set(state.scripts.map((s) => s.id));
          const added = list2(scripts).map((s) => {
            const v = validate2(s, existing, true);
            existing.add(v.id);
            return v;
          });
          state.scripts.push(...added);
        }), callback),
        update: (scripts, callback) => settle(mutate((state) => {
          for (const patch of list2(scripts)) {
            const id = fields(patch).id;
            const index = state.scripts.findIndex((s) => s.id === id);
            if (index < 0) throw new Error(`Script with ID '${text(id)}' does not exist.`);
            state.scripts[index] = validate2({ ...state.scripts[index], ...fields(patch) }, /* @__PURE__ */ new Set(), false);
          }
        }), callback),
        unregister: (filterArg, callbackArg) => {
          const [filter, callback] = filterAndCallback(filterArg, callbackArg);
          const wanted = ids(filter);
          return settle(mutate((state) => {
            state.scripts = wanted ? state.scripts.filter((s) => !wanted.includes(s.id)) : [];
          }), callback);
        },
        getScripts: (filterArg, callbackArg) => {
          const [filter, callback] = filterAndCallback(filterArg, callbackArg);
          const wanted = ids(filter);
          return settle(serial(load).then((state) => state.scripts.filter((s) => !wanted || wanted.includes(s.id))), callback);
        },
        configureWorld: (properties = {}, callback) => settle(mutate((state) => {
          const requested = fields(properties);
          const key = typeof requested.worldId === "string" ? requested.worldId : DEFAULT_WORLD;
          const next = { ...state.worlds.find((w) => (w.worldId ?? DEFAULT_WORLD) === key) || {}, ...JSON.parse(JSON.stringify(requested)) };
          state.worlds = state.worlds.filter((w) => (w.worldId ?? DEFAULT_WORLD) !== key).concat(next);
        }), callback),
        getWorldConfigurations: (callback) => settle(serial(load).then((state) => state.worlds), callback),
        resetWorldConfiguration: (worldIdArg, callbackArg) => {
          const [worldId, callback] = filterAndCallback(worldIdArg, callbackArg);
          const key = typeof worldId === "string" ? worldId : DEFAULT_WORLD;
          return settle(mutate((state) => {
            state.worlds = state.worlds.filter((w) => (w.worldId ?? DEFAULT_WORLD) !== key);
          }), callback);
        },
        execute: (injectionArg, callback) => settle((async () => {
          const injection = fields(injectionArg);
          if (!injection.target || !Array.isArray(injection.js) || !injection.js.length) throw new Error("Invalid injection.");
          const script = validate2({ id: "execute", matches: ["<all_urls>"], ...injection, world: injection.world }, /* @__PURE__ */ new Set(), false);
          const { registrations, files } = await plan({ scripts: [script], worlds: (await serial(load)).worlds });
          await writeFiles(files);
          const own = registrations.find((r) => r.id === PREFIX + script.id);
          const results = await invoke(chrome, scripting, "executeScript", {
            target: injection.target,
            files: own.js,
            world: own.world,
            ...injection.injectImmediately ? { injectImmediately: true } : {}
          });
          return list2(results).map(fields).map((r) => ({
            frameId: r.frameId,
            documentId: r.documentId,
            result: r.result,
            ...r.error ? { error: text(r.error, "Error") } : {}
          }));
        })(), callback)
      };
      const namespace = {};
      for (const [key, value] of Object.entries(api)) define(namespace, key, value);
      define(c, "userScripts", namespace);
      if (isWorker) {
        shared.bridge.on("bridge.sync", () => {
          void scheduleReconcile();
        });
        void scheduleReconcile();
      }
      info.modes.userScripts = "registered as Electron content scripts in ID order; USER_SCRIPT world = the extension's isolated world with a restricted chrome object; inline <script> is relayed to the page when the world CSP allows 'unsafe-inline' (the page's own CSP still applies); eval is not available" + (facadeAllowed ? "" : "; user scripts see the full content-script API (the extension has its own content scripts)") + (kv.persistent ? "" : "; not persisted (no IndexedDB)");
    });
  }
  var routed = /* @__PURE__ */ Symbol.for("obsidian-bridge.user-script-routing");
  var isTagged = (m) => fields(m).__obsidianUserScript === 1;
  function installUserScriptMessaging({ c, report }) {
    const runtime = c.runtime;
    const onMessage = eventOf(runtime, "onMessage"), onConnect = eventOf(runtime, "onConnect");
    if (routed in runtime || !onMessage || !onConnect || missingEvent(runtime, "onMessage")) return;
    report("runtime.onUserScriptMessage", () => {
      try {
        Object.defineProperty(runtime, routed, { value: true });
      } catch {
      }
      const onUserScriptMessage = event();
      const onUserScriptConnect = event();
      define(runtime, "onUserScriptMessage", onUserScriptMessage);
      define(runtime, "onUserScriptConnect", onUserScriptConnect);
      const routedPorts = /* @__PURE__ */ new WeakSet();
      const nativeAddMessage = onMessage.addListener.bind(onMessage);
      const nativeAddConnect = onConnect.addListener.bind(onConnect);
      nativeAddMessage((message, sender, sendResponse) => {
        if (!isTagged(message)) return void 0;
        const respond = callbackOf(sendResponse) ?? (() => void 0);
        const from = { ...fields(sender), ...message.worldId ? { userScriptWorldId: message.worldId } : {} };
        let keepOpen = false;
        for (const listener of listenersOf(onUserScriptMessage)) {
          try {
            const result = listener(message.message, from, respond);
            if (result === true) keepOpen = true;
            else if (isThenable(result)) {
              keepOpen = true;
              result.then(respond, () => respond(void 0));
            }
          } catch (e) {
            console.error("[Chrome Bridge] onUserScriptMessage listener threw:", e);
          }
        }
        return keepOpen;
      });
      nativeAddConnect((portArg) => {
        const port = portArg;
        if (!port || typeof port.name !== "string" || !port.name.startsWith(PORT_PREFIX)) return;
        let meta = {};
        try {
          meta = fields(JSON.parse(port.name.slice(PORT_PREFIX.length)));
        } catch {
        }
        routedPorts.add(port);
        try {
          Object.defineProperty(port, "name", { value: text(meta.name), configurable: true, enumerable: true });
        } catch {
        }
        if (meta.worldId && port.sender) {
          try {
            port.sender.userScriptWorldId = meta.worldId;
          } catch {
          }
        }
        for (const listener of listenersOf(onUserScriptConnect)) {
          try {
            listener(port);
          } catch (e) {
            console.error("[Chrome Bridge] onUserScriptConnect listener threw:", e);
          }
        }
      });
      const hide = (target, skip) => {
        const wrapped = /* @__PURE__ */ new WeakMap();
        const add = fnOf(target, "addListener"), remove = fnOf(target, "removeListener"), has = fnOf(target, "hasListener");
        if (!add || !remove || !has) return;
        define(target, "addListener", (fn, ...rest) => {
          const listener = callbackOf(fn);
          if (!listener) return add.call(target, fn, ...rest);
          let w = wrapped.get(listener);
          if (!w) {
            w = function(...args) {
              return skip(args) ? void 0 : listener.apply(this, args);
            };
            wrapped.set(listener, w);
          }
          return add.call(target, w, ...rest);
        });
        const known = (fn) => {
          const listener = callbackOf(fn);
          return (listener && wrapped.get(listener)) ?? fn;
        };
        define(target, "removeListener", (fn) => remove.call(target, known(fn)));
        define(target, "hasListener", (fn) => has.call(target, known(fn)));
      };
      hide(onMessage, (args) => isTagged(args[0]));
      hide(onConnect, (args) => !!args[0] && typeof args[0] === "object" && routedPorts.has(args[0]));
    });
  }

  // src/extensions/compat/apis/notifications.ts
  var MAX_ICON_BYTES2 = 256 * 1024;
  async function iconData(chrome, iconUrl) {
    if (typeof iconUrl !== "string" || !iconUrl) return void 0;
    if (/^data:image\//i.test(iconUrl)) return iconUrl;
    let url;
    try {
      url = new URL(iconUrl, globalThis.location?.href ?? chrome.runtime.getURL(""));
    } catch {
      return void 0;
    }
    if (url.protocol !== "chrome-extension:" || url.hostname !== chrome.runtime.id) return void 0;
    try {
      const response = await fetch(url.href);
      const blob = await response.blob();
      if (!response.ok || blob.size > MAX_ICON_BYTES2) return void 0;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
      const type = /^image\/(png|jpeg|gif|webp|svg\+xml)$/.test(blob.type) ? blob.type : "image/png";
      return `data:${type};base64,${btoa(binary)}`;
    } catch {
      return void 0;
    }
  }
  var randomId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  function installNotifications(ctx) {
    const { c, chrome, granted, info, shared, report } = ctx;
    if (!granted.has("notifications") || c.notifications || !shared.bridge.available) return;
    report("notifications", () => {
      const events2 = shared.once("notifications.events", () => {
        const all = { onClicked: event(), onClosed: event(), onButtonClicked: event(), onPermissionLevelChanged: event(), onShowSettings: event() };
        shared.bridge.on("notifications.event", (message) => {
          if (typeof message.id !== "string") return;
          if (message.event === "onClicked") emit(all.onClicked, message.id);
          else if (message.event === "onButtonClicked" && Number.isInteger(message.buttonIndex)) emit(all.onButtonClicked, message.id, message.buttonIndex);
          else if (message.event === "onClosed") emit(all.onClosed, message.id, message.byUser === true);
        });
        return all;
      });
      const show = async (id, raw, update) => {
        if (!raw || typeof raw !== "object") throw new Error("Invalid notification options.");
        const options = fields(raw);
        if (!update && (!options.type || !options.title || options.message === void 0 || !options.iconUrl)) {
          throw new Error("Some of the required properties are missing: type, iconUrl, title and message.");
        }
        const plain = JSON.parse(JSON.stringify({ ...options, iconUrl: void 0, imageUrl: void 0, appIconMaskUrl: void 0 }));
        const iconUrl = await iconData(chrome, options.iconUrl);
        if (iconUrl) plain.iconUrl = iconUrl;
        const { shown } = await shared.bridge.request("notifications.show", { id, options: plain, update }, 5e3);
        return shown;
      };
      const api = {
        create(...args) {
          const callback = callbackOf(args[args.length - 1]) ? args.pop() : void 0;
          const [id, options] = typeof args[0] === "string" ? [args[0] || randomId(), args[1]] : [randomId(), args[0]];
          return settle(show(id, options, false).then(() => id), callback);
        },
        update(id, options, callback) {
          return settle(show(text(id), options, true), callback);
        },
        clear(id, callback) {
          return settle(shared.bridge.request("notifications.clear", { id: text(id) }, 5e3).then((r) => !!r?.cleared), callback);
        },
        getAll(callback) {
          return settle(shared.bridge.request("notifications.getAll", {}, 5e3).then((r) => Object.fromEntries((r?.ids ?? []).map((id) => [id, true]))), callback);
        },
        getPermissionLevel(callback) {
          return settle(Promise.resolve("granted"), callback);
        },
        TemplateType: { BASIC: "basic", IMAGE: "image", LIST: "list", PROGRESS: "progress" },
        PermissionLevel: { GRANTED: "granted", DENIED: "denied" },
        ...events2
      };
      define(c, "notifications", api);
      info.modes.notifications = "shown as Obsidian notices (title, message, icon, progress, items, buttons); images are not shown";
    });
  }

  // src/extensions/compat/apis/cookies.ts
  var STORE2 = { id: "0", tabIds: [] };
  function installCookies(ctx) {
    const { c, granted, info, shared, report } = ctx;
    if (!granted.has("cookies") || c.cookies || !shared.bridge.available) return;
    report("cookies", () => {
      const onChanged = shared.once("cookies.onChanged", () => {
        let announced = false;
        const announce = () => {
          const active = listenerCount(e) > 0;
          if (active === announced || !isWorker && !active) return;
          announced = active;
          shared.bridge.post({ type: "cookies.listeners", active });
        };
        const e = event({ onChange: announce });
        shared.bridge.on("cookies.changed", (message) => {
          if (message.info?.cookie) emit(e, message.info);
        });
        shared.bridge.on("bridge.sync", () => {
          if (announced) shared.bridge.post({ type: "cookies.listeners", active: true });
        });
        return e;
      });
      const call = (method, details, callback) => settle(shared.bridge.request(method, JSON.parse(JSON.stringify(details ?? {})), 1e4), callback);
      define(c, "cookies", {
        get: (details, callback) => call("cookies.get", details, callback),
        getAll: (details, callback) => call("cookies.getAll", details, callback),
        set: (details, callback) => call("cookies.set", details, callback),
        remove: (details, callback) => call("cookies.remove", details, callback),
        getAllCookieStores: (callback) => settle(Promise.resolve([{ ...STORE2, tabIds: [...STORE2.tabIds] }]), callback),
        getPartitionKey: (_details, callback) => settle(Promise.resolve({ partitionKey: {} }), callback),
        onChanged,
        OnChangedCause: { EVICTED: "evicted", EXPIRED: "expired", EXPLICIT: "explicit", EXPIRED_OVERWRITE: "expired_overwrite", OVERWRITE: "overwrite" },
        SameSiteStatus: { NO_RESTRICTION: "no_restriction", LAX: "lax", STRICT: "strict", UNSPECIFIED: "unspecified" }
      });
      info.modes.cookies = 'the Web Viewer session cookie store (one store "0"); partitioned cookies are not supported';
    });
  }

  // src/extensions/compat/compat-api.ts
  var VERSION = "0.15.0";
  (() => {
    const g = globalThis;
    const chrome = g.chrome;
    if (!isChromeRoot(chrome)) return;
    if (g.__obsidianBridgeCompatV06) return;
    const info = { version: VERSION, extensionId: chrome.runtime.id, installed: [], failed: [], modes: {} };
    Object.defineProperty(g, "__obsidianBridgeCompatV06", { value: info, configurable: false });
    if (isWorker && typeof globalThis.addEventListener === "function") {
      const describe = (e) => e instanceof Error ? `${e.name}: ${e.message}
${e.stack || ""}` : text(e, typeof e);
      globalThis.addEventListener("error", (ev) => console.error(
        "[Chrome Bridge Worker] Uncaught:",
        describe(ev.error ?? ev.message),
        `${ev.filename || ""}:${ev.lineno || 0}:${ev.colno || 0}`
      ));
      globalThis.addEventListener("unhandledrejection", (ev) => console.error("[Chrome Bridge Worker] Unhandled rejection:", describe(ev.reason)));
      info.installed.push("worker.error-trap");
    }
    const manifest = fnOf(chrome.runtime, "getManifest") && chrome.runtime.getManifest?.() || { manifest_version: 3, version: "0" };
    const strings2 = (value) => Array.isArray(value) ? value.filter((x) => typeof x === "string") : [];
    const singletons = /* @__PURE__ */ new Map();
    const shared = {
      bridge: createBridge(),
      navigation: /* @__PURE__ */ new Set(),
      contextMenus: /* @__PURE__ */ new Set(),
      once(key, create) {
        if (!singletons.has(key)) singletons.set(key, create());
        return singletons.get(key);
      }
    };
    const installOn = (c, tag) => {
      const ctx = {
        c,
        chrome,
        tag,
        info,
        manifest,
        shared,
        granted: new Set(strings2(manifest.permissions)),
        hosts: new Set(strings2(manifest.host_permissions)),
        report(key, fn) {
          const name = tag + key;
          try {
            fn();
            info.installed.push(name);
          } catch (error) {
            info.failed.push(`${name}: ${String(error)}`);
          }
        }
      };
      installI18n(ctx);
      installPermissions(ctx);
      installCommands(ctx);
      installExtension(ctx);
      installWebNavigation(ctx);
      installStorage(ctx);
      installAlarms(ctx);
      installContextMenus(ctx);
      installTabs(ctx);
      installAction(ctx);
      installOpen(ctx);
      installWindows(ctx);
      installTabExtras(ctx);
      installNotifications(ctx);
      installCookies(ctx);
      installNetRequest(ctx);
      installUserScripts(ctx);
      if (info.installed.includes("userScripts")) installUserScriptMessaging(ctx);
      installRuntimeExtras(ctx);
    };
    installOn(chrome, "");
    const alt = g.browser;
    if (isNamespace(alt) && alt !== chrome && typeof alt === "object") {
      for (const key of [
        "i18n",
        "permissions",
        "commands",
        "extension",
        "webNavigation",
        "alarms",
        "contextMenus",
        "action",
        "tabs",
        "storage",
        "scripting",
        "windows",
        "declarativeNetRequest",
        "userScripts",
        "notifications",
        "cookies"
      ]) {
        if (alt[key] == null && chrome[key] != null) {
          try {
            define(alt, key, chrome[key]);
            info.installed.push(`browser:${key}=chrome.${key}`);
          } catch (error) {
            info.failed.push(`browser:${key}: ${String(error)}`);
          }
        }
      }
      if (isChromeRoot(alt)) installOn(alt, "browser:");
    }
    deliverWebNavigation({ shared });
    installPageOpen({ shared, info });
    info.bridge = shared.bridge.available ? "broadcast-channel" : "unavailable";
    console.debug("[Chrome Bridge Compat] " + JSON.stringify(info));
    if (info.failed.length) console.warn("[Chrome Bridge] \u90E8\u5206 API \u517C\u5BB9\u5C42\u5B89\u88C5\u5931\u8D25", info);
  })();
})();
