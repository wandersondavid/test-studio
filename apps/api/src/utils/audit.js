export function buildAuditActor(user) {
    return {
        userId: user.id ?? user._id ?? '',
        name: user.name,
        email: user.email,
        role: user.role,
    };
}
export function stringifyMetadataValue(value) {
    if (value == null)
        return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return value;
    return JSON.stringify(value);
}
//# sourceMappingURL=audit.js.map