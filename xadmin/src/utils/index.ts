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
 * @param exclude
 */
export function getFormColumns<T, U>(columns: ProColumns<T, U>[], exclude: string[] = []): ProColumns<T, U>[] {
  //深度copy
  const copyColumns: ProColumns<T>[] = JSON.parse(JSON.stringify(columns)).filter((x: { dataIndex: string; }) => {
    const {dataIndex} = x;
    return !exclude.includes(dataIndex)
  });
  getExcludeColumns(copyColumns).forEach(x => {
    x.formItemProps = {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    }
  })
  return copyColumns;
}

export const twoColumns = {
  span: {
    lg: 12,
    md: 12,
    xxl: 12,
    xl: 12,
    sm: 12,
    xs: 24,
  },
};

