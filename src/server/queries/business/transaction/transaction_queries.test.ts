import { clear_test_data } from "~/server/db_schema/fb_schema";
import {
    Account,
    AppointmentCreationInfo,
    Closing,
} from "~/server/db_schema/type_def";
import { pack_test } from "../../server_queries_monad";
import { create_new_customer } from "../customer/customer_queries";
import { is_data_error } from "~/server/data_error";
import { create_new_appointment } from "../appointment/appointment_queries";
import { close_transaction } from "./transaction_queries";
import { retrieve_transaction_entry } from "../../crud/transaction/transaction_date_entry";
import { TechnicianCreationInfo } from "~/app/api/technician/create/validation";
import { create_new_technician } from "../technician/technician_queries";

const test_suit = "transaction_queries_tests";

afterAll(async () => {
    await clear_test_data(test_suit);
});

test("transaction creation", async () => {
    const test_name = test_suit.concat("/transaction creation/");
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
        date: "31-12-2021",
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

    const account: Account = {
        amount: 11500,
        tip: 265,
    };

    const close: Closing = {
        machine: 0,
        cash: 5000,
        gift: 500,
        discount: 2500,
    };

    const tech_less_trans = await pack_test(
        { appointment: appointment, account: account, close: close },
        test_name,
    )
        .bind(close_transaction)
        .unpack();

    expect(is_data_error(tech_less_trans)).toBe(true);

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

    appointment.technician = tech;

    const trans = await pack_test(
        { appointment: appointment, account: account, close: close },
        test_name,
    )
        .bind(close_transaction)
        .unpack();

    if (is_data_error(trans)) {
        trans.log();
        fail();
    }

    const entry = await pack_test(
        {
            date: appointment.date,
            salon: appointment.salon,
            id: appointment.id,
        },
        test_name,
    )
        .bind(retrieve_transaction_entry)
        .unpack();

    if (is_data_error(entry)) {
        entry.log();
        fail();
    }

    expect(entry.customer_id).toBe(customer.id);
    expect(entry.date).toBe(appointment.date);
    expect(entry.time).toBe(appointment.time);
    expect(entry.salon).toBe(appointment.salon);
    expect(entry.technician_id).toBe(appointment.technician.id);
});
