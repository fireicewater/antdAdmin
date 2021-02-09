import React, {FC, useMemo, useRef, useState} from 'react';
import type {FormInstance} from 'antd';
import {Button, message, Modal, Popconfirm, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  addPermission,
  PermissionInterface,
  queryContentType,
  queryPermission,
  removePermission,
  updatePermission
} from "./service"
import {useRequest,} from "umi"
import {getFormColumns, getUpdateRecord} from "@/utils"


const requireColumns: string[] = [
  "name",
  "code",
  "content_type"
]

const foreignKeys: string[] = ["content_type"]

const table: FC<void> = () => {
  const actionRef = useRef<ActionType>();
  const [createModelVisible, setCreateModelVisible] = useState<boolean>(false);
  const [updateModelVisible, setUpdateModelVisible] = useState<boolean>(false);
  const updateForm = useRef<FormInstance>();
  const createFrom = useRef<FormInstance>();
  const [userForm, setUserForm] = useState<Partial<PermissionInterface>>({});
  const {loading: updateLoading, run: runUpdate} = useRequest(updatePermission, {manual: true});
  const {loading: createLoading, run: runCreate} = useRequest(addPermission, {manual: true});
  const {loading: removeLoading, run: runRemove} = useRequest(removePermission, {manual: true});

  const handleUpdate: (params: Partial<PermissionInterface>) => void = async (params) => {
    await runUpdate(params, userForm.id as number);
    message.success("修改成功");
    setUpdateModelVisible(false);
    setUserForm({});
    actionRef.current?.reload();
  }
  const handleCreate: (params: Partial<PermissionInterface>) => void = async (params) => {
    await runCreate(params);
    message.success("新增成功");
    setCreateModelVisible(false);
    actionRef.current?.reload();
  }
  const handleRemove: (params: PermissionInterface[]) => void = async (params) => {
    await runRemove(params.map(x => x.id));
    message.success("删除成功");
  }

  //处理外键相关
  const {loading: ContentTypeLoading, data: ContentType} = useRequest(() => queryContentType({all: 1}))

  const columns: ProColumns<PermissionInterface, "boolType" | "foreignKeyType">[] = [
    {
      title: "id",
      dataIndex: 'id',
      valueType: 'indexBorder',
    },
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "code",
      dataIndex: "codename",
    },
    {
      title: 'content_type',
      dataIndex: 'content_type',
      valueType: 'foreignKeyType',
      fieldProps: {
        selectValue: ContentType,
        many: true
      }
    },
    {
      title: '操作',
      valueType: 'option',
      dataIndex: 'option',
      render: (text, record, index, action) => [
        <Button icon={<EditOutlined/>} type="primary" key={"update" + index} onClick={() => {
          setUpdateModelVisible(true);
          let updateRecord = getUpdateRecord(columns, record);
          setUserForm(updateRecord);
        }}/>,
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
        ,
        // <TableDropdown menus={menus}
        //                onSelect={key => {
        //
        //                }}
        // />,
      ]
    }
  ]

  const updateColumns = useMemo<ProColumns<PermissionInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<PermissionInterface, "boolType" | "foreignKeyType">(columns, requireColumns, foreignKeys);
    //删除password
  }, columns)
  const createColumns = useMemo<ProColumns<PermissionInterface, "boolType" | "foreignKeyType">[]>(() => {
    return getFormColumns<PermissionInterface, "boolType" | "foreignKeyType">(columns, requireColumns, foreignKeys);
  }, columns);

  return (
    <>
      < ProTable<PermissionInterface, Partial<PermissionInterface>, "boolType" | "foreignKeyType">
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        headerTitle="用户列表"
        request={queryPermission}
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
        width={600}
      >
        <ProTable<PermissionInterface, Partial<PermissionInterface>, "boolType" | "foreignKeyType">
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
        <ProTable<PermissionInterface, Partial<PermissionInterface>, "boolType" | "foreignKeyType">
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
