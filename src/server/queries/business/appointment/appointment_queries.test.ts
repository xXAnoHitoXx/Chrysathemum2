import { clear_test_data } from "~/server/db_schema/fb_schema";
import { AppointmentCreationInfo } from "~/server/db_schema/type_def";
import { pack_test } from "../../server_queries_monad";
import { create_new_customer } from "../customer/customer_queries";
import { extract_error, is_data_error } from "~/server/data_error";
import { date } from "~/server/validation/contextual_types/date";
import { create_new_appointment } from "./appointment_queries";
import { retrieve_appointment_entry } from "../../crud/appointment/appointment_entry";
import { retrieve_customer_appointments } from "../../crud/appointment/customer_appointments";

const test_suit = "appointment_queries_tests";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("appointment creation", async () => {
    const test_name = test_suit.concat("/appointment_creation/")
    const customer = await pack_test({
        name: "Banana",
        phone_number: "eggplant",
    }, test_name).bind(create_new_customer).unpack();

    if(is_data_error(customer)) {
        customer.log();
        fail();
    }

    const app_date = date({ d:21, m:11, y:23 });

    if(is_data_error(app_date)) {
        app_date.log();
        fail();
    }

    const appointment_info: AppointmentCreationInfo = {
        customer: customer,
        date: app_date,
        time: 22,
        details: "",
        duration: 4,
    }

    const appointment = await pack_test(appointment_info, test_name)
        .bind(create_new_appointment).unpack();

    if(is_data_error(appointment)){
        appointment.log();
        fail();
    }

    expect(appointment.customer.name).toBe(customer.name);
    expect(appointment.customer.phone_number).toBe(customer.phone_number);
    expect(appointment.customer.id).toBe(customer.id);
    expect(appointment.customer.notes).toBe(customer.notes);

    expect(appointment.date).toBe(appointment_info.date);
    expect(appointment.duration).toBe(appointment_info.duration);
    expect(appointment.time).toBe(appointment_info.time);
    expect(appointment.details).toBe(appointment_info.details);

    const entry = await pack_test({ date: appointment.date.toString(), id: appointment.id }, test_name) 
        .bind(retrieve_appointment_entry).unpack();

    if(is_data_error(entry)){
        entry.log();
        fail();
    }

    expect(entry.id).toBe(appointment.id);
    expect(entry.customer_id).toBe(appointment.customer.id);
    expect(entry.date).toBe(appointment.date);
    expect(entry.time).toBe(appointment.time);
    expect(entry.duration).toBe(appointment.duration);
    expect(entry.details).toBe(appointment.details);
    expect(entry.technician_id).toBe(null);

    const index = await pack_test({ customer_id: customer.id }, test_name)
        .bind(retrieve_customer_appointments)
        .bind(extract_error((error) => {
            error.log();
            fail();
        }))
        .unpack();

    if(is_data_error(index)){
        index.log();
        fail();
    }

    expect(index.length).toBe(1);
    expect(index[0]?.id).toBe(appointment.id);
    expect(index[0]?.date).toBe(appointment.date.toString());
});
