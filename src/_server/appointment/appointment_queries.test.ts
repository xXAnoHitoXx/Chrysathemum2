import { CustomerQuery } from "../customer/customer_queries";
import { is_data_error } from "../data_error";
import { FireDB } from "../fire_db";
import { TechnicianQuery } from "../technician/technician_queries";
import { TechnicianCreationInfo } from "../technician/type_def";
import { wipe_test_data } from "../test_util";
import { AppointmentQuery } from "./appointment_queries";
import { Appointment, AppointmentCreationInfo } from "./type_def";

const test_suit = "appointment_queries_tests";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("appointment creation", async () => {
    const test_name = test_suit + "/appointment_creation/";
    const test_db = FireDB.test(test_name);

    const customer = await CustomerQuery.create_new_customer.call(
        {
            name: "Banana",
            phone_number: "eggplant",
        },
        test_db,
    );

    if (is_data_error(customer)) {
        customer.log();
        fail();
    }

    const appointment_info: AppointmentCreationInfo = {
        customer: customer,
        date: "2021-12-31",
        time: 22,
        details: "",
        duration: 4,
        salon: "5CBL",
    };

    const appointment = await AppointmentQuery.create_new_appointment.call(
        appointment_info,
        test_db,
    );

    if (is_data_error(appointment)) {
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

    const date = await AppointmentQuery.retrieve_appointments_on_date.call(
        {
            salon: appointment_info.salon,
            date: appointment_info.date,
        },
        test_db,
    );

    if (is_data_error(date)) {
        date.log();
        fail();
    }

    expect(date).toHaveLength(1);
    expect(date).toContainEqual(appointment);

    const customer_appointments =
        await AppointmentQuery.retrieve_customers_appointments.call(
            customer,
            test_db,
        );

    if (is_data_error(customer_appointments)) {
        customer_appointments.log();
        fail();
    }

    expect(customer_appointments).toHaveLength(1);
    expect(customer_appointments).toContainEqual(appointment);
});

test("appointment update", async () => {
    const test_name = test_suit + "/appointment_update/";
    const test_db = FireDB.test(test_name);

    const customer = await CustomerQuery.create_new_customer.call(
        {
            name: "Banana",
            phone_number: "eggplant",
        },
        test_db,
    );

    if (is_data_error(customer)) {
        customer.log();
        fail();
    }

    const appointment_info: AppointmentCreationInfo = {
        customer: customer,
        date: "2021-12-31",
        time: 22,
        details: "",
        duration: 4,
        salon: "5CBL",
    };

    const appointment = await AppointmentQuery.create_new_appointment.call(
        appointment_info,
        test_db,
    );

    if (is_data_error(appointment)) {
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

    const tech_info: TechnicianCreationInfo = {
        name: "UwU",
        color: "FaQ",
        active_salon: "5CBL",
    };

    const tech = await TechnicianQuery.create_new_technician.call(
        tech_info,
        test_db,
    );

    if (is_data_error(tech)) {
        tech.log();
        fail();
    }

    const update: Appointment = {
        ...appointment,
        technician: tech,
        time: 11,
        details: "lol",
        duration: 3,
    };

    const updated = await AppointmentQuery.update_appointment.call(
        update,
        test_db,
    );

    if (is_data_error(updated)) {
        updated.log();
        fail();
    }

    const entries = await AppointmentQuery.retrieve_appointments_on_date.call(
        {
            date: appointment.date,
            salon: appointment.salon,
        },
        test_db,
    );

    if (is_data_error(entries)) {
        entries.log();
        fail();
    }

    expect(entries).toHaveLength(1);
    expect(entries).not.toContainEqual(appointment);
    expect(entries).toContainEqual(update);
});

test("load appointments of date", async () => {
    const test_name = test_suit + "/load_appointments_on_date/";
    const test_db = FireDB.test(test_name);

    const customer = await CustomerQuery.create_new_customer.call(
        { name: "banana", phone_number: "ananananana" },
        test_db,
    );

    if (is_data_error(customer)) {
        customer.log();
        fail();
    }

    const a1i: AppointmentCreationInfo = {
        customer: customer,
        date: "2021-12-31",
        time: 22,
        details: "",
        duration: 4,
        salon: "5CBL",
    };

    const a2i: AppointmentCreationInfo = {
        customer: customer,
        date: "2022-12-30",
        time: 21,
        details: "",
        duration: 3,
        salon: "5CBL",
    };

    const a3i: AppointmentCreationInfo = {
        customer: customer,
        date: "2021-12-31",
        time: 23,
        details: "",
        duration: 2,
        salon: "5CBL",
    };

    const a1 = await AppointmentQuery.create_new_appointment.call(a1i, test_db);
    const a2 = await AppointmentQuery.create_new_appointment.call(a2i, test_db);
    const a3 = await AppointmentQuery.create_new_appointment.call(a3i, test_db);

    if (is_data_error(a1)) {
        a1.log();
        fail();
    }
    if (is_data_error(a2)) {
        a2.log();
        fail();
    }
    if (is_data_error(a3)) {
        a3.log();
        fail();
    }

    let list = await AppointmentQuery.retrieve_appointments_on_date.call(
        { date: a1.date.toString(), salon: a1.salon },
        test_db,
    );

    if (is_data_error(list)) {
        list.log();
        fail();
    }

    expect(list).toHaveLength(2);
    expect(list).not.toContainEqual(a2);
    expect(list).toContainEqual(a1);
    expect(list).toContainEqual(a3);

    const del = await AppointmentQuery.delete_appointment.call(a3, test_db);

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    list = await AppointmentQuery.retrieve_appointments_on_date.call(
        { date: a1.date.toString(), salon: a1.salon },
        test_db,
    );

    if (is_data_error(list)) {
        list.log();
        fail();
    }

    expect(list).toHaveLength(1);
    expect(list).not.toContainEqual(a2);
    expect(list).not.toContainEqual(a3);
    expect(list).toContainEqual(a1);
});
