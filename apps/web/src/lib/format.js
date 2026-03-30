export function formatDateTimeBR(value) {
    return new Date(value).toLocaleString('pt-BR');
}
export function formatDuration(durationMs) {
    if (!durationMs) {
        return '-';
    }
    if (durationMs < 1000) {
        return `${durationMs}ms`;
    }
    return `${(durationMs / 1000).toFixed(2)}s`;
}
export function shortId(id) {
    return id.slice(-8);
}
//# sourceMappingURL=format.js.map