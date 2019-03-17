const deviceInfo = [
    {
        "adId": 3801,
        "apiVersionCode": 1,
        "appBundleId": "monitor.color",
        "createTime": 1550101248000,
        "isPro": true,
        "osVersion": "10.3.3",
        "phoneModel": "iPhone 5C",
        "platform": "ios",
        "requestCount": 2,
        "userId": "klmnopqrs1234567"
    },
    {
        "adId": 3802,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550107232000,
        "isPro": false,
        "osVersion": "7.1.2",
        "phoneModel": "iPhone 4",
        "platform": "ios",
        "requestCount": 0,
        "userId": "jklmnopqr0123456"
    },
    {
        "adId": 3803,
        "apiVersionCode": 1,
        "appBundleId": "monitor.color",
        "createTime": 1550107503000,
        "isPro": false,
        "osVersion": "10.3.3",
        "phoneModel": "iPhone 5",
        "platform": "ios",
        "requestCount": 1,
        "userId": "ijklmnopq9012345"
    },
    {
        "adId": 3804,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550113575000,
        "isPro": false,
        "osVersion": "11.4",
        "phoneModel": "iPhone 6",
        "platform": "ios",
        "requestCount": 3,
        "userId": "hijklmnop8901234"
    },
    {
        "adId": 3805,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550113650000,
        "isPro": false,
        "osVersion": "11.3",
        "phoneModel": "iPhone 6S",
        "platform": "ios",
        "requestCount": 2,
        "userId": "ghijklmno7890123"
    },
    {
        "adId": 3806,
        "apiVersionCode": 1,
        "appBundleId": "monitor.guard",
        "createTime": 1550113879000,
        "isPro": true,
        "osVersion": "11.3.1",
        "phoneModel": "iPhone X",
        "platform": "ios",
        "requestCount": 0,
        "userId": "fghijklmn6789012"
    },
    {
        "adId": 3807,
        "apiVersionCode": 1,
        "appBundleId": "monitor.guard",
        "createTime": 1550120112000,
        "isPro": true,
        "osVersion": "11.3.1",
        "phoneModel": "iPhone 6",
        "platform": "ios",
        "requestCount": 4,
        "userId": "efghijklm5678901"
    },
    {
        "adId": 3808,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550120230000,
        "isPro": false,
        "osVersion": "10.3.2",
        "phoneModel": "iPhone 6S",
        "platform": "ios",
        "requestCount": 0,
        "userId": "defghijkl4567890"
    },
    {
        "adId": 3809,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550122603000,
        "isPro": false,
        "osVersion": "11.4",
        "phoneModel": "iPhone 6",
        "platform": "ios",
        "requestCount": 1,
        "userId": "cdefghijk3456789"
    },
    {
        "adId": 3810,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550127672000,
        "isPro": true,
        "osVersion": "9.3.2",
        "phoneModel": "iPhone 6 Plus",
        "platform": "ios",
        "requestCount": 5,
        "userId": "bcdefghij2345678"
    },
    {
        "adId": 3811,
        "apiVersionCode": 1,
        "appBundleId": "monitor.hider",
        "createTime": 1550132412000,
        "isPro": true,
        "osVersion": "7.1.2",
        "phoneModel": "iPhone 4",
        "platform": "ios",
        "requestCount": 0,
        "userId": "abcdefghi1234567"
    }
];

export default {
    'POST /device/queryDevice': (req, res) => {
        const { userId, appBundleId } = req.body;
        var deviceData = [];
        if (userId === '' && !(appBundleId === '')) {
            for (var i = 0; i < deviceInfo.length; i++) {
                if (deviceInfo[i].appBundleId === appBundleId) {
                    deviceData.push(deviceInfo[i]);
                }
            }
        } else if (!(userId === '') && appBundleId === '') {
            for (var i = 0; i < deviceInfo.length; i++) {
                if (deviceInfo[i].userId.includes(userId)) {
                    deviceData.push(deviceInfo[i]);
                }
            }
        } else {
            for (var i = 0; i < deviceInfo.length; i++) {
                if (deviceInfo[i].appBundleId === appBundleId && deviceInfo[i].userId.includes(userId)) {
                    deviceData.push(deviceInfo[i]);
                }
            }
        }

        res.send({
            deviceData,
        })
    }
}