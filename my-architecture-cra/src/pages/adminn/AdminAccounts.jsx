// my-architecture-cra/src/pages/adminn/AdminAccounts.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import MyButton from '../../components/UI/MyButton/MyButton';
import Icons from '../../components/UI/Icons/Icons.jsx'; // ✅ Добавить импорт иконок
import UserEditModal from './components/UserEditModal';
import CreateClientModal from './components/CreateClientModal';
import SecureDataModal from './components/SecureDataModal';
import FillSecureDataModal from './components/FillSecureDataModal';
import { useModal } from '../../hooks/useModal';
import './AdminAccounts.css';

const AdminAccounts = () => {
    const { showAlert, AlertModalComponent } = useModal();
    
    const [showFillModal, setShowFillModal] = useState(false);
    const [selectedFillAccount, setSelectedFillAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSecureModal, setShowSecureModal] = useState(false);
    const [selectedSecureAccount, setSelectedSecureAccount] = useState(null);

    const handleViewSecureData = (account) => {
        setSelectedSecureAccount(account);
        setShowSecureModal(true);
    };

    const handleFillSecureData = (account) => {
        console.log('🟢 handleFillSecureData вызван для:', account);
        setSelectedFillAccount(account);
        setShowFillModal(true);
    };

    const loadSecureData = async () => {
        if (!selectedSecureAccount) return;

        if (selectedSecureAccount.profile?.type === 'team') {
            return await adminAPI.getTeamSecureData(
                selectedSecureAccount.profile.id,
                selectedSecureAccount.profile.name
            );
        } else if (selectedSecureAccount.profile?.type === 'client') {
            const clientName = `${selectedSecureAccount.profile.lastName || ''} ${selectedSecureAccount.profile.firstName || ''}`.trim();
            return await adminAPI.getClientSecureData(
                selectedSecureAccount.profile.id,
                clientName
            );
        }
        return { success: false, error: 'Неизвестный тип профиля' };
    };

    useEffect(() => {
        loadAccounts();
    }, [filterType, searchTerm]);

    const loadAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            const filters = {};
            if (filterType !== 'all') filters.type = filterType;
            if (searchTerm) filters.search = searchTerm;

            const response = await adminAPI.getAccounts(filters);

            if (response && response.success === true) {
                setAccounts(response.accounts || []);
            } else {
                setError(response?.error || 'Ошибка загрузки данных');
                setAccounts([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            setError(error.message || 'Ошибка соединения с сервером');
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setShowEditModal(true);
    };

    const handleSaveAccount = async (accountId, accountData, profileData) => {
        try {
            await adminAPI.updateAccount(accountId, accountData);

            if (selectedAccount.profile.type === 'client' && profileData) {
                await adminAPI.updateClient(selectedAccount.profile.id, profileData);
            } else if (selectedAccount.profile.type === 'team' && profileData) {
                await adminAPI.updateTeam(selectedAccount.profile.id, profileData);
            }

            await loadAccounts();
            setShowEditModal(false);
            setSelectedAccount(null);
            showAlert('Данные успешно обновлены');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            showAlert('Ошибка при сохранении');
        }
    };

    const getTypeBadge = (account) => {
        if (account.profile?.type === 'client') {
            return <span className="badge client"><Icons.User size={14} /> Клиент</span>;
        }
        if (account.profile?.type === 'team') {
            return <span className="badge team"><Icons.Users size={14} /> Сотрудник</span>;
        }
        return <span className="badge user"><Icons.User size={14} /> Пользователь</span>;
    };

    const getClientFullName = (profile) => {
        const parts = [];
        if (profile.lastName) parts.push(profile.lastName);
        if (profile.firstName) parts.push(profile.firstName);
        if (profile.patronymic) parts.push(profile.patronymic);
        return parts.length > 0 ? parts.join(' ') : null;
    };

    const getDisplayName = (account) => {
        if (account.profile?.type === 'client') {
            const fullName = getClientFullName(account.profile);
            if (fullName) return fullName;
            if (account.profile.companyName) return account.profile.companyName;
            return account.email;
        }
        if (account.profile?.type === 'team') {
            return account.profile.name || account.email;
        }
        return account.email;
    };

    const getRoleName = (role) => {
        if (!role) return '—';
        switch (role.name) {
            case 'admin': return 'Администратор';
            case 'manager': return 'Менеджер';
            case 'architect': return 'Архитектор';
            default: return 'Пользователь';
        }
    };

    const counts = {
        all: accounts.length,
        client: accounts.filter(a => a.profile?.type === 'client').length,
        team: accounts.filter(a => a.profile?.type === 'team').length,
        user: accounts.filter(a => a.profile?.type === 'user').length,
    };

    if (error) {
        return (
            <div className="admin-accounts">
                <div className="error-message">
                    <Icons.Info size={24} color="#dc2626" />
                    <h3>Ошибка загрузки</h3>
                    <p>{error}</p>
                    <button onClick={() => loadAccounts()}>Повторить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-accounts">
            <div className="accounts-header">
                <h1><Icons.Users size={28} style={{ marginRight: '12px' }} /> Управление аккаунтами</h1>
                <MyButton variant="primary" onClick={() => setShowCreateModal(true)}>
                    <Icons.Plus size={18} style={{ marginRight: '8px' }} /> Создать клиента
                </MyButton>
            </div>

            <div className="filters-bar">
                <div className="filter-buttons">
                    <button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>
                        Все ({counts.all})
                    </button>
                    <button className={filterType === 'client' ? 'active' : ''} onClick={() => setFilterType('client')}>
                        <Icons.User size={14} /> Клиенты ({counts.client})
                    </button>
                    <button className={filterType === 'team' ? 'active' : ''} onClick={() => setFilterType('team')}>
                        <Icons.Users size={14} /> Сотрудники ({counts.team})
                    </button>
                    <button className={filterType === 'user' ? 'active' : ''} onClick={() => setFilterType('user')}>
                        <Icons.User size={14} /> Пользователи ({counts.user})
                    </button>
                </div>

                <div className="search-box">
                    <Icons.Search size={18} color="#999" />
                    <input
                        type="text"
                        placeholder="Поиск по email, имени, компании..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Загрузка...</div>
            ) : (
                <div className="accounts-table-wrapper">
                    <table className="accounts-table">
                        <thead>
                            <tr>
                                <th>Тип</th>
                                <th>Имя / Компания</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => (
                                <tr key={account.id}>
                                    <td>{getTypeBadge(account)}</td>
                                    <td className="name-cell">
                                        <div className="main-name">
                                            <strong>{getDisplayName(account)}</strong>
                                        </div>
                                        {account.profile?.type === 'client' && account.profile.companyName && (
                                            <div className="company-name">
                                                <Icons.Building size={12} /> {account.profile.companyName}
                                            </div>
                                        )}
                                        {account.profile?.type === 'team' && account.profile.position && (
                                            <div className="position-name">
                                                <Icons.Briefcase size={12} /> {account.profile.position}
                                            </div>
                                        )}
                                        {account.profile?.type === 'team' && account.profile.specialization && (
                                            <div className="specialization-name">
                                                🎯 {account.profile.specialization}
                                            </div>
                                        )}
                                        {account.profile?.type === 'team' && account.profile.bio && (
                                            <div className="bio-preview">
                                                <Icons.MessageIcon size={12} /> {account.profile.bio.length > 60
                                                    ? account.profile.bio.substring(0, 60) + '...'
                                                    : account.profile.bio}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <Icons.Email size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        {account.email}
                                    </td>
                                    <td className="phone-cell">
                                        {account.profile?.phone ? (
                                            <span className="phone-number">
                                                <Icons.Phone size={14} style={{ marginRight: '6px' }} /> {account.profile.phone}
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`role-badge ${account.role?.name}`}>
                                            {getRoleName(account.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="status-badges">
                                            <span className={`status ${account.isActive ? 'active' : 'inactive'}`}>
                                                {account.isActive ? '✅ Активен' : '❌ Заблокирован'}
                                            </span>
                                            {!account.isEmailVerified && (
                                                <span className="status unverified">
                                                    <Icons.Email size={12} /> Не подтверждён
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="secure-btn"
                                                onClick={() => handleViewSecureData(account)}
                                                title="Просмотреть личные данные"
                                            >
                                                <Icons.Lock size={14} /> Личные данные
                                            </button>
                                           
                                            <button
                                                className="secure-fill-btn"
                                                onClick={() => handleFillSecureData(account)}
                                                title="Заполнить конфиденциальные данные"
                                            >
                                                <Icons.Edit size={14} /> Заполнить данные
                                            </button>
                                             <button className="edit-btn" onClick={() => handleEdit(account)}>
                                                <Icons.Edit size={14} /> Редактировать аккаунт
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {accounts.length === 0 && !loading && (
                        <div className="no-results">
                            <Icons.Users size={48} color="#ccc" />
                            <p>Ничего не найдено</p>
                        </div>
                    )}
                </div>
            )}

            {showEditModal && selectedAccount && (
                <UserEditModal
                    account={selectedAccount}
                    onSave={handleSaveAccount}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedAccount(null);
                    }}
                />
            )}

            {showCreateModal && (
                <CreateClientModal
                    onSave={async (data) => {
                        try {
                            await adminAPI.createClient(data);
                            await loadAccounts();
                            setShowCreateModal(false);
                            showAlert('Клиент успешно создан');
                        } catch (error) {
                            console.error('Ошибка создания:', error);
                            showAlert('Ошибка при создании клиента');
                        }
                    }}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {showSecureModal && selectedSecureAccount && (
                <SecureDataModal
                    isOpen={showSecureModal}
                    onClose={() => {
                        setShowSecureModal(false);
                        setSelectedSecureAccount(null);
                    }}
                    account={selectedSecureAccount}
                    onLoadData={loadSecureData}
                />
            )}

            {showFillModal && selectedFillAccount && (
    <FillSecureDataModal
        isOpen={showFillModal}
        onClose={() => {
            setShowFillModal(false);
            setSelectedFillAccount(null);
        }}
        account={selectedFillAccount}
        onSave={async (id, data, hasExistingData) => {  // ✅ добавить hasExistingData
            try {
                if (selectedFillAccount.profile?.type === 'team') {
                    if (hasExistingData) {
                        // ✅ Обновление существующих данных
                        await adminAPI.updateTeamSecureData(id, data);
                    } else {
                        // ✅ Создание новых данных
                        await adminAPI.createTeamSecureData(id, data);
                    }
                } else {
                    if (hasExistingData) {
                        // ✅ Обновление существующих данных
                        await adminAPI.updateClientSecureData(id, data);
                    } else {
                        // ✅ Создание новых данных
                        await adminAPI.createClientSecureData(id, data);
                    }
                }
                showAlert('Данные успешно сохранены!');
                await loadAccounts();
            } catch (error) {
                console.error('Ошибка сохранения:', error);
                showAlert('Ошибка при сохранении данных: ' + error.message);
                throw error;
            }
        }}
    />
)}

            <AlertModalComponent />
        </div>
    );
};

export default AdminAccounts;