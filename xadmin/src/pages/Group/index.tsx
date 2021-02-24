import React, {FC, useMemo, useRef, useState} from 'react';
import type {FormInstance} from 'antd';
import {Button, message, Modal, Popconfirm, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
//@ts-ignore
import {Access, useAccess, useRequest} from "umi"
import {getFormColumns, getUpdateRecord} from "@/utils"
import {addGroup, GroupInterface, queryGroup, removeGroup, updateGroup} from "./service"
import {queryPermission} from "@/pages/Permission/service";


const requireColumns: string[] = [
  "name",
  "permissions"
]


const foreignKeys: string[] = []

const table: FC<void> = () => {
  const actionRef = useRef<ActionType>();
  const [createModelVisible, setCreateModelVisible] = useState<boolean>(false);
  const [updateModelVisible, setUpdateModelVisible] = useState<boolean>(false);
  const updateForm = useRef<FormInstance>();
  const createFrom = useRef<FormInstance>();
  const [userForm, setUserForm] = useState<Partial<GroupInterface>>({});
  const {loading: updateLoading, run: runUpdate} = useRequest(updateGroup, {manual: true});
  const {loading: createLoading, run: runCreate} = useRequest(addGroup, {manual: true});
  const {loading: removeLoading, run: runRemove} = useRequest(removeGroup, {manual: true});

  const handleUpdate: (params: Partial<GroupInterface>) => void = async (params) => {
    await runUpdate(params, userForm.id as number);
    message.success("修改成功");
    setUpdateModelVisible(false);
    setUserForm({});
    actionRef.current?.reload();
  }
  const handleCreate: (params: Partial<GroupInterface>) => void = async (params) => {
    await runCreate(params);
    message.success("新增成功");
    setCreateModelVisible(false);
    actionRef.current?.reload();
  }

  const handleRemove: (params: GroupInterface[]) => void = async (params) => {
    await runRemove(params.map(x => x.id));
    message.success("删除成功");
  }

  //处理外键相关
  const {loading: PermissionLoading, data: Permission} = useRequest(() => queryPermission({all: 1}))
  //权限
  const access = useAccess();

  const columns: ProColumns<GroupInterface, "boolType" | "foreignKeyType">[] = [
    {
      title: "id",
      dataIndex: 'id',
      valueType: 'indexBorder',
    },
    {
      title: "名称",
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      valueType: 'foreignKeyType',
      fieldProps: {
        selectValue: Permission,
        many: true
      }
    },
    {
      title: '操作',
      valueType: 'option',
      dataIndex: 'option',
      render: (text, record, index, action) => [
        <Access accessible={access["auth.change_group"]}>
          <Button icon={<EditOutlined/>} type="primary" key={"update" + index} onClick={() => {
            setUpdateModelVisible(true);
            let updateRecord = getUpdateRecord(columns, record);
            setUserForm(updateRecord);
          }}/>
        </Access>,
        <Access accessible={access["auth.delete_group"]}>
          <Popconfirm
            title="您确定要删除吗"
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
        // <TableDropdown menus={menus}
        //                onSelect={key => {
        //
        //                }}
        // />,
      ]
    }
  ]
  const updateColumns = useMemo<ProColumns<GroupInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<GroupInterface, "boolType" | "foreignKeyType">(columns, requireColumns, foreignKeys);
  }, columns)
  const createColumns = useMemo<ProColumns<GroupInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<GroupInterface, "boolType" | "foreignKeyType">(columns, requireColumns, foreignKeys);
  }, columns);
  return (
    <>
      < ProTable<GroupInterface, Partial<GroupInterface>, "boolType" | "foreignKeyType">
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="用户组列表"
        request={queryGroup}
        search={{
          labelWidth: "auto"
        }}
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        }}
        tableAlertOptionRender={({selectedRows, onCleanSelected}) => {
          return (
            <Space>
              <Access accessible={access["auth.delete_group"]}>
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
            <Access accessible={access["auth.add_group"]}>
              <Button key="button" icon={<PlusOutlined/>} type="primary" onClick={() => setCreateModelVisible(true)}>
                新建
              </Button>
            </Access>
            ,
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
        <ProTable<GroupInterface, Partial<GroupInterface>, "boolType" | "foreignKeyType">
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
        <ProTable<GroupInterface, Partial<GroupInterface>, "boolType" | "foreignKeyType">
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
