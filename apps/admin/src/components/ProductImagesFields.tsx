import { Form, Input, Button, Space } from 'antd';
export default function ProductImagesFields() {
  return (
    <Form.List name="images">
      {(fields, { add, remove }) => (
        <div className="space-y-3">
          <p className="text-sm font-bold">تصاویر محصول (۱ تا ۸ تصویر)</p>
          {fields.map(({ key, name, ...rest }) => (
            <div key={key} className="rounded-lg border border-slate-200 p-3">
              <Space wrap align="start">
                <Form.Item
                  {...rest}
                  name={[name, 'url']}
                  label="مسیر یا URL تصویر"
                  rules={[{ required: true, message: 'نشانی تصویر لازم است.' }]}
                >
                  <Input dir="ltr" placeholder="/images/halva.webp یا https://…" maxLength={1000} />
                </Form.Item>
                <Form.Item
                  {...rest}
                  name={[name, 'alt']}
                  label="توضیح تصویر"
                  rules={[{ required: true, message: 'توضیح تصویر لازم است.' }]}
                >
                  <Input maxLength={150} />
                </Form.Item>
                <Button danger disabled={fields.length <= 1} onClick={() => remove(name)}>
                  حذف تصویر
                </Button>
              </Space>
            </div>
          ))}
          <Button disabled={fields.length >= 8} onClick={() => add({ url: '', alt: '' })}>
            افزودن تصویر
          </Button>
        </div>
      )}
    </Form.List>
  );
}
