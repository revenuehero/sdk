import { useEffect } from "react";
import { type ISchedulerFormSession } from "./types";

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
   * Locale for the RevenueHero component.
   */
  locale?: string;

  /**
   * Determines whether to show loader when the scheduler is loading.
   */
  showLoader?: boolean;
}

export type TCustomFormTypes = "pardot" | "jotForm";

/**
 * Props for the RevenueHero component.
 */
export interface IRevenueHeroProps extends IRevenueHeroParams {
  /**
   * Callback function called when the RevenueHero component is loaded.
   * @param revenueHero - The loaded RevenueHero instance.
   */
  onLoad: (revenueHero: RevenueHeroClient) => void;

  /**
   * The ID of this RevenueHero instance.
   */
  id: string;

  /**
   * Whether or not to enable the RevenueHero component.
   * Once enabled, the script will be loaded and the onLoad callback will be called.
   * It cannot be disabled after enabling.
   */
  enabled: boolean;
}

/**
 * Represents a RevenueHero instance.
 */
interface RevenueHeroClient {
  prototype: RevenueHeroClient;
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (params: IRevenueHeroParams): RevenueHeroClient;

  /**
   * Submit and open the scheduler.
   * @param data - The data to submit.
   * @returns A promise that resolves to the scheduler form session or null.
   */
  submit: (data: Record<string, any>) => Promise<ISchedulerFormSession | null>;

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

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

let loadPromise: Promise<void> | null = null;

const LoadCache = new Set<string>();

function loadScript({
  onLoad,
  id = "rh-script",
  ...params
}: IRevenueHeroProps): void {
  const hasLoadedScript =
    document.querySelector(`script[data-rh-script]`) !== null;

  function handleScriptLoad(): void {
    const hero = new window.RevenueHero(params);
    onLoad?.(hero);
    LoadCache.add(id);
  }

  /**
   * if script has already been loaded and the onLoad callback has not been called yet
   */
  if (hasLoadedScript && loadPromise !== null) {
    if (!LoadCache.has(id)) {
      void loadPromise.then(handleScriptLoad);
    }

    return;
  }

  const el = document.createElement("script");

  loadPromise = new Promise<void>((resolve, reject) => {
    el.addEventListener("load", () => {
      resolve();
    });

    el.addEventListener("error", (e) => {
      reject(e);
    });
  })
    .then(handleScriptLoad)
    .catch((e) => {
      console.error("[RevenueHero Error]:", e);
    });

  el.src =
    process.env.NODE_ENV === "production"
      ? "https://app.revenuehero.io/scheduler.min.js"
      : process.env.NODE_ENV === "staging"
      ? "https://app.aysr.io/scheduler.min.js"
      : "http://localhost:4200/scheduler.min.js";

  el.setAttribute("data-rh-script", "");

  document.body.appendChild(el);
}

export function RevenueHero(props: IRevenueHeroProps): JSX.Element | null {
  useEffect(() => {
    if (!isBrowser || !props.enabled) return;

    loadScript(props);
  }, [props]);

  return null;
}
