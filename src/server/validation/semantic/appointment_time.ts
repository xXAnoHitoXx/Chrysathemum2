export const MAX_APPOINTMENT_TIME = 52;
export const DURATION_30_MINUTES = 2;
export const MAX_APPOINTMENT_DURATION = 36;

export const BOARD_STARTING_HOUR = 8;
export const TIME_INTERVALS_PER_HOUR = 4;

export function to_0_index(one_index: number) {
    return one_index - 1;
}

export function to_1_index(zero_index: number) {
    return zero_index + 1;
}

export function modulus(a: number, b: number) {
    return (a + b) % b;
}
