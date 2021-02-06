import React, {FC, useContext} from 'react';
import ProProvider from '@ant-design/pro-provider';
import {Switch,} from 'antd';

//TODO 后续加入登陆状态判断 现在想加入统一context
const APP: FC = (props) => {
  const values = useContext(ProProvider);
  return (
    <ProProvider.Provider value={
      {
        ...values,
        valueTypeMap: {
          boolType: {
            render: (text) => {
              return <Switch checked={text} disabled={true}/>
            },
            renderFormItem: (text, props) => {
              return <Switch checked={text} onChange={props.fieldProps.onChange}/>
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

