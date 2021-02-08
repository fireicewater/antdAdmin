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

