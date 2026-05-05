import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import {
  setCredentials,
  selectCurrentUser,
  selectIsAuthenticated,
  useAppDispatch,
  useAppSelector,
  useGetMeQuery,
  useGetMyOrdersQuery,
  useSendFeedbackMutation,
  useUpdateMeMutation,
} from '@sportshop/mfe-store';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userFromStore = useAppSelector(selectCurrentUser);
  const {
    data: userFromApi,
    isLoading: meLoading,
    isError: meError,
    refetch: refetchMe,
  } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, { skip: !isAuthenticated });
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [sendFeedback, { isLoading: isSendingFeedback }] = useSendFeedbackMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const user = userFromApi ?? userFromStore;

  if (meLoading && !user) return <div className="loading container">Загрузка профиля…</div>;
  if (meError && !user) {
    return (
      <div className="container">
        <div className="alert alert-error">Не удалось загрузить профиль. Войдите снова или повторите запрос.</div>
        <p>
          <button type="button" className="btn btn-outline" onClick={() => void refetchMe()}>
            Повторить
          </button>{' '}
          <Link to="/login" className="btn btn-primary">
            На страницу входа
          </Link>
        </p>
      </div>
    );
  }
  if (!user) return <div className="loading container">Загрузка профиля…</div>;

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const result = await updateMe({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
      }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token, refreshToken: result.refreshToken }));
      setName('');
      setEmail('');
      setPassword('');
      setProfileMessage('Профиль обновлён');
    } catch (err) {
      const eResp = err as { data?: { message?: string } };
      setProfileMessage(eResp.data?.message ?? 'Не удалось обновить профиль');
    }
  }

  async function handleFeedbackSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedbackMessage(null);
    try {
      await sendFeedback({ subject: subject.trim(), message: message.trim() }).unwrap();
      setSubject('');
      setMessage('');
      setFeedbackMessage('Сообщение отправлено разработчику');
    } catch (err) {
      const eResp = err as { data?: { message?: string } };
      setFeedbackMessage(eResp.data?.message ?? 'Не удалось отправить сообщение');
    }
  }

  return (
    <div className="container">
      <h1>Профиль</h1>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">
            {(user.name ?? user.email ?? '?').slice(0, 1).toUpperCase()}
          </div>
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
            <button className="btn btn-primary" type="submit" disabled={isUpdating}>Сохранить</button>
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
            <button className="btn btn-outline" type="submit" disabled={isSendingFeedback}>Отправить</button>
          </form>
        </div>
        <div className="profile-section">
          <h3>Последние заказы</h3>
          {isLoading ? (
            <div className="loading">Загрузка…</div>
          ) : orders.length === 0 ? (
            <p>Заказов нет</p>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="order-card order-card-compact">
                  <div className="order-header">
                    <span className="order-id">Заказ #{order.id}</span>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
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
