import React, {FC, useContext} from 'react';
import ProProvider from '@ant-design/pro-provider';
import {Select, Space, Switch, Tag} from 'antd';

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
            render: (text: [], props) => {
              return (
                <Space direction="horizontal" wrap={true}>
                  {
                    text.map(x => (<Tag>{x}</Tag>))
                  }
                </Space>
              );
            },
            renderFormItem(text, props, element) {
              const {Option} = Select;
              const {fieldProps: {onChange, selectValue, value}} = props;
              if (selectValue) {
                const key = selectValue.key
                const values: ({ id: number, [key: string]: any })[] = selectValue.values
                return (<Select mode="multiple" style={{width: '100%'}} placeholder="请选择" optionFilterProp="label"
                                onChange={onChange} value={value}>
                  {values.map((x, index) => <Option key={index} value={x.id} label={x[key]}>{x[key]}</Option>)}
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

