"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const qwik = require("@builder.io/qwik");
const RH_GLOBAL_STORAGE_KEYS = [
  "RH_EMBED_TARGET",
  "RH_DATA_SOURCE",
  "RH_SESSION_ID",
  "RH_ROUTER_ID",
  "RH_FORM_SUBMITTED"
];
function loadScript() {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://assets.revenuehero.io/scheduler.min.js"]');
    if (existingScript) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.addEventListener("load", () => {
      resolve();
    });
    el.addEventListener("error", (e) => {
      reject(e);
    });
    el.type = "text/javascript";
    el.async = true;
    el.src = "https://assets.revenuehero.io/scheduler.min.js";
    document.body.appendChild(el);
  });
}
const scriptLoader = {
  loadPromise: null
};
const RevenueHero = qwik.component$((props) => {
  const { enabled, embedTarget, formId, onLoad, ...params } = props;
  const init = qwik.$(() => {
    const RevenueHero2 = window.RevenueHero;
    if (!RevenueHero2) {
      throw new Error("RevenueHero is not available");
    }
    if (formId) {
      const instance = new RevenueHero2(params);
      instance.schedule(formId, embedTarget);
    }
    onLoad?.();
  });
  qwik.useVisibleTask$(({ track, cleanup }) => {
    track(() => enabled);
    if (!enabled) return;
    if (scriptLoader.loadPromise === null) {
      scriptLoader.loadPromise = loadScript();
    }
    scriptLoader.loadPromise.then(() => {
      if (typeof window.RevenueHero === "undefined") {
        return;
      }
      init();
    }).catch(() => {
    });
    cleanup(() => {
      if (window.RevenueHero === void 0) return;
      if (window.RevenueHero.formsConnected) {
        window.RevenueHero.formsConnected.length = 0;
      }
      RH_GLOBAL_STORAGE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
      });
    });
  });
  return null;
});
exports.RevenueHero = RevenueHero;
