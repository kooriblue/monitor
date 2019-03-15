import { getOrderInfo } from '@/services/order';

export default {
    namespace: 'payorder',

    state: {
        orderData: [],
        pagination: {},
        totalMoney: 0,
    },

    effects: {
        *query({ payload }, { call, put }) {
            const response = yield call(getOrderInfo, payload);
            yield put({
                type: 'saveOrderInfo',
                payload: response,
            });
        },
    },

    reducers: {
        saveOrderInfo(state, { payload }) {
            const pagination =  { ...state.pagination};
            pagination.total = payload.total;
            return {
                ...state,
                orderData: payload.orderData,
                pagination: pagination,
                totalMoney: (payload.totalMoney * 1.0 / 100).toFixed(2),
            }
        },
        changeState(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
    }
}