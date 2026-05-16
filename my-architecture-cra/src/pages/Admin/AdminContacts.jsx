// src/pages/Admin/AdminContacts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminContacts.css';
import { useModal } from '../../hooks/useModal.js';
// Ваши компоненты
import Typography from '../../components/UI/Typography/Typography.jsx';
import MyButton from '../../components/UI/MyButton/MyButton.jsx';
import Icons from '../../components/UI/Icons/Icons.jsx';
import Loader from '../../components/UI/Loader/Loader.jsx';

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedContact, setSelectedContact] = useState(null);
    const navigate = useNavigate();
    const { showConfirm, showAlert, ConfirmModalComponent, AlertModalComponent } = useModal();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (!token) {
            navigate('/login');
            return;
        }

        if (userRole !== 'admin') {
            navigate('/');
            return;
        }

        loadContacts();
    }, []);

    const loadContacts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/contacts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            } else {
                console.error('Ошибка загрузки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/contacts/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                loadContacts();
            }
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    };

    const deleteContact = async (id) => {
        showConfirm('Вы уверены, что хотите удалить эту заявку?', async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/contacts/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    loadContacts();
                    showAlert('Заявка успешно удалена');
                } else {
                    showAlert('Ошибка при удалении заявки');
                }
            } catch (error) {
                showAlert('Произошла ошибка при удалении');
            }
        });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'new': return 'Новая';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Завершена';
            default: return status;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new': return <Icons.Clock size={16} color="#ffc107" />;
            case 'in_progress': return <Icons.Settings size={16} color="#17a2b8" />;
            case 'completed': return <Icons.Check size={16} color="#28a745" />;
            default: return <Icons.File size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#ffc107';
            case 'in_progress': return '#17a2b8';
            case 'completed': return '#28a745';
            default: return '#6c757d';
        }
    };

    const filteredContacts = filter === 'all'
        ? contacts
        : contacts.filter(c => c.status === filter);

    const stats = {
        total: contacts.length,
        new: contacts.filter(c => c.status === 'new').length,
        in_progress: contacts.filter(c => c.status === 'in_progress').length,
        completed: contacts.filter(c => c.status === 'completed').length
    };

    if (loading) {
        return (
            <div className="admin-contacts">
                <Loader type="spinner" size="large" text="Загрузка заявок..." />
            </div>
        );
    }

    return (
        <div className="admin-contacts">
            <div className="admin-header">
                <Typography variant="h1" color="dark">
                    <Icons.MessageIcon size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                    Заявки клиентов
                </Typography>

                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <Typography variant="small" color="default">Всего</Typography>
                    </div>
                    <div className="stat-card new">
                        <div className="stat-value">{stats.new}</div>
                        <Typography variant="small" color="default">
                            <Icons.Clock size={12} /> Новые
                        </Typography>
                    </div>
                    <div className="stat-card in-progress">
                        <div className="stat-value">{stats.in_progress}</div>
                        <Typography variant="small" color="default">
                            <Icons.Settings size={12} /> В работе
                        </Typography>
                    </div>
                    <div className="stat-card completed">
                        <div className="stat-value">{stats.completed}</div>
                        <Typography variant="small" color="default">
                            <Icons.Check size={12} /> Завершены
                        </Typography>
                    </div>
                </div>

                <div className="filter-buttons">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                        Все ({stats.total})
                    </button>
                    <button className={filter === 'new' ? 'active' : ''} onClick={() => setFilter('new')}>
                        <Icons.Clock size={14} /> Новые ({stats.new})
                    </button>
                    <button className={filter === 'in_progress' ? 'active' : ''} onClick={() => setFilter('in_progress')}>
                        <Icons.Settings size={14} /> В работе ({stats.in_progress})
                    </button>
                    <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
                        <Icons.Check size={14} /> Завершены ({stats.completed})
                    </button>
                </div>
            </div>

            <div className="contacts-table-container">
                <table className="contacts-table">
                    <thead>
                        <tr>
                            <th><Typography variant="small" weight="bold">Дата</Typography></th>
                            <th><Typography variant="small" weight="bold">Имя</Typography></th>
                            <th><Typography variant="small" weight="bold">Телефон</Typography></th>
                            <th><Typography variant="small" weight="bold">Email</Typography></th>
                            <th><Typography variant="small" weight="bold">Площадь</Typography></th>
                            <th><Typography variant="small" weight="bold">Тип проекта</Typography></th>
                            <th><Typography variant="small" weight="bold">Статус</Typography></th>
                            <th><Typography variant="small" weight="bold">Действия</Typography></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.map(contact => (
                            <tr key={contact.id}>
                                <td>
                                    <Typography variant="small" color="default">
                                        {new Date(contact.created_at).toLocaleDateString()}
                                    </Typography>
                                </td>
                                <td>
                                    <Typography variant="small" color="dark" weight="medium">
                                        {contact.name}
                                    </Typography>
                                </td>
                                <td>
                                    <Typography variant="small" color="default">
                                        <Icons.Phone size={12} style={{ marginRight: '4px' }} /> {contact.phone}
                                    </Typography>
                                </td>
                                <td>
                                    <Typography variant="small" color="default">
                                        <Icons.Email size={12} style={{ marginRight: '4px' }} /> {contact.email || '-'}
                                    </Typography>
                                </td>
                                <td>
                                    <Typography variant="small" color="default">
                                        {contact.area ? `${contact.area} м²` : '-'}
                                    </Typography>
                                </td>
                                <td>
                                    <Typography variant="small" color="default">
                                        {contact.project_type_id || '-'}
                                    </Typography>
                                </td>
                                <td>
                                    <select
                                        value={contact.status}
                                        onChange={(e) => updateStatus(contact.id, e.target.value)}
                                        style={{
                                            backgroundColor: getStatusColor(contact.status),
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '15px',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="new">
                                            <Icons.Clock size={12} /> Новая
                                        </option>
                                        <option value="in_progress">
                                            <Icons.Settings size={12} /> В работе
                                        </option>
                                        <option value="completed">
                                            <Icons.Check size={12} /> Завершена
                                        </option>
                                    </select>
                                 </td>
                                <td className="actions-cell">
                                    <button className="view-btn" onClick={() => setSelectedContact(contact)} title="Просмотреть">
                                        <Icons.Eye size={16} />
                                    </button>
                                    <button className="delete-btn" onClick={() => deleteContact(contact.id)} title="Удалить">
                                        <Icons.Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedContact && (
                <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
                    <div className="modal-details" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedContact(null)}>
                            <Icons.Close size={20} color="#666" />
                        </button>

                        <div className="modal-header">
                            <div className="modal-icon">
                                {getStatusIcon(selectedContact.status)}
                            </div>
                            <Typography variant="h3" color="dark" weight="bold">
                                Детали заявки
                            </Typography>
                            <div className="modal-status-badge" style={{ backgroundColor: getStatusColor(selectedContact.status) }}>
                                <Typography variant="small" color="white">
                                    {getStatusIcon(selectedContact.status)} {getStatusText(selectedContact.status)}
                                </Typography>
                            </div>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Icons.Calendar size={18} color="#3a5a6a" />
                                </div>
                                <div className="detail-content">
                                    <Typography variant="small" color="default">Дата создания</Typography>
                                    <Typography variant="body" color="dark" weight="medium">
                                        {new Date(selectedContact.created_at).toLocaleString()}
                                    </Typography>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Icons.User size={18} color="#3a5a6a" />
                                </div>
                                <div className="detail-content">
                                    <Typography variant="small" color="default">Имя</Typography>
                                    <Typography variant="body" color="dark" weight="medium">
                                        {selectedContact.name}
                                    </Typography>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Icons.Phone size={18} color="#3a5a6a" />
                                </div>
                                <div className="detail-content">
                                    <Typography variant="small" color="default">Телефон</Typography>
                                    <Typography variant="body" color="dark" weight="medium">
                                        {selectedContact.phone}
                                    </Typography>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Icons.Email size={18} color="#3a5a6a" />
                                </div>
                                <div className="detail-content">
                                    <Typography variant="small" color="default">Email</Typography>
                                    <Typography variant="body" color="dark" weight="medium">
                                        {selectedContact.email || '-'}
                                    </Typography>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Icons.Ruler size={18} color="#3a5a6a" />
                                </div>
                                <div className="detail-content">
                                    <Typography variant="small" color="default">Площадь</Typography>
                                    <Typography variant="body" color="dark" weight="medium">
                                        {selectedContact.area ? `${selectedContact.area} м²` : '-'}
                                    </Typography>
                                </div>
                            </div>

                            <div className="detail-item full-width">
                                <div className="detail-icon">
                                    <Icons.MessageIcon size={18} color="#3a5a6a" />
                                </div>
                                <div className="detail-content">
                                    <Typography variant="small" color="default">Сообщение</Typography>
                                    <div className="message-text">
                                        <Typography variant="body" color="default">
                                            {selectedContact.message || 'Нет сообщения'}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {selectedContact.service_names && selectedContact.service_names.length > 0 && (
                                <div className="detail-item full-width">
                                    <div className="detail-icon">
                                        <Icons.Briefcase size={18} color="#3a5a6a" />
                                    </div>
                                    <div className="detail-content">
                                        <Typography variant="small" color="default">Выбранные услуги</Typography>
                                        <div className="services-list">
                                            {selectedContact.service_names.map((serviceName, index) => (
                                                <span key={index} className="service-tag">
                                                    <Typography variant="small" color="primary">
                                                        {serviceName}
                                                    </Typography>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <MyButton variant="secondary" onClick={() => setSelectedContact(null)}>
                                Закрыть
                            </MyButton>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModalComponent />
            <AlertModalComponent />
        </div>
    );
};

export default AdminContacts;