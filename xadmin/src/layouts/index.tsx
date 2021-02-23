import React, {FC} from 'react';
import {PageHeaderWrapper} from '@ant-design/pro-layout';

const layout: FC<void> = (props) => {
  return <PageHeaderWrapper title={false}>{props.children}</PageHeaderWrapper>;
}

export default layout;
