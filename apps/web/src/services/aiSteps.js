import { api } from './api';
export async function generateSteps(description, baseURL) {
    const response = await api.post('/ai/generate-steps', { description, baseURL });
    return response.data.steps;
}
//# sourceMappingURL=aiSteps.js.map