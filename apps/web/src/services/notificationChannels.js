import { api } from './api';
export const notificationChannelsApi = {
    list() {
        return api.get('/notification-channels').then(r => r.data);
    },
    get(id) {
        return api.get(`/notification-channels/${id}`).then(r => r.data);
    },
    create(data) {
        return api.post('/notification-channels', data).then(r => r.data);
    },
    update(id, data) {
        return api.put(`/notification-channels/${id}`, data).then(r => r.data);
    },
    delete(id) {
        return api.delete(`/notification-channels/${id}`).then(() => undefined);
    },
    test(id) {
        return api.post(`/notification-channels/${id}/test`).then(r => r.data);
    },
};
//# sourceMappingURL=notificationChannels.js.map