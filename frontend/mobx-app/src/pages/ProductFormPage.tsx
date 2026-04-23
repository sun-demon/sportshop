import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useProductStore } from '../stores/StoreContext';

const ProductFormPage = observer(() => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const products = useProductStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      products.fetchProduct(Number(id)).then(() => {
        const p = products.selectedProduct;
        if (p) { setName(p.name); setDescription(p.description ?? ''); setPrice(String(p.price)); setStock(String(p.stock)); setCategory(p.category); setImageUrl(p.imageUrl ?? ''); }
      });
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true);
    const data = { name, description: description || null, price: parseFloat(price), stock: parseInt(stock), category, imageUrl: imageUrl || null };
    try {
      if (isEdit) { await products.updateProduct(Number(id), data); navigate(`/products/${id}`); }
      else { const p = await products.createProduct(data); navigate(`/products/${p.id}`); }
    } catch { setError('Ошибка сохранения'); } finally { setSaving(false); }
  }

  return (
    <div className="container">
      <div className="form-page">
        <h1>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Название *</label><input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-group"><label>Описание</label><textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>Цена (₽) *</label><input className="form-control" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
            <div className="form-group"><label>Остаток</label><input className="form-control" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Категория *</label><input className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required /></div>
          <div className="form-group"><label>URL изображения</label><input className="form-control" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Отмена</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ProductFormPage;
