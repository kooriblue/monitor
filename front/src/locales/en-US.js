// import analysis from './en-US/analysis';
import exception from './en-US/exception';
// import form from './en-US/form';
import globalHeader from './en-US/globalHeader';
import login from './en-US/login';
import menu from './en-US/menu';
import monitor from './en-US/monitor';
import result from './en-US/result';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import pwa from './en-US/pwa';
import activationCode from './en-US/activationcode';
import payOrder from './en-US/payorder';
import member from './en-US/member';
import device from './en-US/device';
import product from './en-US/product';
import application from './en-US/application';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.home.introduce': 'introduce',
  'app.forms.basic.title': 'Basic form',
  'app.forms.basic.description':
    'Form pages are used to collect or verify information to users, and basic forms are common in scenarios where there are fewer data items.',
  'app.version': 'Version: ',
  'app.query': 'Query',
  "app.submit": 'Submit',
  'app.return': 'Return',
  "app.save": 'Save',
  "app.ok": 'OK',
  "app.wrong-password": 'The password is wrong.',
  "app.login-wrong": 'The username or the password is wrong.',
  "app.change-password.old-password": 'Previous Password',
  "app.change-password.new-password": 'New Password',
  "app.change-password.confirm-password": 'Confirm Password',
  "app.change-password.alert.password": 'Please input the password!',
  "app.change-password.alert.confirm": 'Please enter the correct password!',
  "app.change-password.alert.success": 'Successfully change the password.',
  "app.true": 'Yes',
  "app.false": "No",
  "app.empty-app-list": 'App list is empty',
  "app.fail-get-app-list": 'Fail to get app list.',
  "app.cell-operator": 'Cell Operator',
  "app.remark": 'Remark',
  "payment": 'Payment',
  ...activationCode,
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
  ...payOrder,
  ...member,
  ...device,
  ...product,
  ...application,
};
