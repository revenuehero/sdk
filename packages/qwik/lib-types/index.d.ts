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
export {};
