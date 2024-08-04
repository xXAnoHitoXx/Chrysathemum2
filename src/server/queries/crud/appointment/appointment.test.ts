import { clear_test_data } from "~/server/db_schema/fb_schema";
import {
    create_appointment_entry,
    delete_appointment_entry,
    retrieve_appointment_entry,
    update_appointment_entry,
} from "./appointment_entry";
import { pack_test } from "../../server_queries_monad";
import { is_data_error } from "~/server/data_error";
import {
    create_customers_appointments_entry,
    delete_customers_appointment_entry,
    retrieve_customer_appointments,
} from "./customer_appointments";
import {
    appointment_update_count_increment,
    retrieve_appointment_update_count_of_date,
} from "./update_count";

const test_suit = "appointment_cruds";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("test appointment_entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_appointment_entries_cruds/");

    const app_detail = {
        customer_id: "Banana",
        technician_id: null,
        date: "12 2 2012",
        time: 5,
        duration: 10,
        details: "emotional damage",
        salon: "5CBL",
    };

    const appointment = await pack_test(app_detail, test_name)
        .bind(create_appointment_entry)
        .unpack();

    if (is_data_error(appointment)) {
        appointment.log();
        fail();
    }

    expect(appointment.customer_id).toBe(app_detail.customer_id);
    expect(appointment.technician_id).toBeNull();
    expect(appointment.date).toBe(app_detail.date);
    expect(appointment.time).toBe(app_detail.time);
    expect(appointment.duration).toBe(app_detail.duration);
    expect(appointment.details).toBe(app_detail.details);

    const appointment_in_db = await pack_test(
        { id: appointment.id, date: appointment.date.toString() },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(appointment_in_db)) {
        appointment_in_db.log();
        fail();
    }

    expect(appointment_in_db.id).toBe(appointment.id);
    expect(appointment_in_db.technician_id).toBeNull();
    expect(appointment_in_db.customer_id).toBe(appointment.customer_id);
    expect(appointment_in_db.date).toBe(app_detail.date);
    expect(appointment_in_db.time).toBe(app_detail.time);
    expect(appointment_in_db.duration).toBe(app_detail.duration);
    expect(appointment_in_db.details).toBe(appointment.details);

    const update_target: Record<string, unknown> = {};
    update_target["customer_id"] = "Bruhnuhnuh";
    update_target["technician_id"] = "portmonaie";
    update_target["time"] = 15;
    update_target["duration"] = 5;
    update_target["details"] = "emotional damage ++";

    const update = await pack_test(
        {
            date: appointment_in_db.date,
            id: appointment_in_db.id,
            record: update_target,
        },
        test_name,
    )
        .bind(update_appointment_entry)
        .unpack();

    const updated_appointment = await pack_test(
        { id: appointment.id, date: appointment.date.toString() },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(update)) {
        update.log();
        fail();
    }

    if (is_data_error(updated_appointment)) {
        updated_appointment.log();
        fail();
    }

    expect(updated_appointment.customer_id).toBe(update_target.customer_id);
    expect(updated_appointment.technician_id).toBe(update_target.technician_id);
    expect(updated_appointment.time).toBe(update_target.time);
    expect(updated_appointment.duration).toBe(update_target.duration);
    expect(updated_appointment.details).toBe(update_target.details);

    const delete_app = await pack_test(
        { date: appointment.date.toString(), id: appointment.id },
        test_name,
    )
        .bind(delete_appointment_entry)
        .unpack();

    const not_exist = await pack_test(
        { id: appointment.id, date: appointment.date.toString() },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(delete_app)) {
        delete_app.log();
        fail();
    }

    expect(is_data_error(not_exist)).toBe(true);
});

test("test customer appointment list entries CRUDs querries", async () => {
    const test_name = test_suit.concat("/test_customer_appointment_list/");

    const history = {
        customer_id: "bruh",
        id: "q;wyfupl",
        date: "20 2 2085",
        salon: "5CBL",
    };

    const create = await pack_test(history, test_name)
        .bind(create_customers_appointments_entry)
        .unpack();

    if (is_data_error(create)) {
        create.log();
        fail();
    }

    let customer_history = await pack_test(
        { customer_id: history.customer_id },
        test_name,
    )
        .bind(retrieve_customer_appointments)
        .unpack();

    if (is_data_error(customer_history)) {
        customer_history.log();
        fail();
    }

    if (is_data_error(customer_history.error)) {
        customer_history.error.log();
        fail();
    }

    expect(customer_history.data.length).toBe(1);
    expect(customer_history.data[0]).not.toBeUndefined();
    expect(customer_history.data[0]?.id).toBe(history.id);
    expect(customer_history.data[0]?.date).toBe(history.date);

    const del = await pack_test(
        { customer_id: history.customer_id, id: history.id },
        test_name,
    )
        .bind(delete_customers_appointment_entry)
        .unpack();

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    customer_history = await pack_test(
        { customer_id: history.customer_id },
        test_name,
    )
        .bind(retrieve_customer_appointments)
        .unpack();

    if (is_data_error(customer_history)) {
        customer_history.log();
        fail();
    }

    if (is_data_error(customer_history.error)) {
        customer_history.error.log();
        fail();
    }

    expect(customer_history.data.length).toBe(0);
});

test("test update count", async () => {
    const test_name = test_suit.concat("/test_appointment_update_count/");

    const date = "12-123-1234";

    let u = await pack_test(date, test_name)
        .bind(retrieve_appointment_update_count_of_date)
        .unpack();

    if (is_data_error(u)) {
        u.log();
        fail();
    }

    expect(u).toBe(0);

    let incr = await pack_test(date, test_name)
        .bind(appointment_update_count_increment)
        .unpack();

    if (is_data_error(incr)) {
        incr.log();
        fail();
    }

    u = await pack_test(date, test_name)
        .bind(retrieve_appointment_update_count_of_date)
        .unpack();

    if (is_data_error(u)) {
        u.log();
        fail();
    }

    expect(u).toBe(1);

    incr = await pack_test(date, test_name)
        .bind(appointment_update_count_increment)
        .unpack();

    if (is_data_error(incr)) {
        incr.log();
        fail();
    }

    u = await pack_test(date, test_name)
        .bind(retrieve_appointment_update_count_of_date)
        .unpack();

    if (is_data_error(u)) {
        u.log();
        fail();
    }

    expect(u).toBe(2);
});
