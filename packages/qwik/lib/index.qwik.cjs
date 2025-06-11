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
const useRevenueHero = (params) => {
  const isLoaded = qwik.useSignal(false);
  qwik.useVisibleTask$(() => {
    if (scriptLoader.loadPromise === null) {
      scriptLoader.loadPromise = loadScript();
    }
    scriptLoader.loadPromise.then(() => {
      isLoaded.value = true;
    }).catch(() => {
      console.error("[RevenueHero] Failed to load script");
    });
  });
  return qwik.$((formData) => {
    if (!isLoaded.value || typeof window.RevenueHero === "undefined") {
      console.error("[RevenueHero] Script not loaded yet");
      return Promise.reject(new Error("RevenueHero not loaded"));
    }
    const instance = new window.RevenueHero(params);
    return instance.submit(formData).then((response) => {
      if (response) {
        instance.dialog.open(response);
      }
      return response;
    });
  });
};
exports.RevenueHero = RevenueHero;
exports.useRevenueHero = useRevenueHero;
