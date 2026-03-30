import { Badge } from '@/components/ui/badge';
export function StatusBadge({ status }) {
    const normalized = status.toLowerCase();
    const variant = normalized === 'passed'
        ? 'success'
        : normalized === 'running'
            ? 'secondary'
            : normalized === 'pending'
                ? 'warning'
                : 'danger';
    return (<Badge variant={variant} className="uppercase tracking-[0.08em]">{status}</Badge>);
}
//# sourceMappingURL=StatusBadge.js.map