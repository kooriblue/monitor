import request from '@/utils/request';

export async function getOrderInfo(params) {
    return request('/order/getOrderInfo', {
        method: 'POST',
        body: params,
    });
}

export async function getOrderSummaryGroupByDate(params) {
    return request('/order/getOrderSummaryGroupByDate', {
        method: 'POST',
        body: params,
    });
}

export async function getOrderSummaryGroupByApp(params) {
    return request('/order/getOrderSummaryGroupByApp', {
        method: 'POST',
        body: params,
    })
}