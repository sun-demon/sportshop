import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../services/api';

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    getProduct(Number(id))
      .then(({ data }) => {
        if (cancelled) return;
        setName(data.name);
        setDescription(data.description ?? '');
        setPrice(String(data.price));
        setStock(String(data.stock));
        setCategory(data.category);
        setImageUrl(data.imageUrl ?? '');
      })
      .catch(() => navigate('/products'))
      .finally(() => {
        if (!cancelled) setLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const data = {
      name,
      description: description || null,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      imageUrl: imageUrl || null,
    };
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateProduct(Number(id), data);
        navigate(`/products/${id}`);
      } else {
        const { data: created } = await createProduct(data);
        navigate(`/products/${created.id}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingExisting) return <div className="loading container">Загрузка…</div>;

  return (
    <div className="container">
      <div className="form-page">
        <h1>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pf-name">Название *</label>
            <input id="pf-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="pf-desc">Описание</label>
            <textarea id="pf-desc" className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pf-price">Цена (₽) *</label>
              <input id="pf-price" className="form-control" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="pf-stock">Остаток</label>
              <input id="pf-stock" className="form-control" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="pf-cat">Категория *</label>
            <input id="pf-cat" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="pf-img">URL изображения</label>
            <input id="pf-img" className="form-control" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
