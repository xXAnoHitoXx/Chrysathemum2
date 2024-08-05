import * as Sentry from "@sentry/nextjs";
import { is_function, is_object } from "./validation/simple_type";

export function is_data_error(t: unknown): t is DataError {
    return (
        is_object(t) &&
        "message" in t &&
        "stack" in t &&
        "log" in t &&
        "report" in t &&
        is_function(t.message) &&
        is_function(t.stack) &&
        is_function(t.log) &&
        is_function(t.report)
    );
}

export interface DataError {
    message(): string;
    stack(context: string, detail: string): DataError;
    log(): void;
    report(): void;
}

export function lotta_errors(
    context: string,
    detail: string,
    errors: DataError[],
): DataError {
    return new LottaError(context, detail, errors);
}

export function data_error(context: string, detail: string): DataError {
    return new SimpleDataError(context, detail);
}

export function log_error<T>(res: PartialResult<T>): T {
    res.error?.log();
    return res.data;
}
export function report_error<T>(res: PartialResult<T>): T {
    res.error?.report();
    return res.data;
}

export type PartialResult<T> = {
    data: T;
    error: DataError | null;
};

class LottaError implements DataError {
    private stack_detail: DataError;
    private errors: DataError[];
    private _message_cache: string | null;
    constructor(context: string, detail: string, errors: DataError[]) {
        this.errors = errors;
        this.stack_detail = new SimpleDataError(context, detail);
        this._message_cache = null;
    }

    message(): string {
        if (this._message_cache != null) return this._message_cache;

        let m = "-----------------\n";
        this.errors.forEach((error) => {
            m = m.concat(error.message(), "-----------------\n");
        });

        const lines = m.split(/\n/);
        this._message_cache = this.stack_detail.message();
        lines.forEach((line) => {
            this._message_cache = this._message_cache!.concat("| ", line, "\n");
        });

        return this._message_cache;
    }

    stack(context: string, detail: string) {
        return new SimpleDataError(
            context,
            detail.concat("\n", this.message()),
        );
    }

    log(): void {
        console.log(this.message());
    }

    report(): void {
        Sentry.captureMessage(this.message());
    }
}

class SimpleDataError {
    private _message: string;

    constructor(context: string, detail: string) {
        this._message = "> ".concat(context, ":\n    - ", detail, "\n");
    }

    message() {
        return this._message;
    }

    stack(context: string, detail: string): DataError {
        this._message = "> ".concat(
            context,
            ":\n    - ",
            detail,
            "\n",
            this._message,
        );
        return this;
    }

    log() {
        console.log(this._message);
    }

    report() {
        Sentry.captureMessage(this._message);
    }
}

export const NOT_IMPLEMENTED: DataError = new SimpleDataError(
    "Development",
    "not implemented",
);
