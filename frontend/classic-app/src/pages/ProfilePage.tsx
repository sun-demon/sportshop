import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyOrders } from '../services/api';
import type { IOrder } from '@sportshop/shared-types';

export default function ProfilePage() {
  const { user, updateProfile, sendFeedback } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyOrders()
      .then(({ data }) => {
        if (!cancelled) setOrders(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return <div className="loading container">Загрузка профиля…</div>;

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const STATUS_LABELS: Record<IOrder['status'], string> = {
    pending: 'Ожидает',
    paid: 'Оплачен',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
      });
      setName('');
      setEmail('');
      setPassword('');
      setProfileMessage('Профиль обновлён');
    } catch (err) {
      const eResp = err as { response?: { data?: { message?: string } } };
      setProfileMessage(eResp.response?.data?.message ?? 'Не удалось обновить профиль');
    }
  }

  async function handleFeedbackSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedbackMessage(null);
    try {
      await sendFeedback({ subject: subject.trim(), message: message.trim() });
      setSubject('');
      setMessage('');
      setFeedbackMessage('Сообщение отправлено разработчику');
    } catch (err) {
      const eResp = err as { response?: { data?: { message?: string } } };
      setFeedbackMessage(eResp.response?.data?.message ?? 'Не удалось отправить сообщение');
    }
  }

  return (
    <div className="container">
      <h1>Профиль</h1>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">{(user.name ?? user.email)[0].toUpperCase()}</div>
          <div className="profile-details">
            <h2>{user.name ?? '—'}</h2>
            <p className="profile-email">{user.email}</p>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <p className="profile-since">Клиент с {new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Заказов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalSpent.toLocaleString('ru-RU')} ₽</div>
            <div className="stat-label">Потрачено</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{deliveredCount}</div>
            <div className="stat-label">Доставлено</div>
          </div>
        </div>
        <div className="profile-section">
          <h3>Редактирование профиля</h3>
          {profileMessage && <div className="alert alert-info">{profileMessage}</div>}
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="profile-name">Имя</label>
              <input id="profile-name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-password">Новый пароль</label>
              <input id="profile-password" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Сохранить</button>
          </form>
        </div>
        <div className="profile-section">
          <h3>Обратная связь разработчику</h3>
          {feedbackMessage && <div className="alert alert-info">{feedbackMessage}</div>}
          <form onSubmit={handleFeedbackSubmit}>
            <div className="form-group">
              <label htmlFor="feedback-subject">Тема</label>
              <input id="feedback-subject" className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="feedback-message">Сообщение</label>
              <textarea id="feedback-message" className="form-control" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
            </div>
            <button className="btn btn-outline" type="submit">Отправить</button>
          </form>
        </div>
        <div className="profile-section">
          <h3>Последние заказы</h3>
          {loading ? (
            <div className="loading">Загрузка…</div>
          ) : orders.length === 0 ? (
            <p>Заказов нет</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="order-card order-card-compact">
                  <div className="order-header">
                    <span className="order-id">Заказ #{order.id}</span>
                    <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div className="order-footer">
                    <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    <strong>{order.total.toLocaleString('ru-RU')} ₽</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
