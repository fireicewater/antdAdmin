import React, {FC, useContext} from 'react';
import ProProvider from '@ant-design/pro-provider';
import {Select, Space, Switch, Tag} from 'antd';
import {selectValueType} from "@/utils"


//TODO 后续加入登陆状态判断 现在想加入统一context
const APP: FC = (props) => {
  const values = useContext(ProProvider);
  return (
    <ProProvider.Provider value={
      {
        ...values,
        valueTypeMap: {
          boolType: {
            render: (text, props) => {
              return <Switch checked={text} disabled={true}/>
            },
            renderFormItem: (text, props, element) => {
              return <Switch checked={text} onChange={props.fieldProps.onChange}/>
            }
          },
          foreignKeyType: {
            render: (text: selectValueType[] | selectValueType, props, element) => {
              if (text instanceof Array) {
                return (
                  <Space direction="horizontal" wrap={true}>
                    {
                      text.map((x, index) => (<Tag key={index}>{x.ty_options_display_txt}</Tag>))
                    }
                  </Space>
                );
              } else if (text.ty_options_display_txt) {
                return (<span>{text.ty_options_display_txt}</span>)
              }
              return element;
            },
            renderFormItem: function (_, props, element) {
              const {Option} = Select;
              const {selectValue, many, value, onChange}: {
                selectValue: selectValueType[],
                many: boolean,
                value: any,
                onChange: (...rest: any[]) => void;
              } = props.fieldProps;
              if (selectValue) {
                //判断是否可以多选
                if (many) {
                  return (<Select mode="multiple" style={{width: '100%'}} placeholder="请选择"
                                  optionFilterProp="label"
                                  onChange={onChange} value={value}>
                    {selectValue.map((x, index) => <Option key={index} value={x.id}
                                                           label={x["ty_options_display_txt"]}>{x["ty_options_display_txt"]}</Option>)}
                  </Select>)
                }
                return (<Select style={{width: '100%'}} placeholder="请选择"
                                onChange={onChange}
                                showSearch value={value}
                                filterOption={(input, option) =>
                                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }

                >
                  {selectValue.map((x, index) => <Option key={index}
                                                         value={x.id}>{x["ty_options_display_txt"]}</Option>)}
                </Select>)
              }
              return element;
            }
          }
        }

      }
    }>
      {props.children}
    </ProProvider.Provider>
  )
}
export default APP;

