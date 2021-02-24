import {request} from 'umi';
import {setLocalItem} from "@/utils/storage";

const USERKEY = "user";

export interface AuthParam {
  username: string,
  password: string
}

export type UserType = {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export async function AccountLogin(params: AuthParam) {
  const {data} = await request('/login/account', {
    method: 'POST',
    data: params,
  });
  const token = data.token;
  setLocalItem(USERKEY, token, data.expireTime);
}

export async function CurrentUser() {
  return request('/currentUser', {
    method: 'Get'
  })
}


