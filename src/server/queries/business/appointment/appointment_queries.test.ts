import { clear_test_data } from "~/server/db_schema/fb_schema";
import {
    AppointmentCreationInfo,
    AppointmentUpdateInfo,
} from "~/server/db_schema/type_def";
import { pack_test } from "../../server_queries_monad";
import { create_new_customer } from "../customer/customer_queries";
import { is_data_error } from "~/server/data_error";
import {
    create_new_appointment,
    delete_appointment,
    retrieve_appointments_on_date,
    update_appointment,
} from "./appointment_queries";
import { retrieve_appointment_entry } from "../../crud/appointment/appointment_entry";
import { retrieve_customer_appointments } from "../../crud/appointment/customer_appointments";
import { TechnicianCreationInfo } from "~/app/api/technician/create/validation";
import { create_new_technician } from "../technician/technician_queries";
import { current_date } from "~/server/validation/semantic/date";

const test_suit = "appointment_queries_tests";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("appointment creation", async () => {
    const test_name = test_suit.concat("/appointment_creation/");
    const customer = await pack_test(
        {
            name: "Banana",
            phone_number: "eggplant",
        },
        test_name,
    )
        .bind(create_new_customer)
        .unpack();

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

    const appointment = await pack_test(appointment_info, test_name)
        .bind(create_new_appointment)
        .unpack();

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

    const entry = await pack_test(
        {
            date: appointment.date.toString(),
            salon: appointment.salon,
            id: appointment.id,
        },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(entry)) {
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
        .bind((res) => {
            if (res.error != null) {
                res.error?.log();
                fail();
            }
            return res.data;
        })
        .unpack();

    if (is_data_error(index)) {
        index.log();
        fail();
    }

    expect(index.length).toBe(1);
    expect(index[0]?.id).toBe(appointment.id);
    expect(index[0]?.date).toBe(appointment.date.toString());
});

test("appointment update", async () => {
    const test_name = test_suit.concat("/appointment_update/");

    const customer = await pack_test(
        {
            name: "Banana",
            phone_number: "eggplant",
        },
        test_name,
    )
        .bind(create_new_customer)
        .unpack();

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

    const appointment = await pack_test(appointment_info, test_name)
        .bind(create_new_appointment)
        .unpack();

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

    const update: AppointmentUpdateInfo = {
        technician_id:
            appointment.technician == null ? null : appointment.technician.id,
        time: 11,
        details: "lol",
        duration: 3,
    };

    const updated = await pack_test({ ...appointment, ...update }, test_name)
        .bind(update_appointment)
        .unpack();

    if (is_data_error(updated)) {
        updated.log();
        fail();
    }

    const entry = await pack_test(
        {
            date: appointment.date.toString(),
            salon: appointment.salon,
            id: appointment.id,
        },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }

    expect(entry.id).toBe(appointment.id);
    expect(entry.customer_id).toBe(appointment.customer.id);
    expect(entry.date).toBe(appointment.date);
    expect(entry.time).toBe(update.time);
    expect(entry.duration).toBe(update.duration);
    expect(entry.details).toBe(update.details);
    expect(entry.technician_id).toBe(null);
});

test("tech assignment", async () => {
    const test_name = test_suit.concat("/tech_assignment/");

    const customer = await pack_test(
        {
            name: "Banana",
            phone_number: "eggplant",
        },
        test_name,
    )
        .bind(create_new_customer)
        .unpack();

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

    const appointment = await pack_test(appointment_info, test_name)
        .bind(create_new_appointment)
        .unpack();

    if (is_data_error(appointment)) {
        appointment.log();
        fail();
    }

    const techless_entry = await pack_test(
        {
            date: appointment.date.toString(),
            salon: appointment.salon,
            id: appointment.id,
        },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(techless_entry)) {
        techless_entry.log();
        fail();
    }

    expect(techless_entry.technician_id).toBeNull();

    const tech_info: TechnicianCreationInfo = {
        name: "UwU",
        color: "FaQ",
        active_salon: "5CBL",
    };

    const tech = await pack_test(tech_info, test_name)
        .bind(create_new_technician)
        .unpack();

    if (is_data_error(tech)) {
        tech.log();
        fail();
    }

    const update: AppointmentUpdateInfo = {
        technician_id: tech.id,
        time: appointment.time,
        duration: appointment.duration,
        details: appointment.details,
    };

    const assignment = await pack_test({ ...appointment, ...update }, test_name)
        .bind(update_appointment)
        .unpack();

    if (is_data_error(assignment)) {
        assignment.log();
        fail();
    }

    const entry = await pack_test(
        {
            date: appointment.date.toString(),
            salon: appointment.salon,
            id: appointment.id,
        },
        test_name,
    )
        .bind(retrieve_appointment_entry)
        .unpack();

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }

    expect(entry.technician_id).toBe(tech.id);
});

