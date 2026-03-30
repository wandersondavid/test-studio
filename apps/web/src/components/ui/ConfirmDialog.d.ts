import { type ReactNode } from 'react';
interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'default' | 'danger';
    busy?: boolean;
    children?: ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
}
export declare function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, tone, busy, children, onCancel, onConfirm, }: ConfirmDialogProps): import("react").ReactPortal | null;
export {};
//# sourceMappingURL=ConfirmDialog.d.ts.map