import { Tag } from 'antd';
import { orderStatusLabels } from '@behjati/shared';
import type { OrderStatus as Status } from '../generated/graphql';
const colors = {
  CREATED: 'default',
  PENDING_PAYMENT: 'gold',
  PROCESSING: 'blue',
  SHIPPED: 'cyan',
  DELIVERED: 'green',
  CANCELED: 'red',
};
export default function OrderStatus({ status }: { status: Status }) {
  return <Tag color={colors[status]}>{orderStatusLabels[status]}</Tag>;
}
