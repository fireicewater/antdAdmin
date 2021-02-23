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
        name: '用户', // 兼容此写法
      },
      {
        path: '/system/permission',
        component: '@/pages/Permission',
        wrappers: [
          '@/layouts/TableLayout',
        ],
        name: '权限', // 兼容此写法
      },
      {
        path: '/system/group',
        component: '@/pages/Group',
        wrappers: [
          '@/layouts/TableLayout',
        ],
        name: '组', // 兼容此写法
      },
    ]
  },

];

