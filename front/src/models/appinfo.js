import { getAppInfo } from '@/services/app';

export default {
    namespace: 'appinfo',

    state: {
        appInfo: [],
    },

    effects: {
        *appinfo(_, { call, put }) {
            const response = yield call(getAppInfo);
            yield put({
                type: 'saveAppInfo',
                payload: response,
            });
        }
    },

    reducers: {
        saveAppInfo(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        }
    }
}