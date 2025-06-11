import { component$, useVisibleTask$, useSignal, $ } from '@builder.io/qwik';

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
   * auto schedules when form selector is provided
   */
  formId?: string;

  /**
   * Callback function called when the RevenueHero component is loaded.
   */
  onLoad?: () => void;
}

/**
 * Represents a RevenueHero instance.
 */
interface RevenueHeroInstance {
  /**
   * Schedule a form.
   * @param formId - The ID of the form to schedule.
   * @param embedTarget - The ID of the element to embed the scheduler into.
   */
  schedule: (formId: string, embedTarget?: string) => void;
  
  /**
   * Submit form data directly to RevenueHero
   */
  submit: (data: Record<string, any>) => Promise<any>;
  
  /**
   * Dialog instance for opening the scheduler
   */
  dialog: {
    open: (response: any) => void;
  };
}

/**
 * Represents the RevenueHero constructor/class.
 */
interface RevenueHeroClient {
  prototype: RevenueHeroInstance;
  new (params: IRevenueHeroParams): RevenueHeroInstance;

  /**
   * Static property to track connected forms
   */
  formsConnected: string[];
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
  return new Promise<void>((resolve, reject) => {
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

/**
 * ! Why this promise is hoisted ?
 * - when multiple RevenueHero components are mounted at the same time, the script is loaded only once.
 * - the promise is hoisted to wait till script is loaded and then call the init function.
 */
const scriptLoader = {
  loadPromise: null as Promise<void> | null
};

// Main RevenueHero component export
export const RevenueHero = component$<IRevenueHeroProps>((props) => {
  const { enabled, embedTarget, formId, onLoad, ...params } = props;

  const init = $(() => {
    const RevenueHero = window.RevenueHero;

    if (!RevenueHero) {
      throw new Error("RevenueHero is not available");
    }

    if (formId) {
      const instance = new RevenueHero(params);
      instance.schedule(formId, embedTarget);
    }

    onLoad?.();
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => enabled);

    if (!enabled) return;

    if (scriptLoader.loadPromise === null) {
      scriptLoader.loadPromise = loadScript();
    }

    scriptLoader.loadPromise
      .then(() => {
        if (typeof window.RevenueHero === 'undefined') {
          return;
        }
        init();
      })
      .catch(() => {
        // Failed to load script
      });

    cleanup(() => {
      if (window.RevenueHero === undefined) return;

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

/**
 * Hook for manual RevenueHero submission in Qwik forms
 * 
 * @example
 * ```tsx
 * export default component$(() => {
 *   const submitToRH = useRevenueHero({ routerId: 'your-router-id' });
 * 
 *   const handleSubmit = $((event: SubmitEvent, form: HTMLFormElement) => {
 *     // Your form logic here
 *     const formData = new FormData(form);
 *     const data = Object.fromEntries(formData.entries());
 *     
 *     // Submit to RevenueHero
 *     submitToRH(data);
 *   });
 * 
 *   return (
 *     <form preventdefault:submit onSubmit$={handleSubmit}>
 *       <input name="email" type="email" />
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 * });
 * ```
 */
export const useRevenueHero = (params: IRevenueHeroParams) => {
  const isLoaded = useSignal(false);

  // Ensure script is loaded when hook is used
  useVisibleTask$(() => {
    if (scriptLoader.loadPromise === null) {
      scriptLoader.loadPromise = loadScript();
    }

    scriptLoader.loadPromise
      .then(() => {
        isLoaded.value = true;
      })
      .catch(() => {
        console.error('[RevenueHero] Failed to load script');
      });
  });

  return $((formData: Record<string, any>) => {
    if (!isLoaded.value || typeof window.RevenueHero === 'undefined') {
      console.error('[RevenueHero] Script not loaded yet');
      return Promise.reject(new Error('RevenueHero not loaded'));
    }

    const instance = new window.RevenueHero(params);
    
    return instance.submit(formData).then((response: any) => {
      if (response) {
        instance.dialog.open(response);
      }
      return response;
    });
  });
};