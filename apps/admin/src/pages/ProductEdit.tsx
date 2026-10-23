import { useNavigate, useParams } from 'react-router-dom';
import Products from './Products';

/** Direct bookmarks open the same editor over the catalogue. */
export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <Products
      key={id ?? 'new'}
      initialEditorKey={id ?? 'new'}
      onEditorClose={() => navigate('/admin/products', { replace: true })}
    />
  );
}
