import { api } from './api';
export const schedulesApi = {
    list() {
        return api.get('/schedules').then(r => r.data);
    },
    get(id) {
        return api.get(`/schedules/${id}`).then(r => r.data);
    },
    create(data) {
        return api.post('/schedules', data).then(r => r.data);
    },
    update(id, data) {
        return api.put(`/schedules/${id}`, data).then(r => r.data);
    },
    delete(id) {
        return api.delete(`/schedules/${id}`).then(() => undefined);
    },
    trigger(id) {
        return api.post(`/schedules/${id}/trigger`).then(r => r.data);
    },
};
//# sourceMappingURL=schedules.js.map