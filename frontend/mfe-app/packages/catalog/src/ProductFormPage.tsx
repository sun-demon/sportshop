import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProductMutation, useGetProductQuery, useUpdateProductMutation } from '@sportshop/mfe-store';

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: existing } = useGetProductQuery(Number(id), { skip: !isEdit });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description ?? '');
      setPrice(String(existing.price));
      setStock(String(existing.stock));
      setCategory(existing.category);
      setImageUrl(existing.imageUrl ?? '');
    }
  }, [existing]);

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
    try {
      if (isEdit) {
        await updateProduct({ id: Number(id), data }).unwrap();
        navigate(`/products/${id}`);
      } else {
        const p = await createProduct(data).unwrap();
        navigate(`/products/${p.id}`);
      }
    } catch (err: unknown) {
      setError((err as { data?: { message?: string } })?.data?.message ?? 'Ошибка сохранения');
    }
  }

  return (
    <div className="container">
      <div className="form-page">
        <h1>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название *</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Цена (₽) *</label>
              <input className="form-control" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Остаток</label>
              <input className="form-control" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Категория *</label>
            <input className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>URL изображения</label>
            <input className="form-control" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating || updating}>
              {creating || updating ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
