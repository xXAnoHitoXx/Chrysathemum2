import { AppointmentQuery } from "../appointment/appointment_queries";
import { AppointmentCreationInfo } from "../appointment/type_def";
import { CustomerQuery } from "../customer/customer_queries";
import { is_data_error } from "../data_error";
import { FireDB } from "../fire_db";
import { TechnicianQuery } from "../technician/technician_queries";
import { TechnicianCreationInfo } from "../technician/type_def";
import { wipe_test_data } from "../test_util";
import { retrieve_transaction_entry } from "./component/transaction_entry";
import { TransactionQuery } from "./transaction_queries";
import { Account, Closing } from "./type_def";

const test_suit = "transaction_queries_tests";

afterAll(async () => {
    const clean_up = await wipe_test_data.call(
        test_suit,
        FireDB.test(test_suit),
    );

    if (is_data_error(clean_up)) {
        clean_up.log();
    }
});

test("transaction creation", async () => {
    const test_name = test_suit + "/transaction creation/";
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

    const tech_less_trans = await TransactionQuery.close_transaction.call(
        { appointment: appointment, account: account, closing: close },
        test_db,
    );

    expect(is_data_error(tech_less_trans)).toBe(true);

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

    appointment.technician = tech;

    const trans = await TransactionQuery.close_transaction.call(
        { appointment: appointment, account: account, closing: close },
        test_db,
    );

    if (is_data_error(trans)) {
        trans.log();
        fail();
    }

    const entry = await retrieve_transaction_entry.call(
        {
            date: appointment.date,
            salon: appointment.salon,
            entry_id: appointment.id,
        },
        test_db,
    );

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
