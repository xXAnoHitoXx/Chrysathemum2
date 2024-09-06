export const MAX_APPOINTMENT_TIME = 52;
export const DURATION_30_MINUTES = 2;
export const MAX_APPOINTMENT_DURATION = 36;

export const BOARD_STARTING_HOUR = 8;
export const TIME_INTERVALS_PER_HOUR = 4;
const MINUTES_PER_TIME_INTERVAL = 15;

export function to_0_index(one_index: number) {
    return one_index - 1;
}

export function to_1_index(zero_index: number) {
    return zero_index + 1;
}

export function modulus(a: number, b: number) {
    return (a + b) % b;
}

export function hour_to_time(h: number): number {
    return to_1_index((h - BOARD_STARTING_HOUR) * TIME_INTERVALS_PER_HOUR);
}

export function time_to_string(t: number): string {
    const minute =
        (to_0_index(t) % TIME_INTERVALS_PER_HOUR) * MINUTES_PER_TIME_INTERVAL;
    let hour =
        Math.floor(to_0_index(t) / TIME_INTERVALS_PER_HOUR) +
        BOARD_STARTING_HOUR;

    if (hour < 12) {
        return hour + ":" + minute + " " + "am";
    }

    if (hour === 12) {
        return hour + ":" + minute + " " + "pm";
    }

    hour = hour - 12;
    return hour + ":" + minute + " " + "pm";
}
