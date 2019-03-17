export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
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
      //404
      {
        component: '404',
      },
    ],
  },
];
