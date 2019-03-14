import activationCode from './zh-CN/activationcode';
// import analysis from './zh-CN/analysis';
import exception from './zh-CN/exception';
// import form from './zh-CN/form';
import globalHeader from './zh-CN/globalHeader';
import login from './zh-CN/login';
import menu from './zh-CN/menu';
import monitor from './zh-CN/monitor';
import result from './zh-CN/result';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import payOrder from './zh-CN/payorder';
import pwa from './zh-CN/pwa';
import member from './zh-CN/member';
import device from './zh-CN/device';
import product from './zh-CN/product';
import application from './zh-CN/application';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.home.introduce': '介绍',
  'app.forms.basic.title': '基础表单',
  'app.forms.basic.description':
    '表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。',
  'app.version': '版本：',
  'app.query': '查询',
  "app.submit": '提交',
  'app.return': '返回',
  "app.save": '保存',
  "app.ok": '确定',
  "app.wrong-password": '密码错误',
  "app.login-wrong": '用户或密码不存在',
  "app.change-password.old-password": '旧密码',
  "app.change-password.new-password": '新密码',
  "app.change-password.confirm-password": '确认密码',
  "app.change-password.alert.password": '请输入密码！',
  "app.change-password.alert.confirm": '请输入正确的密码！',
  "app.change-password.alert.success": '成功修改密码',
  "app.true": '是',
  "app.false": "否",
  "app.empty-app-list": '应用列表为空',
  "app.fail-get-app-list": '获取应用列表失败',
  "app.cell-operator": '执行者',
  "app.remark": '备注',
  "payment": '付款',
  // ...analysis,
  ...exception,
  // ...form,
  ...globalHeader,
  ...login,
  ...menu,
  ...monitor,
  ...result,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...activationCode,
  ...payOrder,
  ...member,
  ...device,
  ...product,
  ...application,
};
