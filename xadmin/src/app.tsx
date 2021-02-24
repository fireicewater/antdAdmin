import {history, RequestConfig} from 'umi';
import {RequestInterceptor, RequestOptionsInit} from "umi-request"
import {getLocaleItem} from "@/utils/storage"
import {BasicLayoutProps, Settings as LayoutSettings,} from '@ant-design/pro-layout';
import {CurrentUser, getAllPermissions, UserType} from '@/services/auth'

const tokenRequestInterceptor: RequestInterceptor
  = (url: string, options: RequestOptionsInit) => {
  const loginregex = /login/i
  const optionsCopy = {...options}
  //如果不是登录的
  if (!loginregex.test(url)) {
    let headers = optionsCopy.headers
    let token = getLocaleItem("user");
    if (token) {
      headers = Object.assign(headers, {"Authorization": `JWT ${token}`})
    }
    optionsCopy.headers = headers;
  }
  return {
    url: url,
    options: optionsCopy,
  };
}

export const request: RequestConfig = {
  timeout: 100000,
  prefix: '/xadmin/v1',
  requestInterceptors: [tokenRequestInterceptor],
};


export async function getInitialState() {
  let user: UserType | null = null;
  let userPermissions: string[] = [];
  let permissions: string[] = [];
  const token = getLocaleItem("user");
  //获取用户 及用户权限
  if (token) {
    const {success, data} = await CurrentUser();
    if (success) {
      user = data.user;
      userPermissions = userPermissions.concat(data.userPermissions);
    }
  }
  //获取权限列表 用于access
  const {success, data} = await getAllPermissions();
  if (success) {
    permissions = permissions.concat(data);
  }
  return {
    user,
    userPermissions,
    permissions
  }
}

export const layout = ({initialState,}: {
  initialState: { settings?: LayoutSettings; user: UserType };
}): BasicLayoutProps => {
  return {
    onPageChange: () => {
      const {user} = initialState;
      const {location} = history;
      // 如果没有登录，重定向到 login
      if (!user && location.pathname !== '/login') {
        history.push('/login');
      }
    },
    ...initialState?.settings,
  };
}

