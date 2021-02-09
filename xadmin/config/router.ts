import {IRoute} from "umi"


export default <IRoute[]>[
  {
    path: '/user',
    component: '@/pages/User',
    wrappers: [
      '@/layouts/TableLayout',
    ],
    menu: {
      name: '用户', // 兼容此写法
      icon: "UserOutlined"
    },
  },
  {
    path: '/permission',
    component: '@/pages/Permission',
    wrappers: [
      '@/layouts/TableLayout',
    ],
    menu: {
      name: '权限', // 兼容此写法
      icon: "UserOutlined"
    },
  },
  {
    path: '/group',
    component: '@/pages/Group',
    wrappers: [
      '@/layouts/TableLayout',
    ],
    menu: {
      name: '组', // 兼容此写法
      icon: "UserOutlined"
    },
  },
];

