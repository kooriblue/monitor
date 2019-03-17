import { 
    getOrderInfo, 
    getOrderSummaryGroupByDate,
    getOrderSummaryGroupByApp
} from '@/services/order';

export default {
    namespace: 'payorder',

    state: {
        orderData: [],
        totalMoney: 0,

        // line chart tab data
        dateBaseData: [],
        count: 0,
        totalAmount: (0).toFixed(2),

        // pie chart tab data
        appBaseData: [],
    },

    effects: {
        *query({ payload }, { call, put }) {
            const response = yield call(getOrderInfo, payload);
            yield put({
                type: 'saveOrderInfo',
                payload: response,
            });
        },
        *summaryGroupByDate({ payload }, { call, put }) {
            const response = yield call(getOrderSummaryGroupByDate, payload);
            yield put({
                type: 'saveDateBaseData',
                payload: response,
            })
        },
        *summaryGroupByApp({ payload }, { call, put }) {
            const response = yield call(getOrderSummaryGroupByApp, payload);
            yield put({
                type: 'saveAppBaseData',
                payload: response,
            })
        }
    },

    reducers: {
        saveOrderInfo(state, { payload }) {
            return {
                ...state,
                orderData: payload.orderData,
                totalMoney: (payload.totalMoney * 1.0 / 100).toFixed(2),
            }
        },
        changeState(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        saveDateBaseData(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        saveAppBaseData(state, { payload }) {
            return {
                ...state,
                ...payload,
            }
        },
        clear() {
            return {
                orderData: [],
                totalMoney: 0,

                // line chart tab data
                dateBaseData: [],
                count: 0,
                totalAmount: (0).toFixed(2),
        
                // pie chart tab data
                appBaseData: [],
            }
        }
    }
}