import {defineConfig, IRoute} from 'umi';
import router from "./router"


const defaultRoutes: IRoute[] = [
  {path: '/', component: '@/pages/index'},
  {
    path: "/login", component: "@/pages/UserLogin",
    headerRender: false,
    menuRender: false,
    menuHeaderRender: false,
  },
]


export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  layout: {
    name: 'Ant Design',
    layout: 'side',
  },
  routes: defaultRoutes.concat(router),
  fastRefresh: {},
  locale: {},
  proxy: {
    '/xadmin/v1': {
      'target': 'http://127.0.0.1:8000',
      'changeOrigin': true,
    },
  }
});
