import { useRef } from 'react';
import { App, Modal } from 'antd';
import {
  AdminProductDocument,
  AdminProductsDocument,
  type AdminProductFieldsFragment,
} from '../generated/graphql';
import { useAdminQuery } from '../hooks/useAdminQuery';
import ProductEditor, { type ProductEditorHandle } from './ProductEditor';
import AdminIcon from './AdminIcon';
import DataState from './DataState';

/** Every dismissal uses the editor's draft and in-flight upload/save guards. */
export default function ProductEditorDialog({
  editorKey,
  onClose,
  onSaved,
}: {
  editorKey: string;
  onClose: () => void;
  onSaved: (product: AdminProductFieldsFragment) => void;
}) {
  const creating = editorKey === 'new';
  const existing = useAdminQuery(AdminProductDocument, { id: editorKey }, !creating);
  const catalogue = useAdminQuery(
    AdminProductsDocument,
    { input: { page: 1, pageSize: 1 } },
    creating,
  );
  const query = creating ? catalogue : existing;
  const product = existing.data?.adminProduct ?? null;
  const categories = existing.data?.categories ?? catalogue.data?.categories;
  const editor = useRef<ProductEditorHandle>(null);
  const { message } = App.useApp();
  return (
    <Modal
      open
      title={
        <div className="flex min-w-0 items-center gap-3 pe-10">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#edc57d]/50 bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c]">
            <AdminIcon name={creating ? 'plus' : 'edit'} width={26} />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-[#fff5e1]">
              {creating ? 'محصول جدید' : 'ویرایش محصول'}
            </h2>
            <p aria-hidden="true" className="mt-1 truncate text-sm font-medium text-[#f2d6a2]">
              {product?.title ?? 'مشخصات، قیمت و تصویر کالا'}
            </p>
          </div>
        </div>
      }
      onCancel={() => (editor.current ? editor.current.requestClose() : onClose())}
      footer={null}
      width="min(900px, calc(100vw - 24px))"
      style={{ top: 'max(12px, 5dvh)', paddingBottom: 12 }}
      styles={{
        container: { padding: 0, overflow: 'hidden', borderRadius: 24 },
        header: {
          margin: 0,
          padding: '18px 20px',
          background: 'linear-gradient(125deg,#701e2a,#300c14)',
        },
        body: {
          maxHeight: 'calc(90dvh - 100px)',
          overflowY: 'auto',
          padding: 20,
          scrollbarGutter: 'stable',
        },
      }}
      className="[&_.ant-modal-close]:!top-6 [&_.ant-modal-close]:!text-[#fff5e1] max-sm:[&_.ant-modal-body]:!p-3"
      destroyOnHidden
    >
      {categories && (creating || product) ? (
        <ProductEditor
          inDialog
          closeRef={editor}
          product={product}
          categories={categories}
          onCancel={onClose}
          onSaved={(saved) => {
            void message.success('محصول ذخیره شد.');
            onSaved(saved);
          }}
        />
      ) : (
        <DataState
          error={
            query.error ||
            (!creating && existing.data && !product
              ? 'محصول پیدا نشد؛ به فهرست محصولات برگردید.'
              : '')
          }
          retry={query.refresh}
        />
      )}
    </Modal>
  );
}
