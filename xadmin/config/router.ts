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
    },
  },
];

