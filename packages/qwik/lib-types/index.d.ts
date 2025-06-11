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
export declare const RevenueHero: import("@builder.io/qwik").Component<IRevenueHeroProps>;
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
export declare const useRevenueHero: (params: IRevenueHeroParams) => import("@builder.io/qwik").QRL<(formData: Record<string, any>) => Promise<any>>;
export {};
