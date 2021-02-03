import {defineConfig} from 'umi';
import router from "./router"


export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  layout: {
    name: 'Ant Design',
    locale: false,
    layout: 'side',
  },
  routes: router,
  fastRefresh: {},
  proxy:{
    '/xadmin/v1': {
      'target': 'http://127.0.0.1:8000',
      'changeOrigin': true,
    },
  }
});
