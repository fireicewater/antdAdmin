import {LockTwoTone, UserOutlined} from '@ant-design/icons';
import {Button, Form, Input} from 'antd';
import React from 'react';
import styles from './style.less';
import {history, useModel} from 'umi';
import {AuthParam} from "@/services/auth";

const Login = () => {
  const [loginAccountForm] = Form.useForm();
  const {login} = useModel("user", model => ({login: model.login}))

  return (
    <div className={styles.main}>
      <Form form={loginAccountForm} onFinish={async (params: AuthParam) => {
        await login(params);
        history.push("/index")
      }}>
        <Form.Item
          style={{marginBottom: 24}}
          name="userName"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        >
          <Input size="large" placeholder='请输 入用户名' prefix={<UserOutlined
            style={{
              color: '#1890ff',
            }}
            className={styles.prefixIcon}
          />}/>
        </Form.Item>
        <Form.Item
          style={{marginBottom: 24}}
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        >
          <Input.Password size="large" placeholder='请输入密码'
                          prefix={<LockTwoTone className={styles.prefixIcon}/>}/>
        </Form.Item>
        <Form.Item>
          <Button size="large" type="primary" className={styles.submit} htmlType="submit">登录</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
