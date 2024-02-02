export type TDayVisibility = "calendar_days" | "available_days";

export interface ISchedulerAccount {
  id: string;
  type: "account";
  attributes: {
    company: string;
    email_domain: string;
    time_zone: string;
    image_url: string;
    scheduler_colors: Record<string, any>;
    whitelabel: boolean;
    widget_redirect_timeout: number;
  };
}

export interface ISchedulerMeetingType {
  id: string;
  type: "meeting_type";
  attributes: {
    duration: number;
    greeting_text: string;
    booking_days_limit: number;
    description: string;
    day_visibility: TDayVisibility;
  };
}

export interface ISchedulerFormRouter {
  id: string;
  type: "form_router";
  attributes: {
    redistribution_timeout: number;
  };
}

export interface ISchedulerFormSession {
  data: {
    id: string;
    type: "form_session";
    attributes: {
      meeting_slots: string[];
      booking_date: string;
      time_zone: string;
      session_id: string;
      redirect_url: string;
      next_available_dates: string[];
      redistribution_redirect: string;
    };
  };
  included: Array<
    ISchedulerMeetingType | ISchedulerAccount | ISchedulerFormRouter
  >;
}
