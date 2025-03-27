export function debugLog(level: string, command: string, message: string) {
    const now = new Date();
    console.log(`${level} | ${now.toLocaleDateString('America/Chicago')} | ${command} | ${message}`);
}