import * as Sentry from "@sentry/nextjs";

export function is_data_error(t: unknown): t is DataError {
    return (
        typeof t === "object" &&
        t !== null &&
        "message" in t &&
        "stack" in t &&
        "log" in t &&
        "report" in t &&
        typeof t.message === "function" &&
        typeof t.stack === "function" &&
        typeof t.log === "function" &&
        typeof t.report === "function"
    );
}

export class DataError {
    private _message: string;

    constructor(message: string) {
        this._message = "> " + message + "\n";
    }

    message() {
        return ">----------<\n" + this._message + ">----------<\n";
    }

    stack(context: string): DataError {
        this._message = "> " + context + "\n" + this._message;
        return this;
    }

    log() {
        console.log(this._message);
    }

    report() {
        Sentry.captureMessage(this._message);
    }

    contains(messages: string[]) {
        for (const message in messages) {
            if (!this._message.includes(message)) return false;
        }
        return true;
    }
}

export function report_partial_errors<T>(data: (T | DataError)[]): T[] {
    const ts: T[] = [];
    for (const dat of data) {
        if (is_data_error(dat)) {
            dat.log();
            dat.report();
        } else {
            ts.push(dat);
        }
    }

    return ts;
}
