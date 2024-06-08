import { clear_test_data } from "~/server/db_schema/fb_schema";
import { Appointment } from "~/server/db_schema/type_def";
//import { create_appointment_entry, retrieve_appointment_entry } from "./appointment_entry";

const test_suit = "appointment_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("test appointment_entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_appointment_entries_cruds/");

    const app_detail = {
        customer_id: "Banana",
        date: "20 3 2021",
        time: "100",
        duration: "30",
        details: "emotional damage",
    }

    const appointment: Appointment = await create_appointment_entry(app_detail, test_name);

    expect(appointment.customer_id).toBe(app_detail.customer_id);
    expect(appointment.date).toBe(app_detail.date);
    expect(appointment.time).toBe(app_detail.time);
    expect(appointment.duration).toBe(app_detail.duration);
    expect(appointment.details).toBe(app_detail.details);

    const appointment_in_db: Appointment | null = await retrieve_appointment_entry(appointment.id);

    expect(appointment_in_db).not.toBeNull();
    if (appointment_in_db != null) {
        expect(appointment_in_db.id).toBe(appointment.id);
        expect(appointment_in_db.date).toBe(app_detail.date);
        expect(appointment_in_db.time).toBe(app_detail.time);
        expect(appointment_in_db.duration).toBe(app_detail.duration);
        expect(appointment_in_db.details).toBe(appointment.details);
    }
})
