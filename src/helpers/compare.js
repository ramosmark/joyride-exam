export function compare(a, b) {
    if (a.name === b.name) {
        return 0;
    }
    if (a.name === null) {
        return 1;
    }
    if (b.name === null) {
        return -1;
    }
} 