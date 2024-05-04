export default function sanitize_text_input(input: string): string {
    return input.replaceAll("/", "").replaceAll("<", "").replaceAll(">", "");
}
