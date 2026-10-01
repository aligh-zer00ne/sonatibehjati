import { ConfigProvider, Layout, Typography, Alert, Card } from 'antd';
export default function App() {
  return (
    <ConfigProvider direction="rtl">
      <Layout style={{ minHeight: '100vh', padding: 32 }}>
        <Typography.Title level={2}>مدیریت حلواارده سنتی بهجتی اردکان</Typography.Title>
        <Card>
          <Alert
            type="info"
            showIcon
            title="زیرساخت پنل مدیریت آماده است"
            description="احراز هویت و صفحات مدیریت در فاز ۸ پیاده‌سازی می‌شوند. این برنامه هیچ دسترسی مدیریتی عمومی ارائه نمی‌دهد."
          />
        </Card>
      </Layout>
    </ConfigProvider>
  );
}
