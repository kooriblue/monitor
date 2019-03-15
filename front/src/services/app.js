import request from '@/utils/request';

export async function getAppInfo() {
    return request('/app/getAppInfo');
}