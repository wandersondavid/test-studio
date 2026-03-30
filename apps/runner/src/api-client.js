const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const RUNNER_SHARED_SECRET = process.env.RUNNER_SHARED_SECRET ?? 'test-studio-runner-secret';
export async function postResult(runId, result) {
    const response = await fetch(`${API_URL}/test-runs/${runId}/result`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-runner-secret': RUNNER_SHARED_SECRET,
        },
        body: JSON.stringify(result),
    });
    if (!response.ok) {
        throw new Error(`Falha ao postar resultado: ${response.status}`);
    }
}
//# sourceMappingURL=api-client.js.map