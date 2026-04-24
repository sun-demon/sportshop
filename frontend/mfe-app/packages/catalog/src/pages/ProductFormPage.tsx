import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { productStore } from '../stores/ProductStore';

const ProductFormPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState('');
  const [stock, setStock]             = useState('');
  const [category, setCategory]       = useState('');
  const [imageUrl, setImageUrl]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      productStore.fetchProduct(Number(id)).then(() => {
        const p = productStore.selectedProduct;
        if (p) {
          setName(p.name);
          setDescription(p.description ?? '');
          setPrice(String(p.price));
          setStock(String(p.stock));
          setCategory(p.category);
          setImageUrl(p.imageUrl ?? '');
        }
      });
    }
  }, [id, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = {
      name,
      description: description || null,
      price: Number(price),
      stock: Number(stock),
      category,
      imageUrl: imageUrl || null,
    };
    try {
      if (isEdit && id) {
        await productStore.updateProduct(Number(id), data);
        navigate(`/catalog/${id}`);
      } else {
        const created = await productStore.createProduct(data);
        navigate(`/catalog/${created.id}`);
      }
    } catch {
      setError('Не удалось сохранить товар');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container form-page">
      <h1>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название *</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Цена (₽) *</label>
            <input type="number" min="0" step="0.01" className="form-control" value={price}
              onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Остаток *</label>
            <input type="number" min="0" className="form-control" value={stock}
              onChange={(e) => setStock(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label>Категория *</label>
          <input className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>URL изображения</label>
          <input className="form-control" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea className="form-control" rows={4} value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Отмена</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
});

export default ProductFormPage;
