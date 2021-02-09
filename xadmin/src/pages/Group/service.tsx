import {request} from 'umi';
import {BaseInterface, QueryParams, selectValueType} from "@/utils"


export interface GroupInterface extends BaseInterface {
  name: string;
  codename: string;
  permissions: selectValueType[] | number[]
}


export async function queryGroup(params: QueryParams) {
  return request('/group', {
    params,
  });
}

export async function updateGroup(params: Partial<GroupInterface>, id: number) {
  return await request(`/group/${id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function addGroup(params: Partial<GroupInterface>) {
  return await request('/group', {
    method: 'POST',
    data: params,
  });
}

export async function removeGroup(ids: number[]) {
  const param = ids.join(",");
  return await request(`/group/${param}`, {
    method: 'DELETE',
  });
}

