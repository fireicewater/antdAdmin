import React, {useMemo, useRef, useState} from 'react';
import type {FormInstance} from 'antd';
import {Button, Modal} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable, {TableDropdown} from '@ant-design/pro-table';
import {addUser, queryUser, updateUser, UserType} from "./service"
import {useRequest,} from "umi"
import {getFormColumns} from "@/utils"

const menus: {
  name: React.ReactNode;
  key: string;
}[] = [
  {key: 'copy', name: '复制'},
  {key: 'delete', name: '删除'},
]


export default () => {
  const actionRef = useRef<ActionType>();
  const [createModelVisible, setCreateModelVisible] = useState<boolean>(false);
  const [updateModelVisible, setUpdateModelVisible] = useState<boolean>(false);
  const updateForm = useRef<FormInstance>();
  const createFrom = useRef<FormInstance>();
  const [userForm, setUserForm] = useState<Partial<UserType>>({});
  const {loading: updateLoading, run: runUpdate} = useRequest(updateUser, {manual: true});
  const {loading: createLoading, run: runCreate} = useRequest(addUser, {manual: true});
  const columns: ProColumns<UserType, "boolType">[] = [
    {
      title: "id",
      dataIndex: 'id',
      valueType: 'indexBorder',
    },
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "密码",
      dataIndex: "password",
      valueType: "password",
      search: false,
      hideInTable: true,
    },
    {
      title: "名字",
      dataIndex: "first_name",
    },
    {
      title: "姓氏",
      dataIndex: "last_name",
    },
    {
      title: "邮箱",
      dataIndex: "email",
    },
    {
      title: "工作人员",
      dataIndex: "is_staff",
      valueType: 'boolType',
    },
    {
      title: "有效",
      dataIndex: "is_active",
      valueType: 'boolType',
    },
    {
      title: "超级用户",
      dataIndex: "is_superuser",
      valueType: 'boolType',
    },
    {
      title: '加入日期',
      hideInForm: true,
      dataIndex: 'date_joined',
      valueType: 'dateTime',
      search: false
    },
    {
      title: '最后登陆',
      hideInForm: true,
      dataIndex: 'last_login',
      valueType: 'dateTime',
      search: false
    },
    {
      title: '加入日期',
      dataIndex: 'date_joined',
      valueType: 'dateRange',
      hideInTable: true,
      hideInForm: true,
      search: {
        transform: (value) => {
          return {
            date_joined_start: value[0],
            date_joined_end: value[1],
          };
        },
      },
    },
    {
      title: '最后登陆',
      dataIndex: 'last_login',
      valueType: 'dateRange',
      hideInTable: true,
      hideInForm: true,
      search: {
        transform: (value) => {
          return {
            last_login_start: value[0],
            last_login_end: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <Button icon={<EditOutlined/>} type="primary" key="update" onClick={() => {
          setUpdateModelVisible(true);
          setUserForm(record);
        }}/>,
        <Button icon={<DeleteOutlined/>} type="primary" key="update"/>,
        <TableDropdown menus={menus}
                       onSelect={key => {

                       }}
        />
      ]
    }
  ];
  const updateColumns = useMemo<ProColumns<UserType, "boolType">[]>(() => {
    return getFormColumns<UserType, "boolType">(columns, ["password"]);
  }, columns)
  const createColumns = useMemo<ProColumns<UserType, "boolType">[]>(() => {
    return getFormColumns<UserType, "boolType">(columns);
  }, columns);
  return (
    <>
      < ProTable<UserType, Record<string, any>, 'boolType'>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="用户列表"
        request={queryUser}
        toolBarRender={() =>
          [
            <Button key="button" icon={<PlusOutlined/>} type="primary" onClick={() => setCreateModelVisible(true)}>
              新建
            </Button>,
          ]
        }
      />
      {/*update*/}
      <Modal
        title="修改"
        visible={updateModelVisible}
        confirmLoading={updateLoading}
        onCancel={() => setUpdateModelVisible(false)}
        footer={null}
      >
        <ProTable<UserType, Record<string, any>, 'boolType'>
          columns={updateColumns}
          formRef={updateForm}
          type="form"
          rowKey="id"
          headerTitle="高级表格"
          onSubmit={(value) => {
            runUpdate(value, userForm.id as number).then(data => {
              setUpdateModelVisible(false);
              actionRef.current?.reload()
            })
          }}
          onReset={() => {
            updateForm.current?.resetFields();
          }}
          form={
            {
              initialValues: userForm,
              labelCol: {span: 6},
              labelAlign: 'left',
            }
          }
        />
      </Modal>
      {/*create*/}
      <Modal
        title="新增"
        visible={createModelVisible}
        confirmLoading={createLoading}
        onCancel={() => setCreateModelVisible(false)}
        footer={null}
      >
        <ProTable<UserType, Record<string, any>, 'boolType'>
          columns={createColumns}
          type="form"
          rowKey="id"
          formRef={createFrom}
          onSubmit={(value) => {
            runCreate(value).then(data => {
              setCreateModelVisible(false);
              actionRef.current?.reload()
            })
          }}
          form={
            {
              initialValues: userForm,
              labelCol: {span: 6},
              labelAlign: 'left',
            }
          }
        />
      </Modal>
    </>
  )
}
