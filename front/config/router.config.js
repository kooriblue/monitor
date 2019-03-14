export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admins'],
    routes: [
      { path: '/', redirect: '/payorder/query' },
      //PayOrder
      {
        path: '/payorder',
        name: 'payorder',
        icon: 'pay-circle',
        routes: [
          {
            path: '/payorder/query',
            name: 'payorder.query',
            component: './PayOrder/QueryOrder',
          },
          {
            path: '/payorder/statistics',
            name: 'payorder.statistics',
            component: './PayOrder/OrderStatistics',
          },
          {
            path: '/payorder/refundList',
            name: 'payorder.refund-list',
            component: './PayOrder/RefundList',
          }
        ],
      },
      //Device
      {
        path: '/device',
        name: 'device',
        icon: 'mobile',
        routes: [
          {
            path: '/device/query',
            name: 'device.query',
            component: './Device/QueryDevice',
          },
        ],
      },
      //Member
      {
        path: '/member',
        name: 'member',
        icon: 'team',
        routes: [
          {
            path: '/member/query',
            name: 'member.query',
            component: './Member/QueryMember',
          },
          {
            path: '/member/add',
            name: 'member.add',
            component: './Member/AddMember',
          },
          //License
          {
            path: '/member/transferLicense',
            name: 'license.transfer-license',
            component: './Member/TransferLicense',
          },
        ],
      },
      //Application Management
      {
        path: '/application',
        name: 'application',
        icon: 'appstore',
        routes: [
          {
            path: '/application/product',
            name: 'product.management',
            component: './Application/ProductManagement'
          }
        ],
      },
      //ActivationCode
      {
        path: '/activationcode',
        name: 'activationcode',
        icon: 'profile',
        routes: [
          {
            path: '/activationcode/generate',
            name: 'activationcode.generate',
            component: './ActivationCode/ActivationCodeForm',
          },
          {
            path: '/activationcode/show',
            name: 'activationcode.show',
            component: './ActivationCode/ShowActivationCode',
          },
        ],
      },
      //Account
      {
        path: '/account',
        name: 'menu.account',
        icon: 'user',
        routes: [
          {
            path: '/account/changePassword',
            name: 'menu.account.change-password',
            component: './Account/ChangePassword',
          }
        ],
      },
      //404
      {
        component: '404',
      },
    ],
  },
];
