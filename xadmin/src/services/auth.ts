import {request} from 'umi';

export interface AuthParam {
  username: string,
  password: string
}

export async function AccountLogin(params: AuthParam) {
  return request('/xadmin/v1/login/account', {
    method: 'POST',
    data: params,
  });
}

