import {RequestConfig,} from 'umi';
import {RequestInterceptor, RequestOptionsInit} from "umi-request"
import {getLocaleItem} from "@/utils/storage"

const tokenRequestInterceptor: RequestInterceptor
  = (url: string, options: RequestOptionsInit) => {
  const loginregex = /login/i
  const optionsCopy = {...options}
  //如果不是登录的
  if (!loginregex.test(url)) {
    let hearders = optionsCopy.headers
    let token = getLocaleItem("user");
    if (token) {
      hearders = Object.assign(hearders, {"Authorization": `JWT ${token}`})
    }
    optionsCopy.headers = hearders;
  }
  return {
    url: url,
    options: optionsCopy,
  };
}

export const request: RequestConfig = {
  timeout: 1000,
  prefix: '/xadmin/v1',
  requestInterceptors: [tokenRequestInterceptor],
};



