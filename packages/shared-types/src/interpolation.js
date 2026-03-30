"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateTemplate = interpolateTemplate;
exports.interpolateOptionalTemplate = interpolateOptionalTemplate;
exports.collectTemplateVariables = collectTemplateVariables;
exports.buildParameterValueMap = buildParameterValueMap;
exports.interpolateStepWithVariables = interpolateStepWithVariables;
exports.interpolateStepsWithVariables = interpolateStepsWithVariables;
const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;
function interpolateTemplate(value, variables) {
    return value.replace(PLACEHOLDER_PATTERN, (_, key) => {
        if (key in variables) {
            return variables[key];
        }
        throw new Error(`Variável não encontrada: {{${key}}}`);
    });
}
function interpolateOptionalTemplate(value, variables) {
    return value ? interpolateTemplate(value, variables) : undefined;
}
function collectTemplateVariables(steps) {
    const found = new Set();
    const textParts = [];
    for (const step of steps) {
        textParts.push(step.selector ?? '');
        textParts.push(...(step.selectorAlternatives ?? []));
        textParts.push(step.value ?? '');
        textParts.push(step.description ?? '');
        textParts.push(step.api?.urlContains ?? '');
        textParts.push(step.api?.method ?? '');
        textParts.push(step.api?.responseIncludes ?? '');
    }
    for (const part of textParts) {
        for (const match of part.matchAll(PLACEHOLDER_PATTERN)) {
            if (match[1]) {
                found.add(match[1]);
            }
        }
    }
    return [...found];
}
function buildParameterValueMap(parameters, values) {
    const resolved = {};
    for (const parameter of parameters) {
        const provided = values[parameter.key];
        const nextValue = provided ?? parameter.defaultValue;
        if (typeof nextValue === 'string') {
            resolved[parameter.key] = nextValue;
        }
    }
    return resolved;
}
function interpolateStepWithVariables(step, variables) {
    return {
        ...step,
        selector: interpolateOptionalTemplate(step.selector, variables),
        selectorAlternatives: step.selectorAlternatives?.map(selector => interpolateTemplate(selector, variables)),
        value: interpolateOptionalTemplate(step.value, variables),
        description: interpolateOptionalTemplate(step.description, variables),
        api: step.api
            ? {
                urlContains: interpolateTemplate(step.api.urlContains, variables),
                method: interpolateOptionalTemplate(step.api.method, variables),
                status: step.api.status,
                responseIncludes: interpolateOptionalTemplate(step.api.responseIncludes, variables),
            }
            : undefined,
    };
}
function interpolateStepsWithVariables(steps, variables) {
    return steps.map(step => interpolateStepWithVariables(step, variables));
}
//# sourceMappingURL=interpolation.js.map