"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = interpolate;
exports.interpolateStep = interpolateStep;
exports.interpolateSteps = interpolateSteps;
function interpolate(value, variables) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (key in variables)
            return variables[key];
        throw new Error(`Variável não encontrada no dataset: {{${key}}}`);
    });
}
function interpolateStep(step, variables) {
    return {
        ...step,
        selector: step.selector ? interpolate(step.selector, variables) : undefined,
        selectorAlternatives: step.selectorAlternatives?.map(selector => interpolate(selector, variables)),
        value: step.value ? interpolate(step.value, variables) : undefined,
        description: step.description ? interpolate(step.description, variables) : undefined,
        api: step.api
            ? {
                ...step.api,
                urlContains: interpolate(step.api.urlContains, variables),
                method: step.api.method ? interpolate(step.api.method, variables) : undefined,
                responseIncludes: step.api.responseIncludes ? interpolate(step.api.responseIncludes, variables) : undefined,
            }
            : undefined,
    };
}
function interpolateSteps(steps, variables) {
    return steps.map(step => interpolateStep(step, variables));
}
//# sourceMappingURL=interpolator.js.map