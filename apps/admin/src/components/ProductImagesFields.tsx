import { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, App } from 'antd';
import { uploadAdminImage } from '../lib/client';
import AdminIcon from './AdminIcon';
export default function ProductImagesFields({
  disabled = false,
  onUploadingChange,
  onImagesChange,
}: {
  disabled?: boolean;
  onUploadingChange?: (value: boolean) => void;
  onImagesChange?: () => void;
}) {
  const form = Form.useFormInstance();
  const images = Form.useWatch('images', form) as Array<{ url: string; alt: string }> | undefined;
  const [uploading, setUploading] = useState<number | null>(null);
  const busy = useRef(false);
  const alive = useRef(true);
  const { message } = App.useApp();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return (
    <Form.List name="images">
      {(fields, { add, remove }) => (
        <div className="space-y-4">
          <p className="text-sm font-bold">تصاویر محصول (۱ تا ۸ تصویر)</p>
          <p className="text-xs text-[#7d746a]">
            JPG، PNG یا WebP، حداکثر ۸ مگابایت برای هر تصویر. تصویر اول، تصویر اصلی محصول است.
          </p>
          {fields.map(({ key, name, ...rest }) => (
            <div
              key={key}
              className="grid gap-4 rounded-lg border border-[#e8ded1] p-4 sm:grid-cols-[112px_minmax(0,1fr)]"
            >
              <div className="grid size-28 place-items-center overflow-hidden rounded-lg bg-[#f4eadb]">
                {images?.[name]?.url ? (
                  <img
                    src={images[name].url}
                    alt={images[name].alt || 'پیش‌نمایش تصویر محصول'}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <AdminIcon name="products" width={32} height={32} className="text-[#af8a57]" />
                )}
              </div>
              <div className="min-w-0">
                <Form.Item
                  {...rest}
                  name={[name, 'url']}
                  hidden
                  rules={[{ required: true, message: 'یک تصویر آپلود کنید.' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  {...rest}
                  name={[name, 'alt']}
                  label="توضیح تصویر"
                  rules={[{ required: true, message: 'توضیح تصویر لازم است.' }]}
                >
                  <Input maxLength={150} />
                </Form.Item>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`relative inline-flex min-h-11 items-center rounded-lg border border-[#b08662] px-4 text-sm text-[#810c20] ${disabled || uploading !== null ? 'opacity-50' : 'cursor-pointer hover:bg-[#fbefdc]'}`}
                  >
                    {uploading === name
                      ? 'در حال آپلود…'
                      : images?.[name]?.url
                        ? 'آپلود تصویر جایگزین'
                        : 'آپلود تصویر'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label={`آپلود تصویر ${name + 1}`}
                      disabled={disabled || uploading !== null}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={async (event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = '';
                        if (!file || busy.current) return;
                        busy.current = true;
                        setUploading(name);
                        onUploadingChange?.(true);
                        try {
                          const url = await uploadAdminImage(file);
                          if (!alive.current) return;
                          form.setFieldValue(['images', name, 'url'], url);
                          if (!form.getFieldValue(['images', name, 'alt']))
                            form.setFieldValue(
                              ['images', name, 'alt'],
                              form.getFieldValue('title') || 'تصویر محصول',
                            );
                          onImagesChange?.();
                          void message.success(
                            'تصویر آپلود شد. برای ثبت در محصول، ذخیره محصول را بزنید.',
                          );
                        } catch (error) {
                          if (alive.current)
                            void message.error(
                              error instanceof Error ? error.message : 'آپلود انجام نشد.',
                            );
                        } finally {
                          busy.current = false;
                          if (alive.current) {
                            setUploading(null);
                            onUploadingChange?.(false);
                          }
                        }
                      }}
                    />
                  </label>
                  <Button
                    danger
                    disabled={disabled || uploading !== null || fields.length <= 1}
                    onClick={() => {
                      remove(name);
                      onImagesChange?.();
                    }}
                  >
                    حذف تصویر
                  </Button>
                  {name > 0 && (
                    <Button
                      disabled={disabled || uploading !== null}
                      onClick={() => {
                        const current = [...form.getFieldValue('images')];
                        const [primary] = current.splice(name, 1);
                        current.unshift(primary);
                        form.setFieldValue('images', current);
                        onImagesChange?.();
                      }}
                    >
                      انتخاب تصویر اصلی
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button
            disabled={disabled || uploading !== null || fields.length >= 8}
            onClick={() => {
              add({ url: '', alt: '' });
              onImagesChange?.();
            }}
          >
            افزودن تصویر
          </Button>
        </div>
      )}
    </Form.List>
  );
}
