import dva from 'dva';
import createLoading from 'dva-loading';

const runtimeDva = window.g_plugins.mergeConfig('dva');
let app = dva({
  history: window.g_history,
  
  ...(runtimeDva.config || {}),
});

window.g_app = app;
app.use(createLoading());
(runtimeDva.plugins || []).forEach(plugin => {
  app.use(plugin);
});

app.model({ namespace: 'appinfo', ...(require('C:/koori/github/monitor/monitor/front/src/models/appinfo.js').default) });
app.model({ namespace: 'global', ...(require('C:/koori/github/monitor/monitor/front/src/models/global.js').default) });
app.model({ namespace: 'list', ...(require('C:/koori/github/monitor/monitor/front/src/models/list.js').default) });
app.model({ namespace: 'login', ...(require('C:/koori/github/monitor/monitor/front/src/models/login.js').default) });
app.model({ namespace: 'menu', ...(require('C:/koori/github/monitor/monitor/front/src/models/menu.js').default) });
app.model({ namespace: 'payorder', ...(require('C:/koori/github/monitor/monitor/front/src/models/payorder.js').default) });
app.model({ namespace: 'project', ...(require('C:/koori/github/monitor/monitor/front/src/models/project.js').default) });
app.model({ namespace: 'setting', ...(require('C:/koori/github/monitor/monitor/front/src/models/setting.js').default) });
app.model({ namespace: 'user', ...(require('C:/koori/github/monitor/monitor/front/src/models/user.js').default) });
