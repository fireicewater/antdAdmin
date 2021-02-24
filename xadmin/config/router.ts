import {IRoute} from "umi"


export default <IRoute[]>[
  {
    path: '/system',
    name: '系统',
    icon: "UserOutlined",
    component: '@/layouts',
    routes: [
      {
        path: '/system/user',
        component: '@/pages/User',
        wrappers: [
          '@/layouts/TableLayout',
        ],
        name: '用户',
        access: 'xadmin_api.view_customuser',
      },
      {
        path: '/system/permission',
        component: '@/pages/Permission',
        wrappers: [
          '@/layouts/TableLayout',
        ],
        name: '权限',
        access: 'auth.view_permission',
      },
      {
        path: '/system/group',
        component: '@/pages/Group',
        wrappers: [
          '@/layouts/TableLayout',
        ],
        name: '组',
        access: 'auth.view_group',
      },
    ]
  },

];

