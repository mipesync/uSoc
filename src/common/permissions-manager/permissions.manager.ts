export class PermissionsManager {
    static permissValidate(input: number, pattern: number): boolean {
        const result = input & pattern;
        return result === 0 ? false : true;
    }
    static rankValidate(input: number, pattern: number): boolean {
        return input <= pattern ? false : true;
    }
}