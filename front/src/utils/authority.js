import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import settings from '../../settings';

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
    // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
    var loginDate = moment(localStorage.getItem('cellmonitor-loginDate'));
    var nowDate = moment();
    var timeRange = settings.timeRange;

    if ((nowDate.unix() - loginDate.unix()) > timeRange) {
        return ['guest'];
    } else {
        const authorityString = typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
        // authorityString could be admin, "admin", ["admin"]
        let authority;
        try {
            authority = JSON.parse(authorityString);
        } catch (e) {
            authority = authorityString;
        }
        if (typeof authority === 'string') {
            return [authority];
        }
        return authority || ['admin'];
    }
}

export function setAuthority(authority) {
    const proAuthority = typeof authority === 'string' ? [authority] : authority;
    return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}
