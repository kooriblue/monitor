import { queryDevice } from '@/services/device';

export default {
    namespace: 'device',

    state: {
        deviceData: [],
    },

    effects: {
        *query({ payload }, { call, put }) {
            const response = yield call(queryDevice, payload);
            yield put({
                type: 'saveDeviceData',
                payload: response,
            });
        },
    },

    reducers: {
        saveDeviceData(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        clear() {
            return {
                deviceData: []
            }
        }
    }
}