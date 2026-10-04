import { Alert, Button, Skeleton } from 'antd';
export default function DataState({ error, retry }: { error?: string; retry: () => void }) {
  if (error)
    return (
      <Alert
        type="error"
        showIcon
        title={error}
        role="alert"
        action={<Button onClick={retry}>تلاش دوباره</Button>}
      />
    );
  return <Skeleton active paragraph={{ rows: 6 }} />;
}
