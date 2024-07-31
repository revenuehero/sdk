import { memo, useEffect } from "react";

export type TCustomFormTypes = "pardot" | "jotForm";

export interface IRevenueHeroParams {
  /**
   * Inbound router ID.
   */
  routerId: string;

  /**
   * Form type.
   */
  formType?: TCustomFormTypes;

  /**
   * Localized text for the greeting message.
   */
  greetingText?: string;

  /**
   * Locale for the RevenueHero Scheduler.
   */
  locale?: string;

  /**
   * Determines whether to show loader when the scheduler is loading.
   */
  showLoader?: boolean;
}

/**
 * Props for the RevenueHero component.
 */
export interface IRevenueHeroProps extends IRevenueHeroParams {
  /**
   * Whether or not to enable the RevenueHero component.
   * Once enabled, the script will be loaded and the onLoad callback will be called.
   * It cannot be disabled after enabling.
   */
  enabled?: boolean;

  /**
   * The target element ID where the scheduler will be embedded.
   */
  embedTarget?: string;

  /**
   * The ID of the form.
   */
  formId: string;

  /**
   * Callback function called when the RevenueHero component is loaded.
   */
  onLoad?: () => void;
}

/**
 * Represents a RevenueHero instance.
 */
interface RevenueHeroClient {
  prototype: RevenueHeroClient;
  new (params: IRevenueHeroParams): RevenueHeroClient;

  /**
   * Schedule a form.
   * @param formId - The ID of the form to schedule.
   * @param embedTarget - The ID of the element to embed the scheduler into.
   */
  schedule: (formId: string, embedTarget?: string) => void;
}

declare global {
  interface Window {
    RevenueHero: RevenueHeroClient;
  }
}

const RH_GLOBAL_STORAGE_KEYS = [
  "RH_EMBED_TARGET",
  "RH_DATA_SOURCE",
  "RH_SESSION_ID",
  "RH_ROUTER_ID",
  "RH_FORM_SUBMITTED",
];

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

function loadScript(): Promise<void> {
  const el = document.createElement("script");

  const promise = new Promise<void>((resolve, reject) => {
    el.addEventListener("load", () => {
      resolve();
    });

    el.addEventListener("error", (e) => {
      reject(e);
    });
  });

  el.src = "https://app.revenuehero.io/scheduler.min.js";

  document.body.appendChild(el);

  return promise;
}

/**
 * ! Why this promise is hoisted ?
 * - when multiple RevenueHero components are mounted at the same time, the script is loaded only once.
 * - the promise is hoisted to wait till script is loaded and then call the init function.
 */
let loadPromise: Promise<void> | null = null;

export const RevenueHero = memo(
  ({
    enabled,
    embedTarget,
    formId,
    onLoad,
    ...props
  }: IRevenueHeroProps): JSX.Element | null => {
    useEffect(() => {
      const init = () => {
        const RevenueHero = window.RevenueHero;

        if (!RevenueHero) {
          throw new Error("RevenueHero is not available");
        }

        const instance = new RevenueHero(props);

        instance.schedule(formId, embedTarget);

        onLoad?.();
      };

      if (!isBrowser || !enabled) return;

      if (loadPromise === null) {
        loadPromise = loadScript();
      }

      loadPromise.then(init);

      // reset global state when parent component unmounts
      return () => {
        if (window.RevenueHero === undefined) return;

        // @ts-expect-error formsConnected is static property on RevenueHero constructor
        window.RevenueHero.formsConnected = [];

        RH_GLOBAL_STORAGE_KEYS.forEach((key) => {
          localStorage.removeItem(key);
        });
      };
    }, [embedTarget, enabled, formId, onLoad, props]);

    return null;
  }
);
