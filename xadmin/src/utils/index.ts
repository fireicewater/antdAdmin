import type {ProColumns} from '@ant-design/pro-table';
import type {ProFieldValueType} from '@ant-design/pro-utils'

const EXCLUDETYPE: (ProFieldValueType | "boolType")[] = ["index", 'indexBorder', 'fromNow', "option", "boolType"];


const getExcludeColumns = <T, U>(columns: ProColumns<T, U>[]): ProColumns<T, U>[] => {
  return columns.filter(x => {
    const {valueType, hideInForm} = x;
    // columns 设置hideInForm的
    if (hideInForm) {
      return false;
    }
    //排除系统参数
    return !EXCLUDETYPE.includes(<ProFieldValueType>valueType);
  })
}

/**
 * 转换formcolumn 并增加 默认require 校验
 * @param columns
 * @param includes
 * @param foreignKeys 外键 select 单选
 */
export function getFormColumns<T, U>(columns: ProColumns<T, U>[], includes: string[], foreignKeys: string[] = []): ProColumns<T, U>[] {
  //深度copy
  const copyColumns: ProColumns<T>[] = JSON.parse(JSON.stringify(columns));
  getExcludeColumns(copyColumns.filter((x) => {
    const {dataIndex} = x;
    return includes.includes(dataIndex as string);
  })).forEach(x => {
    x.formItemProps = {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    }
  })
  copyColumns.filter(x => foreignKeys.includes(x.dataIndex as string)).forEach(x => {
    // @ts-ignore
    x.fieldProps.many = false;
  })
  return copyColumns;
}

export function getUpdateRecord<T, U>(columns: ProColumns<T, U | "foreignKeyType">[], record: T) {
  const copyRecord: T = JSON.parse(JSON.stringify(record));
  const keys = columns.filter(x => (x.valueType === "foreignKeyType")).map(x => x.dataIndex);
  for (let key in copyRecord) {
    if (keys.includes(key)) {
      let tempArray: number[] | number;
      let recordElement = getProperty(copyRecord, key) as unknown as selectValueType | selectValueType[]
      if ("id" in recordElement) {
        tempArray = recordElement.id
      } else if (recordElement instanceof Array) {
        tempArray = recordElement.map(x => x.id);
      }
      // @ts-ignore
      copyRecord[key] = tempArray;
    }
  }
  return copyRecord;
}

function getProperty<T, K extends keyof T>(o: T, name: K): T[K] {
  return o[name];
}

export interface BaseInterface {
  readonly ty_options_display_txt: string;
  id: number
}

export declare type QueryParams = {
  pageSize?: number;
  current?: number;
  [key: string]: any;
}

export declare type selectValueType = {
  id: number;
  ty_options_display_txt: string;
  [key: string]: any;
}
