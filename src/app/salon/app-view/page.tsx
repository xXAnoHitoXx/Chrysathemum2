"use client";

import { useState } from "react";
import {
    appointment_view_default_save,
    AppointmentView,
} from "./_activity/appointment_view";
import {
    daily_record_default_save,
    DailyRecordView,
} from "./_activity/daily_record_view";
import { last_customer_default_save } from "./_components/customer_search";
import {
    customer_history_default_save,
    CustomerView,
} from "./_activity/customer_view";
import { SummaryView } from "./_activity/sumary_view";

export enum AppViewActivity {
    AppointmentView,
    DailyRecordView,
    CustomerView,
    SummaryView,
}

export default function Page() {
    const [activity, set_activity] = useState(AppViewActivity.AppointmentView);

    const [appointment_view_save] = useState(appointment_view_default_save);
    const [daily_record_save] = useState(daily_record_default_save);

    const [last_customer_save] = useState(last_customer_default_save);

    const [customer_history] = useState(customer_history_default_save);

    switch (activity) {
        case AppViewActivity.CustomerView:
            return (
                <CustomerView
                    saved_list={customer_history}
                    last_customer_save={last_customer_save}
                    return={() => set_activity(AppViewActivity.AppointmentView)}
                />
            );
        case AppViewActivity.DailyRecordView:
            return (
                <DailyRecordView
                    return={() => set_activity(AppViewActivity.AppointmentView)}
                    saves={daily_record_save}
                />
            );
        case AppViewActivity.SummaryView:
            return <SummaryView/>;
        default:
            return (
                <AppointmentView
                    set_activity={set_activity}
                    last_customer_save={last_customer_save}
                    save_state={appointment_view_save}
                />
            );
    }
}
