export class AnoError {
    private message: string;
    constructor(error: string) {
        this.message = error;
    }

    error(): string {
        return this.message;
    }
}
