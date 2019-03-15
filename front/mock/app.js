const appInfo = [
    {
        "alipayAppId": "",
        "appBundleId": "monitor.color",
        "appId": 1,
        "appName": "Color",
        "platform": "android"
    },
    {
        "alipayAppId": "",
        "appBundleId": "monitor.hider",
        "appId": 2,
        "appName": "Hider",
        "platform": "ios"
    },
    {
        "alipayAppId": "",
        "appBundleId": "monitor.guard",
        "appId": 3,
        "appName": "Guard",
        "platform": "ios"
    },
];

const getAppInfo = {
    appInfo,
};

export default {
    'GET /app/getAppInfo': getAppInfo,
};