import {request} from 'umi';
import {BaseInterface, QueryParams} from "@/utils"

export interface ContentTypeInterface extends BaseInterface {
  app_label: string;
  model: string;
}


export interface PermissionInterface extends BaseInterface {
  name: string;
  codename: string;
  content_type: ContentTypeInterface
}


export async function queryPermission(params: QueryParams) {
  return request('/permission', {
    params,
  });
}

export async function updatePermission(params: Partial<PermissionInterface>, id: number) {
  return await request(`/permission/${id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function addPermission(params: Partial<PermissionInterface>) {
  return await request('/permission', {
    method: 'POST',
    data: params,
  });
}

export async function removePermission(ids: number[]) {
  const param = ids.join(",");
  return await request(`/permission/${param}`, {
    method: 'DELETE',
  });
}

export async function queryContentType(params: QueryParams) {
  return request('/content_type', {
    params,
  });
}
