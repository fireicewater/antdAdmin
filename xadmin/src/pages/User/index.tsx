import React, {useMemo, useRef, useState} from 'react';
import type {FormInstance} from 'antd';
import {Button, message, Modal, Popconfirm, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {addUser, queryUser, removeUser, updateUser, UserInterface} from "./service"
import {useRequest,} from "umi"
import {getFormColumns} from "@/utils"


export default () => {
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
    // {
    //   title: '权限',
    //   dataIndex: 'user_permissions',
    //   valueType: 'foreignKeyType',
    //   fieldProps: {
    //     selectValue: {
    //       key: "test",
    //       values: [
    //         {id: 1, test: "123"},
    //         {id: 2, test: "456"}
    //       ]
    //     }
    //   }
    // },
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
        <Button icon={<EditOutlined/>} type="primary" key={"update" + index} onClick={() => {
          setUpdateModelVisible(true);
          setUserForm(record);
        }}/>,
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
        ,
        // <TableDropdown menus={menus}
        //                onSelect={key => {
        //
        //                }}
        // />,
      ]
    }
  ];
  const updateColumns = useMemo<ProColumns<UserInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<UserInterface, "boolType" | "foreignKeyType">(columns, ["password"]);
  }, columns)
  const createColumns = useMemo<ProColumns<UserInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<UserInterface, "boolType" | "foreignKeyType">(columns);
  }, columns);
  return (
    <>
      < ProTable<UserInterface, Partial<UserInterface>, "boolType" | "foreignKeyType">
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="用户列表"
        request={queryUser}
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        }}
        tableAlertOptionRender={({selectedRows, onCleanSelected}) => {
          return (
            <Space>
              {/*<a>导出选中</a>*/}
              <a onClick={async () => {
                await handleRemove(selectedRows);
                onCleanSelected();
              }}>批量删除</a>
            </Space>
          )
        }}
        options={{
          search: true,
        }}
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
        <ProTable<UserInterface, Partial<UserInterface>, "boolType" | "foreignKeyType">
          columns={createColumns}
          type="form"
          rowKey="id"
          formRef={createFrom}
          onSubmit={handleCreate}
          form={
            {
              labelCol: {span: 8},
              labelAlign: 'left',
            }
          }
        />
      </Modal>
    </>
  )
}
