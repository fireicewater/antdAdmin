import React, {FC, useMemo, useRef, useState} from 'react';
import type {FormInstance} from 'antd';
import {Button, message, Modal, Popconfirm, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, KeyOutlined, PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable, {TableDropdown} from '@ant-design/pro-table';
import {
  addUser,
  changePassword,
  ChangePasswordFormInterface,
  queryUser,
  removeUser,
  updateUser,
  UserInterface
} from "./service"
// @ts-ignore
import {Access, useAccess, useRequest} from "umi"
import {getFormColumns, getUpdateRecord} from "@/utils"
import {queryPermission} from "@/pages/Permission/service"
import {queryGroup} from "@/pages/Group/service"
import {ModalForm, ProFormText,} from '@ant-design/pro-form';

const requireColumns: string[] = [
  "username",
  "password"
]
const foreignKeys: string[] = []

type changePasswordType = {
  "initialValues": Pick<ChangePasswordFormInterface, "id">,
  "submit": (form: ChangePasswordFormInterface) => Promise<boolean | void>
}

const ChangePassword: FC<changePasswordType> = (params: changePasswordType) => {
  return (
    <>
      <ModalForm<ChangePasswordFormInterface>
        title="修改密码"
        trigger={
          <Button>
            <KeyOutlined/>
            重置密码
          </Button>
        }
        initialValues={params.initialValues}
        onFinish={params.submit}
      >
        <ProFormText.Password
          name="new_password"
          label="新密码"
          placeholder="请输入新密码"
          rules={[
            {
              required: true,
              message: '请输入新密码',
            },
          ]}/>
        <ProFormText.Password
          name="re_password"
          label="重复密码"
          placeholder="请重复输入新密码"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: '请重复输入新密码',
            },
            ({getFieldValue}) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('密码两次输入不相同');
              },
            }),
          ]}
        />
      </ModalForm>
    </>
  )
}

