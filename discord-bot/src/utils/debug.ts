const chicagoTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use 24-hour time instead of AM/PM
});

export function debugLog(level: string, command: string, message: string) {
    const now = new Date();
    console.log(`${level} | ${chicagoTime.format(now)} | ${command} | ${message}`);
}