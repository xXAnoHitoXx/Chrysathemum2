import { clear_test_data } from "~/server/db_schema/fb_schema";
import { create_appointment_entry, delete_appointment_entry, retrieve_appointment_entry, update_appointment_entry } from "./appointment_entry";
import { is_successful_query, pack_test } from "../../server_queries_monad";
import { is_server_error } from "~/server/server_error";

const test_suit = "appointment_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
})

test("test appointment_entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_appointment_entries_cruds/");

    const app_detail = {
        customer_id: "Banana",
        technician_id: null,
        date: "20 3 2021",
        time: "100",
        duration: "30",
        details: "emotional damage",
    }

    const appointment = await pack_test(app_detail, test_name)
        .bind(create_appointment_entry).unpack();

    if(is_successful_query(appointment)){
        expect(appointment.customer_id).toBe(app_detail.customer_id);
        expect(appointment.technician_id).toBeNull();
        expect(appointment.date).toBe(app_detail.date);
        expect(appointment.time).toBe(app_detail.time);
        expect(appointment.duration).toBe(app_detail.duration);
        expect(appointment.details).toBe(app_detail.details);
    } else {
        fail();
    }

    const appointment_in_db = await pack_test({ id: appointment.id }, test_name)
        .bind(retrieve_appointment_entry).unpack();

    if (is_successful_query(appointment_in_db)) {
        expect(appointment_in_db.id).toBe(appointment.id);
        expect(appointment_in_db.technician_id).toBeNull();
        expect(appointment_in_db.customer_id).toBe(appointment.customer_id);
        expect(appointment_in_db.date).toBe(app_detail.date);
        expect(appointment_in_db.time).toBe(app_detail.time);
        expect(appointment_in_db.duration).toBe(app_detail.duration);
        expect(appointment_in_db.details).toBe(appointment.details);
    } else {
        fail();
    }

    const update_target = {
        id: appointment.id,
        customer_id: "Bruhnuhnuh",
        technician_id: "portmonaie",
        date: "22 3 2021",
        time: "150",
        duration: "320",
        details: "emotional damage++",
    }

    const update = await pack_test(update_target, test_name)
        .bind(update_appointment_entry).unpack();

    const updated_appointment = await pack_test({ id: appointment.id }, test_name)
        .bind(retrieve_appointment_entry).unpack();

    if(is_successful_query(update) && is_successful_query(updated_appointment)){
        expect(updated_appointment.customer_id).toBe(update_target.customer_id);
        expect(updated_appointment.technician_id).toBe(update_target.technician_id);
        expect(updated_appointment.date).toBe(update_target.date);
        expect(updated_appointment.time).toBe(update_target.time);
        expect(updated_appointment.duration).toBe(update_target.duration);
        expect(updated_appointment.details).toBe(update_target.details);
    } else {
        fail();
    }

    const delete_app = await pack_test({ id: appointment.id }, test_name)
        .bind(delete_appointment_entry).unpack();

    const not_exist = await pack_test({ id: appointment.id }, test_name)
        .bind(retrieve_appointment_entry).unpack();

    if (is_server_error(delete_app) || is_successful_query(not_exist)) {
        fail();
    }
})
