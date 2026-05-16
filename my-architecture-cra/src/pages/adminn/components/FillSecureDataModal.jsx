// my-architecture-cra/src/pages/adminn/components/FillSecureDataModal.jsx
import React, { useState, useEffect } from 'react';
import MyButton from '../../../components/UI/MyButton/MyButton';
import MyInput from '../../../components/UI/MyInput/MyInput';
import MyTextarea from '../../../components/UI/MyTextarea/MyTextarea';
import Typography from '../../../components/UI/Typography/Typography';
import Icons from '../../../components/UI/Icons/Icons.jsx';
import { adminAPI } from '../../../services/api';
import { useModal } from '../../../hooks/useModal';

const FillSecureDataModal = ({ isOpen, onClose, account, onSave }) => {
    const { showAlert, AlertModalComponent } = useModal();
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [hasExistingData, setHasExistingData] = useState(false); // ✅ Добавить
    const [formData, setFormData] = useState({
        passport_data: '',
        inn: '',
        snils: '',
        registration_address: '',
        actual_address: '',
        birth_place: '',
        bank_details: '',
        contract_info: '',
        marriage_status: 'single',
        children_count: 0,
        medical_info: '',
        vacation_days_remaining: '28',
        sick_days_this_year: '0',
        emergency_contact: '',
        birth_date: '',
        notes: ''
    });

    const isTeam = account?.profile?.type === 'team';
    const personName = isTeam ? account.profile.name : 
        `${account.profile.lastName || ''} ${account.profile.firstName || ''}`.trim();

    useEffect(() => {
        if (isOpen && account) {
            loadExistingData();
        }
    }, [isOpen, account]);

    const loadExistingData = async () => {
        setLoadingData(true);
        try {
            let result;
            if (isTeam) {
                result = await adminAPI.getTeamSecureData(account.profile.id, account.profile.name);
            } else {
                const clientName = `${account.profile.lastName || ''} ${account.profile.firstName || ''}`.trim();
                result = await adminAPI.getClientSecureData(account.profile.id, clientName);
            }
            
            if (result && result.success && result.data) {
                const data = result.data;
                setFormData({
                    passport_data: data.passport_data || '',
                    inn: data.inn || '',
                    snils: data.snils || '',
                    registration_address: data.registration_address || '',
                    actual_address: data.actual_address || '',
                    birth_place: data.birth_place || '',
                    bank_details: data.bank_details || '',
                    contract_info: data.contract_info || '',
                    marriage_status: data.marriage_status || 'single',
                    children_count: data.children_count || 0,
                    medical_info: data.medical_info || '',
                    vacation_days_remaining: data.vacation_days_remaining || '28',
                    sick_days_this_year: data.sick_days_this_year || '0',
                    emergency_contact: data.emergency_contact || '',
                    birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
                    notes: data.notes || ''
                });
                setHasExistingData(true); // ✅ Данные найдены, это обновление
                console.log('📦 Загружены существующие данные (обновление):', data);
            } else {
                setHasExistingData(false); // ✅ Данных нет, это создание
                console.log('📦 Существующих данных нет (создание)');
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setHasExistingData(false);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // ✅ Передаём флаг, есть ли существующие данные
            await onSave(account.profile.id, formData, hasExistingData);
            showAlert('Данные успешно сохранены!');
            onClose();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            showAlert('Ошибка при сохранении данных');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const title = isTeam ? 'Редактирование личных данных сотрудника' : 'Редактирование личных данных клиента';
    const buttonText = hasExistingData ? 'Обновить данные' : 'Создать данные';

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <Typography variant="h3" weight="bold">
                            <Icons.Lock size={22} style={{ marginRight: '10px' }} />
                            {title}
                        </Typography>
                        <button className="close-btn" onClick={onClose}>
                            <Icons.Close size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                background: '#e8f0f5', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 12px'
                            }}>
                                <Icons.User size={30} color="#3a5a6a" />
                            </div>
                            <Typography variant="h4" weight="semibold">
                                {personName || account.email}
                            </Typography>
                            <Typography variant="small" color="secondary">
                                <Icons.Email size={14} style={{ marginRight: '4px' }} />
                                {account.email}
                            </Typography>
                        </div>

                        {loadingData ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div className="spinner"></div>
                                <Typography>Загрузка данных...</Typography>
                            </div>
                        ) : (
                            <>
                                {/* Паспортные данные */}
                                <div className="form-section">
                                    <Typography variant="h4" weight="semibold">
                                        <Icons.User size={16} style={{ marginRight: '8px' }} /> Паспортные данные
                                    </Typography>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Паспорт *</label>
                                            <MyInput 
                                                placeholder="Серия номер, кем и когда выдан"
                                                value={formData.passport_data}
                                                onChange={(e) => handleChange('passport_data', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>ИНН</label>
                                            <MyInput 
                                                placeholder="12 цифр"
                                                value={formData.inn}
                                                onChange={(e) => handleChange('inn', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>СНИЛС</label>
                                            <MyInput 
                                                placeholder="000-000-000 00"
                                                value={formData.snils}
                                                onChange={(e) => handleChange('snils', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Адреса */}
                                <div className="form-section">
                                    <Typography variant="h4" weight="semibold">
                                        <Icons.Location size={16} style={{ marginRight: '8px' }} /> Адреса
                                    </Typography>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Адрес регистрации</label>
                                            <MyInput 
                                                placeholder="Полный адрес регистрации"
                                                value={formData.registration_address}
                                                onChange={(e) => handleChange('registration_address', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Фактический адрес</label>
                                            <MyInput 
                                                placeholder="Полный фактический адрес"
                                                value={formData.actual_address}
                                                onChange={(e) => handleChange('actual_address', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Место рождения</label>
                                            <MyInput 
                                                placeholder="Город, населённый пункт"
                                                value={formData.birth_place}
                                                onChange={(e) => handleChange('birth_place', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isTeam ? (
                                    <>
                                        <div className="form-section">
                                            <Typography variant="h4" weight="semibold">
                                                <Icons.Heart size={16} style={{ marginRight: '8px' }} /> Личная информация
                                            </Typography>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Семейное положение</label>
                                                    <select 
                                                        value={formData.marriage_status}
                                                        onChange={(e) => handleChange('marriage_status', e.target.value)}
                                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                                    >
                                                        <option value="single">Холост/Не замужем</option>
                                                        <option value="married">Женат/Замужем</option>
                                                        <option value="divorced">Разведён(а)</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Количество детей</label>
                                                    <MyInput 
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.children_count}
                                                        onChange={(e) => handleChange('children_count', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Медицинская информация</label>
                                                    <MyTextarea 
                                                        placeholder="Группа крови, хронические заболевания..."
                                                        rows="2"
                                                        value={formData.medical_info}
                                                        onChange={(e) => handleChange('medical_info', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Контакт в ЧС</label>
                                                    <MyInput 
                                                        placeholder="ФИО, телефон, степень родства"
                                                        value={formData.emergency_contact}
                                                        onChange={(e) => handleChange('emergency_contact', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <Typography variant="h4" weight="semibold">
                                                <Icons.Briefcase size={16} style={{ marginRight: '8px' }} /> Трудовые данные
                                            </Typography>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Банковские реквизиты</label>
                                                    <MyTextarea 
                                                        placeholder="Банк, номер счёта, БИК"
                                                        rows="2"
                                                        value={formData.bank_details}
                                                        onChange={(e) => handleChange('bank_details', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Информация о контракте</label>
                                                    <MyTextarea 
                                                        placeholder="Номер договора, дата, оклад"
                                                        rows="2"
                                                        value={formData.contract_info}
                                                        onChange={(e) => handleChange('contract_info', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Остаток отпускных дней</label>
                                                    <MyInput 
                                                        placeholder="28"
                                                        value={formData.vacation_days_remaining}
                                                        onChange={(e) => handleChange('vacation_days_remaining', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Больничные дни в этом году</label>
                                                    <MyInput 
                                                        placeholder="0"
                                                        value={formData.sick_days_this_year}
                                                        onChange={(e) => handleChange('sick_days_this_year', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-section">
                                            <Typography variant="h4" weight="semibold">
                                                <Icons.Calendar size={16} style={{ marginRight: '8px' }} /> Личная информация
                                            </Typography>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Дата рождения</label>
                                                    <MyInput 
                                                        type="date"
                                                        value={formData.birth_date}
                                                        onChange={(e) => handleChange('birth_date', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Заметки</label>
                                                    <MyTextarea 
                                                        placeholder="Дополнительная информация о клиенте"
                                                        rows="3"
                                                        value={formData.notes}
                                                        onChange={(e) => handleChange('notes', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-section">
                                            <Typography variant="h4" weight="semibold">
                                                <Icons.Settings size={16} style={{ marginRight: '8px' }} /> Финансовая информация
                                            </Typography>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Банковские реквизиты</label>
                                                    <MyTextarea 
                                                        placeholder="Банк, номер счёта"
                                                        rows="2"
                                                        value={formData.bank_details}
                                                        onChange={(e) => handleChange('bank_details', e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Информация о контракте</label>
                                                    <MyTextarea 
                                                        placeholder="Номер договора, условия"
                                                        rows="2"
                                                        value={formData.contract_info}
                                                        onChange={(e) => handleChange('contract_info', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', margin: '15px 0' }}>
                            <Icons.Lock size={14} color="#3a5a6a" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            <Typography variant="small">
                                Конфиденциальные данные. Доступ только у администратора.
                            </Typography>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <MyButton variant="secondary" onClick={onClose}>
                            Отмена
                        </MyButton>
                        <MyButton variant="primary" onClick={handleSubmit} disabled={loading || loadingData}>
                            {loading ? 'Сохранение...' : (
                                <>
                                    <Icons.Save size={16} style={{ marginRight: '8px' }} /> {buttonText}
                                </>
                            )}
                        </MyButton>
                    </div>
                </div>
            </div>
            <AlertModalComponent />
        </>
    );
};

export default FillSecureDataModal;