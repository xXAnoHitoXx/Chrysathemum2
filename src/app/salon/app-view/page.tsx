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

export enum AppViewActivity {
    AppointmentView,
    DailyRecordView,
}

export default function Page() {
    const [activity, set_activity] = useState(AppViewActivity.AppointmentView);

    const [appointment_view_save] = useState(appointment_view_default_save);
    const [daily_record_save] = useState(daily_record_default_save);

    const [last_customer_save] = useState(last_customer_default_save);

    switch (activity) {
        case AppViewActivity.DailyRecordView:
            return (
                <DailyRecordView
                    return={() => set_activity(AppViewActivity.AppointmentView)}
                    saves={daily_record_save}
                />
            );
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
