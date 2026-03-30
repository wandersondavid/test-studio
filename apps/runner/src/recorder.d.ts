import type { Environment, TestStep } from '@test-studio/shared-types';
type RecorderAction = 'auto' | 'click' | 'fill' | 'select' | 'check' | 'assertVisible' | 'assertText';
type PendingRecorderAction = 'fill' | 'select';
interface RecorderViewport {
    width: number;
    height: number;
}
interface RecorderTarget {
    selector: string;
    selectorAlternatives?: string[];
    description?: string;
    text?: string;
    tagName?: string;
    inputType?: string;
    autoAction?: 'click' | 'fill' | 'select' | 'check';
}
interface RecorderPendingInput {
    selector: string;
    selectorAlternatives?: string[];
    description?: string;
    value: string;
    action: PendingRecorderAction;
    inputType?: string;
}
export interface RecorderSessionState {
    sessionId: string;
    currentUrl: string;
    title: string;
    viewport: RecorderViewport;
    steps: TestStep[];
    target?: RecorderTarget;
    pendingInput?: RecorderPendingInput;
}
export declare function createRecorderSession(input: {
    environment: Environment;
    startPath?: string;
}): Promise<RecorderSessionState>;
export declare function getRecorderSessionState(sessionId: string): Promise<RecorderSessionState>;
export declare function getRecorderScreenshot(sessionId: string): Promise<Buffer>;
export declare function navigateRecorderSession(sessionId: string, target: string): Promise<RecorderSessionState>;
export declare function interactRecorderSession(input: {
    sessionId: string;
    action: RecorderAction;
    x: number;
    y: number;
    value?: string;
}): Promise<RecorderSessionState>;
export declare function typeIntoRecorderSession(input: {
    sessionId: string;
    value: string;
    commit?: boolean;
}): Promise<RecorderSessionState>;
export declare function closeRecorderSession(sessionId: string): Promise<void>;
export declare function replayStepsInRecorderSession(input: {
    sessionId: string;
    steps: TestStep[];
}): Promise<RecorderSessionState>;
export {};
//# sourceMappingURL=recorder.d.ts.map