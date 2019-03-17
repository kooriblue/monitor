import request from '@/utils/request';

export async function queryDevice(params) {
    return request('/device/queryDevice', {
        method: 'POST',
        body: params,
    });
}