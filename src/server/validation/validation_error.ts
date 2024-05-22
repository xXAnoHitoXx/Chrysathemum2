import * as Sentry from "@sentry/nextjs"
export class TypeConversionError {
    message = "";

    constructor(error: string){
        this.message = error;
        Sentry.captureMessage(this.message);
    }
}

