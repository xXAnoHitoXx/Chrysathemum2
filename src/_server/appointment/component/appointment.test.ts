import { is_data_error } from "~/_server/data_error";
import { FireDB } from "~/_server/fire_db";
import { wipe_test_data } from "~/_server/test_util";
import {
    create_appointment_entry,
    delete_appointment_entry,
    retrieve_appointment_entries_on_date,
    retrieve_appointment_entry,
    update_appointment_entry,
} from "./appointment_entry";
import {
    AppointmentEntryCreationInfo,
    AppointmentEntryUpdateInfo,
    CustomerAppointmentIndex,
} from "../type_def";
import {
    create_customers_appointments_entry,
    delete_customers_appointment_entry,
    retrieve_customer_appointments_index,
} from "./customer_appointments";

const test_suit = "aappointment_cruds";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("test appointment_entries CRUDs querries", async () => {
    const test_name = test_suit + "/test_appointment_entries_cruds/";
    const test_db = FireDB.test(test_name);

    const app_detail: AppointmentEntryCreationInfo = {
        customer_id: "minion",
        date: "12 2 2012",
        time: 5,
        duration: 10,
        details: "emotional damage",
        salon: "5CBL",
    };

    const appointment = await create_appointment_entry.call(
        app_detail,
        test_db,
    );

    if (is_data_error(appointment)) {
        appointment.log();
        fail();
    }

    expect(appointment.customer_id).toBe(app_detail.customer_id);
    expect(appointment.technician_id).toBeUndefined();
    expect(appointment.date).toBe(app_detail.date);
    expect(appointment.time).toBe(app_detail.time);
    expect(appointment.duration).toBe(app_detail.duration);
    expect(appointment.details).toBe(app_detail.details);

    const id = {
        entry_id: appointment.id,
        salon: appointment.salon,
        date: appointment.date,
    };

    const appointment_in_db = await retrieve_appointment_entry.call(
        id,
        test_db,
    );

    if (is_data_error(appointment_in_db)) {
        appointment_in_db.log();
        fail();
    }

    expect(appointment_in_db.id).toBe(appointment.id);
    expect(appointment_in_db.technician_id).toBeUndefined();
    expect(appointment_in_db.customer_id).toBe(appointment.customer_id);
    expect(appointment_in_db.date).toBe(app_detail.date);
    expect(appointment_in_db.time).toBe(app_detail.time);
    expect(appointment_in_db.duration).toBe(app_detail.duration);
    expect(appointment_in_db.details).toBe(appointment.details);

    let update_target: AppointmentEntryUpdateInfo = {
        id: id,
        technician_id: "portmonaie",
        time: 15,
        duration: 5,
        details: appointment.details,
    };

    let update = await update_appointment_entry.call(update_target, test_db);

    if (is_data_error(update)) {
        update.log();
        fail();
    }

    let updated_appointment = await retrieve_appointment_entry.call(
        id,
        test_db,
    );

    if (is_data_error(update)) {
        update.log();
        fail();
    }

    if (is_data_error(updated_appointment)) {
        updated_appointment.log();
        fail();
    }

    expect(updated_appointment.technician_id).toBe(update_target.technician_id);
    expect(updated_appointment.time).toBe(update_target.time);
    expect(updated_appointment.duration).toBe(update_target.duration);
    expect(updated_appointment.details).toBe(update_target.details);

    // unassign technician
    update_target = {
        id: id,
        technician_id: undefined,
        time: 15,
        duration: 5,
        details: appointment.details,
    };

    update = await update_appointment_entry.call(update_target, test_db);

    if (is_data_error(update)) {
        update.log();
        fail();
    }

    updated_appointment = await retrieve_appointment_entry.call(id, test_db);

    if (is_data_error(update)) {
        update.log();
        fail();
    }

    if (is_data_error(updated_appointment)) {
        updated_appointment.log();
        fail();
    }

    expect(updated_appointment.technician_id).toBeUndefined();
    expect(updated_appointment.time).toBe(update_target.time);
    expect(updated_appointment.duration).toBe(update_target.duration);
    expect(updated_appointment.details).toBe(update_target.details);

    const appointment_2_detail: AppointmentEntryCreationInfo = {
        customer_id: "banana",
        date: app_detail.date,
        salon: app_detail.salon,
        time: 19,
        duration: 4,
        details: "doki doki",
    };

    const app_2 = await create_appointment_entry.call(
        appointment_2_detail,
        test_db,
    );

    if (is_data_error(app_2)) {
        app_2.log();
        fail();
    }

    let appointments = await retrieve_appointment_entries_on_date.call(
        { salon: app_2.salon, date: app_2.date },
        test_db,
    );

    if (is_data_error(appointments)) {
        appointments.log();
        fail();
    }

    expect(appointments).toHaveLength(2);
    expect(appointments).toContainEqual(app_2);
    expect(appointments).toContainEqual(updated_appointment);

    const delete_app = await delete_appointment_entry.call(id, test_db);

    if (is_data_error(delete_app)) {
        delete_app.log();
        fail();
    }

    const not_exist = await retrieve_appointment_entry.call(id, test_db);

    expect(is_data_error(not_exist)).toBe(true);

    appointments = await retrieve_appointment_entries_on_date.call(
        { salon: app_2.salon, date: app_2.date },
        test_db,
    );

    if (is_data_error(appointments)) {
        appointments.log();
        fail();
    }

    expect(appointments).toHaveLength(1);
    expect(appointments).toContainEqual(app_2);
    expect(appointments).not.toContainEqual(updated_appointment);
});

test("test customer appointment list entries CRUDs querries", async () => {
    const test_name = test_suit + "/test_customer_appointment_list/";
    const test_db = FireDB.test(test_name);

    const index_1: CustomerAppointmentIndex = {
        customer_id: "bruh",
        appointment_id: "q;wyfupl",
        date: "20 2 2085",
        salon: "5CBL",
    };

    const index_2: CustomerAppointmentIndex = {
        customer_id: "bruh",
        appointment_id: "aorsoetna",
        date: "20 2 2085",
        salon: "5CBL",
    };

    const create_index_1 = await create_customers_appointments_entry.call(
        index_1,
        test_db,
    );

    if (is_data_error(create_index_1)) {
        create_index_1.log();
        fail();
    }

    const create_index_2 = await create_customers_appointments_entry.call(
        index_2,
        test_db,
    );

    if (is_data_error(create_index_2)) {
        create_index_2.log();
        fail();
    }

    let customer_history = await retrieve_customer_appointments_index.call(
        { customer_id: index_1.customer_id },
        test_db,
    );

    if (is_data_error(customer_history)) {
        customer_history.log();
        fail();
    }

    expect(customer_history).toHaveLength(2);
    expect(customer_history).toContainEqual(index_1);
    expect(customer_history).toContainEqual(index_2);

    const del = await delete_customers_appointment_entry.call(index_1, test_db);

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    customer_history = await retrieve_customer_appointments_index.call(
        { customer_id: index_1.customer_id },
        test_db,
    );

    if (is_data_error(customer_history)) {
        customer_history.log();
        fail();
    }

    expect(customer_history).toHaveLength(1);
    expect(customer_history).not.toContainEqual(index_1);
    expect(customer_history).toContainEqual(index_2);
});
