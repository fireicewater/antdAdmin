import {request} from 'umi';

export interface UserType {
  id: number
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
  is_active: boolean
  date_joined: Date
  last_login: Date
  is_superuser: string
}

export async function queryUser(params: {
  pageSize?: number;
  current?: number;
},) {
  return await request("/user", {
    params
  })
}

export async function updateUser(params: Partial<UserType>, id: number) {
  return request(`/user/${id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function addUser(params: Partial<UserType>) {
  return request('/user', {
    method: 'POST',
    data: params,
  });
}

export async function removeUser(id: number) {
  return request(`/user/${id}`, {
    method: 'DELETE',
  });
}
