import request from '@/utils/request';

export async function getOrderInfo(params) {
    return request('/order/getOrderInfo', {
        method: 'POST',
        body: params,
    });
}