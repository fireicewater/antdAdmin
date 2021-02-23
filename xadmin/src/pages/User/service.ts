import {request} from 'umi';
import {BaseInterface, QueryParams, selectValueType} from "@/utils"

export interface UserInterface extends BaseInterface {
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
  is_active: boolean
  date_joined: Date
  last_login: Date
  is_superuser: string,
  user_permissions: selectValueType[] | number[]
}

export interface ChangePasswordFormInterface {
  id: number;
  new_password: string;
  re_password: string;
}

export async function queryUser(params: QueryParams) {
  return await request("/user", {
    params
  })
}

export async function updateUser(params: Partial<UserInterface>, id: number) {
  return await request(`/user/${id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function addUser(params: Partial<UserInterface>) {
  return await request('/user', {
    method: 'POST',
    data: params,
  });
}

export async function removeUser(ids: number[]) {
  const param = ids.join(",");
  return await request(`/user/${param}`, {
    method: 'DELETE',
  });
}

export async function changePassword(params: ChangePasswordFormInterface) {
  return await request(`/user/changePassword`, {
    method: 'POST',
    data: params
  })
}
