import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/_renderRoutes';
import RendererWrapper0 from 'C:/koori/github/monitor/monitor/front/src/pages/.umi/LocaleWrapper.jsx'
import _dvaDynamic from 'dva/dynamic'

let Router = require('dva/router').routerRedux.ConnectedRouter;

let routes = [
  {
    "path": "/user",
    "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__UserLayout" */'../../layouts/UserLayout'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
    "routes": [
      {
        "path": "/user",
        "redirect": "/user/login",
        "exact": true
      },
      {
        "path": "/user/login",
        "component": _dvaDynamic({
  app: window.g_app,
models: () => [
  import(/* webpackChunkName: 'p__User__models__register.js' */'C:/koori/github/monitor/monitor/front/src/pages/User/models/register.js').then(m => { return { namespace: 'register',...m.default}})
],
  component: () => import(/* webpackChunkName: "p__User__Login" */'../User/Login'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
        "exact": true
      },
      {
        "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
      }
    ]
  },
  {
    "path": "/",
    "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../../layouts/BasicLayout'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
    "Routes": [require('../Authorized').default],
    "authority": [
      "admins"
    ],
    "routes": [
      {
        "path": "/",
        "redirect": "/payorder/query",
        "exact": true
      },
      {
        "path": "/payorder",
        "name": "payorder",
        "icon": "pay-circle",
        "routes": [
          {
            "path": "/payorder/query",
            "name": "payorder.query",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../PayOrder/QueryOrder'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "path": "/payorder/statistics",
            "name": "payorder.statistics",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../PayOrder/OrderStatistics'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "path": "/payorder/refundList",
            "name": "payorder.refund-list",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../PayOrder/RefundList'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/device",
        "name": "device",
        "icon": "mobile",
        "routes": [
          {
            "path": "/device/query",
            "name": "device.query",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../Device/QueryDevice'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/member",
        "name": "member",
        "icon": "team",
        "routes": [
          {
            "path": "/member/query",
            "name": "member.query",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../Member/QueryMember'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "path": "/member/add",
            "name": "member.add",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../Member/AddMember'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "path": "/member/transferLicense",
            "name": "license.transfer-license",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../Member/TransferLicense'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/application",
        "name": "application",
        "icon": "appstore",
        "routes": [
          {
            "path": "/application/product",
            "name": "product.management",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../Application/ProductManagement'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "path": "/account",
        "name": "menu.account",
        "icon": "user",
        "routes": [
          {
            "path": "/account/changePassword",
            "name": "menu.account.change-password",
            "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "layouts__BasicLayout" */'../Account/ChangePassword'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
            "exact": true
          },
          {
            "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
          }
        ]
      },
      {
        "component": _dvaDynamic({
  
  component: () => import(/* webpackChunkName: "p__404" */'../404'),
  LoadingComponent: require('C:/koori/github/monitor/monitor/front/src/components/PageLoading/index').default,
}),
        "exact": true
      },
      {
        "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
      }
    ]
  },
  {
    "component": () => React.createElement(require('C:/koori/github/monitor/monitor/front/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', hasRoutesInConfig: true })
  }
];
window.g_routes = routes;
window.g_plugins.applyForEach('patchRoutes', { initialValue: routes });

// route change handler
function routeChangeHandler(location, action) {
  window.g_plugins.applyForEach('onRouteChange', {
    initialValue: {
      routes,
      location,
      action,
    },
  });
}
window.g_history.listen(routeChangeHandler);
routeChangeHandler(window.g_history.location);

export default function RouterWrapper() {
  return (
<RendererWrapper0>
          <Router history={window.g_history}>
      { renderRoutes(routes, {}) }
    </Router>
        </RendererWrapper0>
  );
}
