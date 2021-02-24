import {history, RequestConfig} from 'umi';
import {RequestInterceptor, RequestOptionsInit} from "umi-request"
import {getLocaleItem} from "@/utils/storage"
import {BasicLayoutProps, Settings as LayoutSettings,} from '@ant-design/pro-layout';
import {CurrentUser, UserType} from '@/services/auth'

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
  let user = null;
  const token = getLocaleItem("user");
  if (token) {
    const {success, data} = await CurrentUser();
    if (success) {
      user = data.user;
    }
  }

  return {
    user,
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

