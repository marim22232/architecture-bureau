// my-architecture-cra/src/pages/adminn/components/SecureDataModal.jsx
import React, { useState, useEffect } from 'react';
import MyButton from '../../../components/UI/MyButton/MyButton';
import Typography from '../../../components/UI/Typography/Typography';
import Icons from '../../../components/UI/Icons/Icons';
import './SecureDataModal.css';

const SecureDataModal = ({ isOpen, onClose, account, onLoadData }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && account) {
            loadSecureData();
        }
    }, [isOpen, account]);

    const loadSecureData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await onLoadData();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Ошибка загрузки данных');
            }
        } catch (err) {
            setError(err.message || 'Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isTeam = account.profile?.type === 'team';
    const title = isTeam ? '👨‍💼 Личные данные сотрудника' : '👤 Личные данные клиента';
    const name = isTeam ? account.profile.name : 
        `${account.profile.lastName || ''} ${account.profile.firstName || ''} ${account.profile.patronymic || ''}`.trim();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content secure-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <Typography variant="h3" weight="bold">
                        {title}
                    </Typography>
                    <button className="close-btn" onClick={onClose}>
                        <Icons.Close size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="secure-data-header">
                        <Typography variant="h4" weight="semibold">
                            {name || account.email}
                        </Typography>
                        <Typography variant="small" color="secondary">
                            {account.email}
                        </Typography>
                    </div>

                    {loading && <div className="loading-spinner">Загрузка конфиденциальных данных...</div>}

                    {error && (
                        <div className="error-message">
                            <Typography variant="small" color="error">
                                ❌ {error}
                            </Typography>
                        </div>
                    )}

                    {data && !loading && (
                        <div className="secure-data-content">
                            {isTeam ? (
                                // Данные сотрудника
                                <>
                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.User size={16} color="#3a5a6a" /> Паспортные данные
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Паспорт:</label>
                                                <span>{data.passport_data || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>ИНН:</label>
                                                <span>{data.inn || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>СНИЛС:</label>
                                                <span>{data.snils || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.Location size={16} color="#3a5a6a" /> Адреса
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Адрес регистрации:</label>
                                                <span>{data.registration_address || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Фактический адрес:</label>
                                                <span>{data.actual_address || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Место рождения:</label>
                                                <span>{data.birth_place || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.Heart size={16} color="#3a5a6a" /> Личная информация
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Семейное положение:</label>
                                                <span>
                                                    {data.marriage_status === 'married' ? 'Женат/Замужем' : 
                                                     data.marriage_status === 'single' ? 'Холост/Не замужем' : 
                                                     data.marriage_status || '—'}
                                                </span>
                                            </div>
                                            <div className="data-item">
                                                <label>Количество детей:</label>
                                                <span>{data.children_count || '0'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Медицинская информация:</label>
                                                <span>{data.medical_info || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Контакт в ЧС:</label>
                                                <span>{data.emergency_contact || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.Settings size={16} color="#3a5a6a" /> Трудовые данные
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Банковские реквизиты:</label>
                                                <span>{data.bank_details || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Информация о контракте:</label>
                                                <span>{data.contract_info || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Остаток отпускных дней:</label>
                                                <span>{data.vacation_days_remaining || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Больничные дни в этом году:</label>
                                                <span>{data.sick_days_this_year || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Данные клиента
                                <>
                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.User size={16} color="#3a5a6a" /> Паспортные данные
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Паспорт:</label>
                                                <span>{data.passport_data || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>ИНН:</label>
                                                <span>{data.inn || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>СНИЛС:</label>
                                                <span>{data.snils || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Дата рождения:</label>
                                                <span>{data.birth_date ? new Date(data.birth_date).toLocaleDateString('ru-RU') : '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.Location size={16} color="#3a5a6a" /> Адреса
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Адрес регистрации:</label>
                                                <span>{data.registration_address || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Фактический адрес:</label>
                                                <span>{data.actual_address || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Место рождения:</label>
                                                <span>{data.birth_place || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-section">
                                        <div className="section-title">
                                            <Icons.Settings size={16} color="#3a5a6a" /> Финансовая информация
                                        </div>
                                        <div className="data-grid">
                                            <div className="data-item">
                                                <label>Банковские реквизиты:</label>
                                                <span>{data.bank_details || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Информация о контракте:</label>
                                                <span>{data.contract_info || '—'}</span>
                                            </div>
                                            <div className="data-item">
                                                <label>Заметки:</label>
                                                <span>{data.notes || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <Typography variant="small" color="secondary">
                        ⚠️ Конфиденциальные данные. Доступ только у администратора.
                    </Typography>
                    <MyButton variant="secondary" onClick={onClose}>
                        Закрыть
                    </MyButton>
                </div>
            </div>
        </div>
    );
};

export default SecureDataModal;