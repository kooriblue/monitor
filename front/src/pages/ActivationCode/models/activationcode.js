import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { submitActivationCodeData } from '@/services/api';  //发送请求

export default {
    namespace: 'activationcode',
    state: {
        serviceYears: 0,
        serviceMonths: 0,
        serviceDays: 0,
        serviceHours: 0,
        remark: '',
        codeSn: '1',
    },

    effects: {
        *submitActivationCodeForm({ payload }, { call }) {
            //yield call(fetch, payload);
            yield put({
                type: 'saveData',
                payload,
            });
            yield put(routerRedux.push('/activationcode/result'));
            
        },
    },

    reducers: {
        saveData(state, { payload }) {
          return {
            codeSn: payload.codeSn,
          };
        },
    },
}