import type { TestStep } from '@test-studio/shared-types';
interface AiStepsModalProps {
    open: boolean;
    onClose: () => void;
    onStepsGenerated: (steps: TestStep[]) => void;
}
export declare function AiStepsModal({ open, onClose, onStepsGenerated }: AiStepsModalProps): import("react").ReactPortal | null;
export {};
//# sourceMappingURL=AiStepsModal.d.ts.map