const table: FC<void> = () => {
  //处理通用逻辑
  const actionRef = useRef<ActionType>();
  const [createModelVisible, setCreateModelVisible] = useState<boolean>(false);
  const [updateModelVisible, setUpdateModelVisible] = useState<boolean>(false);
  const updateForm = useRef<FormInstance>();
  const createFrom = useRef<FormInstance>();
  const [userForm, setUserForm] = useState<Partial<UserInterface>>({});
  const {loading: updateLoading, run: runUpdate} = useRequest(updateUser, {manual: true});
  const {loading: createLoading, run: runCreate} = useRequest(addUser, {manual: true});
  const {loading: removeLoading, run: runRemove} = useRequest(removeUser, {manual: true});
  const {loading: changePasswordLoading, run: runChangePassword} = useRequest(changePassword, {manual: true});
  const handleUpdate: (params: Partial<UserInterface>) => void = async (params) => {
    await runUpdate(params, userForm.id as number);
    message.success("修改成功");
    setUpdateModelVisible(false);
    setUserForm({});
    actionRef.current?.reload();
  }
  const handleCreate: (params: Partial<UserInterface>) => void = async (params) => {
    await runCreate(params);
    message.success("新增成功");
    setCreateModelVisible(false);
    actionRef.current?.reload();
  }
  const handleRemove: (params: UserInterface[]) => void = async (params) => {
    await runRemove(params.map(x => x.id));
    message.success("删除成功");
  }
  //处理外键相关
  const {loading: PermissionLoading, data: Permission} = useRequest(() => queryPermission({all: 1}))
  const {loading: GroupLoading, data: Group} = useRequest(() => queryGroup({all: 1}))

  //权限
  const access = useAccess();
  const columns: ProColumns<UserInterface, "boolType" | "foreignKeyType">[] = [
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
      title: '权限',
      dataIndex: 'user_permissions',
      valueType: 'foreignKeyType',
      fieldProps: {
        selectValue: Permission,
        many: true
      }
    },
    {
      title: '组',
      dataIndex: 'group',
      valueType: 'foreignKeyType',
      fieldProps: {
        selectValue: Group,
        many: true
      }
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
      dataIndex: 'option',
      render: (text, record, index, action) => [
        <Access accessible={access["xadmin_api.change_customuser"]}>
          <Button icon={<EditOutlined/>} type="primary" key={"update" + index} onClick={() => {
            setUpdateModelVisible(true);
            const updateRecord = getUpdateRecord(columns, record);
            setUserForm(updateRecord);
          }}/>
        </Access>
        ,
        <Access accessible={access["xadmin_api.delete_customuser"]}>
          <Popconfirm
            title="您确定要删除用户吗"
            placement="top"
            onConfirm={async () => {
              await handleRemove([record]);
              actionRef.current?.reload()
            }}
            okButtonProps={{loading: removeLoading}}
            key={"delete" + index}
          >
            <Button icon={<DeleteOutlined/>} type="primary"/>
          </Popconfirm>
        </Access>
        ,
        <TableDropdown
          key={"dropdown" + index}
          menus={[{
            key: "changePassword",
            name:
              <Access accessible={access["xadmin_api.change_password_customuser"]}>
                <ChangePassword initialValues={record} submit={async (form) => {
                  form.id = record.id;
                  await runChangePassword(form);
                  message.success("重置密码成功");
                  return true;
                }
                }/>
              </Access>
          }]}
        />,
      ]
    }
  ];
  const updateColumns = useMemo<ProColumns<UserInterface, "boolType" | "foreignKeyType">[]>(() => {
    const formColumns = getFormColumns<UserInterface, "boolType" | "foreignKeyType">(columns, requireColumns);
    //删除password
    formColumns.splice(formColumns.findIndex(item => item.dataIndex === "password"), 1)
    return formColumns;
  }, columns)
  const createColumns = useMemo<ProColumns<UserInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<UserInterface, "boolType" | "foreignKeyType">(columns, requireColumns);
  }, columns);
  return (
    <>
      <ProTable<UserInterface, Partial<UserInterface>, "boolType" | "foreignKeyType">
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="用户列表"
        request={queryUser}
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        }}
        search={{
          labelWidth: "auto"
        }}
        tableAlertOptionRender={({selectedRows, onCleanSelected}) => {
          return (
            <Space>¬
              <Access accessible={access["xadmin_api.delete_customuser"]}>
                <a onClick={async () => {
                  await handleRemove(selectedRows);
                  onCleanSelected();
                }}>批量删除</a>
              </Access>
            </Space>
          )
        }}
        options={{
          search: true,
        }}
        toolBarRender={() =>
          [
            <Access accessible={access["xadmin_api.add_customuser"]}>
              <Button key="button" icon={<PlusOutlined/>} type="primary" onClick={() => setCreateModelVisible(true)}>
                新建
              </Button>
            </Access>,
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
        width={600}
      >
        <ProTable<UserInterface, Partial<UserInterface>, "boolType" | "foreignKeyType">
          columns={updateColumns}
          formRef={updateForm}
          type="form"
          rowKey="id"
          onSubmit={handleUpdate}
          onReset={() => {
            updateForm.current?.resetFields();
          }}
          form={
            {
              initialValues: userForm,
              labelCol: {span: 6},
              labelAlign: 'left',
              layout: "horizontal",
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
        width={600}
      >
        <ProTable<UserInterface, Partial<UserInterface>, "boolType" | "foreignKeyType">
          columns={createColumns}
          type="form"
          rowKey="id"
          formRef={createFrom}
          onSubmit={handleCreate}
          search={{
            span: {
              lg: 12,
              md: 12,
              xxl: 12,
              xl: 12,
              sm: 12,
              xs: 24,
            }
          }}
          form={
            {
              labelCol: {span: 6},
              labelAlign: 'left',
              layout: "horizontal",
            }}
        />
      </Modal>
    </>
  )
}

export default table;