test("load appointments of date", async () => {
    const test_name = test_suit.concat("/load_appointments_on_date/");

    const customer = await pack_test(
        { name: "banana", phone_number: "ananananana" },
        test_name,
    )
        .bind(create_new_customer)
        .unpack();

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

    const a1 = await pack_test(a1i, test_name)
        .bind(create_new_appointment)
        .unpack();
    const a2 = await pack_test(a2i, test_name)
        .bind(create_new_appointment)
        .unpack();
    const a3 = await pack_test(a3i, test_name)
        .bind(create_new_appointment)
        .unpack();

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

    let list = await pack_test(
        { date: a1.date.toString(), salon: a1.salon },
        test_name,
    )
        .bind(retrieve_appointments_on_date)
        .unpack();

    if (is_data_error(list)) {
        list.log();
        fail();
    }

    if (list.error != null) {
        list.error.log();
        fail();
    }

    expect(list.data.length).toBe(2);

    expect(list.data[0]?.id).toBe(a1.id);
    expect(list.data[0]?.date).toBe(a1.date);
    expect(list.data[0]?.time).toBe(a1.time);
    expect(list.data[0]?.details).toBe(a1.details);
    expect(list.data[0]?.technician).toBeNull();
    expect(list.data[0]?.customer.id).toBe(a1.customer.id);
    expect(list.data[0]?.customer.name).toBe(a1.customer.name);
    expect(list.data[0]?.customer.phone_number).toBe(a1.customer.phone_number);
    expect(list.data[0]?.customer.notes).toBe(a1.customer.notes);

    expect(list.data[1]?.id).toBe(a3.id);
    expect(list.data[1]?.date).toBe(a3.date);
    expect(list.data[1]?.time).toBe(a3.time);
    expect(list.data[1]?.details).toBe(a3.details);
    expect(list.data[1]?.technician).toBeNull();
    expect(list.data[1]?.customer.id).toBe(a3.customer.id);
    expect(list.data[1]?.customer.name).toBe(a3.customer.name);
    expect(list.data[1]?.customer.phone_number).toBe(a3.customer.phone_number);
    expect(list.data[1]?.customer.notes).toBe(a3.customer.notes);

    const del = await pack_test(a3, test_name)
        .bind(delete_appointment)
        .unpack();

    if (is_data_error(del)) {
        del.log();
        fail();
    }

    list = await pack_test(
        { date: a1.date.toString(), salon: a1.salon },
        test_name,
    )
        .bind(retrieve_appointments_on_date)
        .unpack();

    if (is_data_error(list)) {
        list.log();
        fail();
    }

    if (list.error != null) {
        list.error.log();
        fail();
    }

    expect(list.data.length).toBe(1);

    expect(list.data[0]?.id).toBe(a1.id);
    expect(list.data[0]?.date).toBe(a1.date);
    expect(list.data[0]?.time).toBe(a1.time);
    expect(list.data[0]?.details).toBe(a1.details);
    expect(list.data[0]?.technician).toBeNull();
    expect(list.data[0]?.customer.id).toBe(a1.customer.id);
    expect(list.data[0]?.customer.name).toBe(a1.customer.name);
    expect(list.data[0]?.customer.phone_number).toBe(a1.customer.phone_number);
    expect(list.data[0]?.customer.notes).toBe(a1.customer.notes);
});

test("appointment update count", async () => {
    const test_name = test_suit.concat("/appointment_update_count/");

    const customer = await pack_test(
        {
            name: "Banana",
            phone_number: "eggplant",
        },
        test_name,
    )
        .bind(create_new_customer)
        .unpack();

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
        date: current_date().toString(),
        time: 21,
        details: "",
        duration: 3,
        salon: "5CBL",
    };

    const a1 = await pack_test(a1i, test_name)
        .bind(create_new_appointment)
        .unpack();

    if (is_data_error(a1)) {
        a1.log();
        fail();
    }

    const a2 = await pack_test(a2i, test_name)
        .bind(create_new_appointment)
        .unpack();

    if (is_data_error(a2)) {
        a2.log();
        fail();
    }

    const update: AppointmentUpdateInfo = {
        technician_id: null,
        time: a1.time,
        duration: a2.duration,
        details: "bruh",
    };

    const a1_updated = await pack_test({ ...a1, ...update }, test_name)
        .bind(update_appointment)
        .unpack();

    if (is_data_error(a1_updated)) {
        a1_updated.log();
        fail();
    }

    const a2_updated = await pack_test({ ...a2, ...update }, test_name)
        .bind(update_appointment)
        .unpack();

    if (is_data_error(a2_updated)) {
        a2_updated.log();
        fail();
    }

    const a1_del = await pack_test(a1, test_name)
        .bind(delete_appointment)
        .unpack();

    if (is_data_error(a1_del)) {
        a1_del.log();
        fail();
    }

    const a2_del = await pack_test(a2, test_name)
        .bind(delete_appointment)
        .unpack();

    if (is_data_error(a2_del)) {
        a2_del.log();
        fail();
    }
});
