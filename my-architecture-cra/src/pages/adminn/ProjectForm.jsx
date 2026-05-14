// pages/admin/ProjectForm.jsx
import React, { useState, useEffect } from 'react';
import Typography from '../../components/UI/Typography/Typography';
import MyButton from '../../components/UI/MyButton/MyButton';
import Icons from '../../components/UI/Icons/Icons';
import { getAllClients, getActiveTeam, getProjectTypes, createFullProject, updateFullProject, getProjectForAdmin } from '../../services/api';
import './ProjectForm.css';
const ProjectForm = ({ projectId, onSaved }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Добавьте рядом с другими useState
    const [existingImages, setExistingImages] = useState([]); // существующие изображения из БД
    const [imagesToDelete, setImagesToDelete] = useState([]); // изображения для удаления
    // Основные данные проекта
    const [project, setProject] = useState({
        title: '',
        slug: '',
        description: '',
        location: '',
        area: '',
        project_year: new Date().getFullYear(),
        status: 'in_progress',  // ← вместо 'design'
        project_type_id: '',
        client_id: '',
        awards: '',
        is_featured: false
    });

    // Данные клиента (для создания нового)
    const [newClient, setNewClient] = useState({
        first_name: '',
        last_name: '',
        patronymic: '',
        email: '',
        phone: ''
    });
    // Выбранный существующий клиент
    const [selectedClientId, setSelectedClientId] = useState('');
    const [isNewClient, setIsNewClient] = useState(false);

    // Изображения
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Комнаты
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState({ name: '', area: '', description: '' });

    // Справочники из БД
    const [projectTypes, setProjectTypes] = useState([]);
    const [clients, setClients] = useState([]);
    const [availableTeam, setAvailableTeam] = useState([]);

    // Добавьте вместе с другими useState
    const [teamSearchTerm, setTeamSearchTerm] = useState('');

    // Фильтрованные сотрудники
    // Фильтрованные сотрудники для автодополнения
    const filteredTeam = availableTeam.filter(member => {
        if (!teamSearchTerm) return [];
        const searchLower = teamSearchTerm.toLowerCase();
        return (
            member.name?.toLowerCase().includes(searchLower) ||
            member.position?.toLowerCase().includes(searchLower) ||
            member.specialization?.toLowerCase().includes(searchLower)
        );
    });
    // Команда
    const [selectedTeam, setSelectedTeam] = useState([]);

    // Загрузка справочников из БД через api.js
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                console.log('🔄 Загрузка справочников...');

                // 1. Типы проектов
                const typesRes = await getProjectTypes();
                setProjectTypes(Array.isArray(typesRes) ? typesRes : []);

                // 2. Клиенты
                const clientsRes = await getAllClients();
                const clientsData = clientsRes.clients || clientsRes;
                setClients(Array.isArray(clientsData) ? clientsData : []);

                // 3. ⭐ КОМАНДА - используем ТОТ ЖЕ метод, что и в TeamList
                const teamRes = await getActiveTeam();  // ← ВОТ ТАК!
                console.log('✅ Команда из getActiveTeam():', teamRes);

                // TeamList ожидает массив, значит и нам нужен массив
                let teamArray = [];
                if (Array.isArray(teamRes)) {
                    teamArray = teamRes;
                } else if (teamRes.team && Array.isArray(teamRes.team)) {
                    teamArray = teamRes.team;
                }

                setAvailableTeam(teamArray);

                console.log('📊 Итог: сотрудников загружено:', teamArray.length);

            } catch (error) {
                console.error('❌ Ошибка загрузки справочников:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        if (projectId) {
            console.log('🆔 projectId передан:', projectId);
            loadProject(projectId);
        } else {
            console.log('🆔 projectId НЕ передан (создание нового проекта)');
        }
    }, [projectId]);

    const loadProject = async (id) => {
        console.log('🔍 loadProject called with id:', id);
        try {
            const res = await getProjectForAdmin(id);
            console.log('📦 getProjectForAdmin response:', res);
            console.log('📦 res.success:', res.success);
            console.log('📦 res.data:', res.data);

            const data = res.data || res;
            console.log('📦 Final data object:', data);

            // Загружаем основные данные проекта
            setProject({
                title: data.title || '',
                slug: data.slug || '',
                description: data.description || '',
                location: data.location || '',
                area: data.area || '',
                project_year: data.project_year || new Date().getFullYear(),
                status: data.status || 'in_progress',
                project_type_id: data.project_type_id || '',
                client_id: data.client_id || '',
                awards: data.awards || '',
                is_featured: data.is_featured || false
            });

            // Загружаем клиента
            if (data.client_id) {
                let cleanClientId = data.client_id.replace(/[{}]/g, '');
                setSelectedClientId(cleanClientId);
                setIsNewClient(false);
            }

            if (data.client) {
                setNewClient({
                    first_name: data.client.first_name || '',
                    last_name: data.client.last_name || '',
                    patronymic: data.client.patronymic || '',
                    email: data.client.email || '',
                    phone: data.client.phone || ''
                });
            }

            // Загружаем комнаты
            setRooms(data.rooms || []);

            // Загружаем команду
            setSelectedTeam(data.team?.map(t => ({
                id: t.id,
                name: t.name,
                role: t.role
            })) || []);

            // ⭐ ЗАГРУЖАЕМ СУЩЕСТВУЮЩИЕ ИЗОБРАЖЕНИЯ
            if (data.images && data.images.length > 0) {
                setExistingImages(data.images);
            }

            // Загружаем главное изображение
            if (data.main_image) {
                setMainImagePreview(data.main_image);
            }

        } catch (error) {
            console.error('Ошибка загрузки проекта:', error);
        }
    };
    // Добавьте вместе с другими useState
    const [selectedTeamMember, setSelectedTeamMember] = useState(null); // Хранит выбранного для добавления
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();

        // Добавляем основные данные
        Object.keys(project).forEach(key => {
            if (project[key] !== undefined && project[key] !== null && project[key] !== '') {
                formData.append(key, project[key]);
            }
        });

        // Добавляем информацию о клиенте
        // Добавляем информацию о клиенте
        if (isNewClient) {
            formData.append('new_client', JSON.stringify(newClient));
        } else if (selectedClientId && selectedClientId !== '') {
            // ⭐ ОЧИЩАЕМ client_id от фигурных скобок
            let cleanClientId = selectedClientId.replace(/[{}]/g, '');
            formData.append('client_id', cleanClientId);
        }

        // Добавляем комнаты
        if (rooms.length > 0) {
            formData.append('rooms', JSON.stringify(rooms));
        }

        // Добавляем команду
        if (selectedTeam.length > 0) {
            const teamData = selectedTeam.map(member => ({
                id: member.id,
                role: member.role || member.position
            }));
            formData.append('team_data', JSON.stringify(teamData));
        }

        // Добавляем изображения
        if (mainImage) {
            formData.append('main_image', mainImage);
        }

        if (imagesToDelete.length > 0) {
            formData.append('delete_images', JSON.stringify(imagesToDelete));
        }

        // Добавляем флаг, что главное изображение удалено
        if (!mainImagePreview && !mainImage && project.main_image) {
            formData.append('delete_main_image', 'true');
        }
        galleryImages.forEach(img => {
            formData.append('gallery_images', img);
        });

        try {
            let result;
            if (projectId) {
                result = await updateFullProject(projectId, formData);
            } else {
                result = await createFullProject(formData);
            }

            if (result.success) {
                alert(projectId ? 'Проект обновлен!' : 'Проект создан!');

                // ✅ ОЧИЩАЕМ ФОРМУ ПОСЛЕ УСПЕШНОГО СОЗДАНИЯ
                if (!projectId) {
                    // Сбрасываем все поля формы
                    resetForm();
                }

                if (onSaved) onSaved(result.project || result.data);
            } else {
                throw new Error(result.error || 'Ошибка сохранения');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Добавьте после всех useState, но до handleSubmit
    const resetForm = () => {
        setProject({
            title: '',
            slug: '',
            description: '',
            location: '',
            area: '',
            project_year: new Date().getFullYear(),
            status: 'in_progress',
            project_type_id: '',
            client_id: '',
            awards: '',
            is_featured: false
        });
        setNewClient({
            first_name: '',
            last_name: '',
            patronymic: '',
            email: '',
            phone: ''
        });
        setSelectedClientId('');
        setIsNewClient(false);
        setMainImage(null);
        setMainImagePreview(null);
        setGalleryImages([]);
        setGalleryPreviews([]);
        setRooms([]);
        setCurrentRoom({ name: '', area: '', description: '' });
        setSelectedTeam([]);
        setTeamSearchTerm('');
        setSelectedTeamMember(null);
        setActiveTab('basic');
    };


    const addRoom = () => {
        if (currentRoom.name && currentRoom.area) {
            setRooms([...rooms, { ...currentRoom, id: Date.now() }]);
            setCurrentRoom({ name: '', area: '', description: '' });
        }
    };

    const removeRoom = (index) => {
        setRooms(rooms.filter((_, i) => i !== index));
    };

    const addTeamMember = (teamMember, role) => {
        // Проверяем, что member существует и еще не добавлен
        if (teamMember && !selectedTeam.find(s => s.id === teamMember.id)) {
            setSelectedTeam([...selectedTeam, { ...teamMember, role }]);
            return true;
        }
        return false;
    };

    const removeTeamMember = (teamId) => {
        setSelectedTeam(selectedTeam.filter(t => t.id !== teamId));
    };

    if (loading) {
        return (
            <div className="project-form-loading">
                <Typography variant="body">Загрузка данных...</Typography>
            </div>
        );
    }

    return (
        <form className="project-form" onSubmit={handleSubmit}>
            <Typography variant="h2" className="project-form-title">
                {projectId ? 'Редактирование проекта' : 'Новый проект'}
            </Typography>

            <div className="project-form-tabs">
                {[
                    { id: 'basic', label: 'Основное' },
                    { id: 'client', label: 'Клиент' },
                    { id: 'images', label: 'Изображения' },
                    { id: 'rooms', label: 'Помещения' },
                    { id: 'team', label: 'Команда' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`project-form-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Вкладка: Основное (остается без изменений) */}
            {activeTab === 'basic' && (
                <div className="project-form-section">
                    <div className="project-form-grid">
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Название проекта *</Typography>
                            <input
                                type="text"
                                value={project.title}
                                onChange={e => setProject({ ...project, title: e.target.value })}
                                className="project-form-input"
                                required
                            />
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Slug (URL)</Typography>
                            <input
                                type="text"
                                value={project.slug}
                                onChange={e => setProject({ ...project, slug: e.target.value })}
                                className="project-form-input"
                                placeholder="автоматически из названия"
                            />
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Локация</Typography>
                            <input
                                type="text"
                                value={project.location}
                                onChange={e => setProject({ ...project, location: e.target.value })}
                                className="project-form-input"
                            />
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Площадь (м²)</Typography>
                            <input
                                type="number"
                                value={project.area}
                                onChange={e => setProject({ ...project, area: e.target.value })}
                                className="project-form-input"
                            />
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Год</Typography>
                            <input
                                type="number"
                                value={project.project_year}
                                onChange={e => setProject({ ...project, project_year: e.target.value })}
                                className="project-form-input"
                            />
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Статус</Typography>
                            <select
                                value={project.status}
                                onChange={e => setProject({ ...project, status: e.target.value })}
                                className="project-form-select"
                            >
                                <option value="built">Построен</option>
                                <option value="in_progress">В процессе</option>  {/* ← вместо design */}
                                <option value="concept">Концепция</option>
                            </select>
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Тип проекта</Typography>
                            <select
                                value={project.project_type_id}
                                onChange={e => setProject({ ...project, project_type_id: e.target.value })}
                                className="project-form-select"
                            >
                                <option value="">Выберите тип проекта</option>
                                {projectTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="project-form-field">
                            <Typography variant="small" weight="medium">Награды</Typography>
                            <input
                                type="text"
                                value={project.awards}
                                onChange={e => setProject({ ...project, awards: e.target.value })}
                                className="project-form-input"
                                placeholder="Премия Золотое сечение 2024"
                            />
                        </div>
                        <div className="project-form-field-full">
                            <Typography variant="small" weight="medium">Описание</Typography>
                            <textarea
                                value={project.description}
                                onChange={e => setProject({ ...project, description: e.target.value })}
                                rows={6}
                                className="project-form-textarea"
                            />
                        </div>
                        <div className="project-form-field-full">
                            <label className="project-form-checkbox">
                                <input
                                    type="checkbox"
                                    checked={project.is_featured}
                                    onChange={e => setProject({ ...project, is_featured: e.target.checked })}
                                />
                                <Typography variant="small">Избранный проект (на главную)</Typography>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Вкладка: Клиент */}
            {activeTab === 'client' && (
                <div className="project-form-section">
                    <div className="project-form-grid">
                        <div className="project-form-field-full">
                            <label className="project-form-radio-group">
                                <label className="project-form-radio">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        checked={!isNewClient}
                                        onChange={() => setIsNewClient(false)}
                                    />
                                    <Typography variant="small">Выбрать существующего клиента</Typography>
                                </label>
                                <label className="project-form-radio">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        checked={isNewClient}
                                        onChange={() => setIsNewClient(true)}
                                    />
                                    <Typography variant="small">Создать нового клиента</Typography>
                                </label>
                            </label>
                        </div>

                        {!isNewClient ? (
                            <div className="project-form-field-full">
                                <Typography variant="small" weight="medium">Выберите клиента</Typography>
                                <select
                                    value={selectedClientId}
                                    onChange={e => {
                                        setSelectedClientId(e.target.value);
                                        setProject({ ...project, client_id: e.target.value });
                                    }}
                                    className="project-form-select"
                                >
                                    <option value="">-- Выберите клиента --</option>
                                    {clients.map(client => (
                                        <option key={client.client_id || client.id} value={client.client_id || client.id}>
                                            {client.last_name} {client.first_name} {client.patronymic || ''}
                                            {client.email ? ` (${client.email})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {clients.length === 0 && (
                                    <Typography variant="small" color="default">
                                        Нет клиентов. Создайте нового.
                                    </Typography>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="project-form-field">
                                    <Typography variant="small" weight="medium">Фамилия</Typography>
                                    <input
                                        type="text"
                                        value={newClient.last_name}
                                        onChange={e => setNewClient({ ...newClient, last_name: e.target.value })}
                                        className="project-form-input"
                                    />
                                </div>
                                <div className="project-form-field">
                                    <Typography variant="small" weight="medium">Имя</Typography>
                                    <input
                                        type="text"
                                        value={newClient.first_name}
                                        onChange={e => setNewClient({ ...newClient, first_name: e.target.value })}
                                        className="project-form-input"
                                    />
                                </div>
                                <div className="project-form-field">
                                    <Typography variant="small" weight="medium">Отчество</Typography>
                                    <input
                                        type="text"
                                        value={newClient.patronymic}
                                        onChange={e => setNewClient({ ...newClient, patronymic: e.target.value })}
                                        className="project-form-input"
                                    />
                                </div>
                                <div className="project-form-field">
                                    <Typography variant="small" weight="medium">Email</Typography>
                                    <input
                                        type="email"
                                        value={newClient.email}
                                        onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                        className="project-form-input"
                                    />
                                </div>
                                <div className="project-form-field">
                                    <Typography variant="small" weight="medium">Телефон</Typography>
                                    <input
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="project-form-input"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Вкладка: Изображения */}
            {activeTab === 'images' && (
                <div className="project-form-section">
                    <div className="project-form-images">
                        {/* Существующее главное изображение */}
                        {mainImagePreview && !mainImage && (
                            <div className="existing-main-image">
                                <Typography variant="h4" weight="medium">Текущее главное изображение</Typography>
                                <div className="existing-image-wrapper">
                                    <img src={mainImagePreview} alt="Current main" className="existing-image" />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => {
                                            setMainImagePreview(null);
                                            window.mainImageDeleted = true;
                                        }}
                                    >
                                        <Icons.Trash size={16} /> 
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Загрузка нового главного изображения */}
                        <div className="project-form-main-image">
                            <Typography variant="h4" weight="medium">
                                {mainImagePreview && !mainImage ? 'Заменить главное изображение' : 'Главное изображение'}
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    setMainImage(file);
                                    setMainImagePreview(URL.createObjectURL(file));
                                }}
                                className="project-form-file"
                            />
                            {mainImage && mainImagePreview && (
                                <img src={mainImagePreview} alt="Preview" className="project-form-preview" />
                            )}
                        </div>

                        {/* Существующая галерея */}
                        {existingImages.length > 0 && (
                            <div className="project-form-existing-gallery">
                                <Typography variant="h4" weight="medium">Существующие изображения</Typography>
                                <div className="existing-gallery-grid">
                                    {existingImages.map((img, idx) => (
                                        <div key={img.id || idx} className="existing-gallery-item">
                                            <img src={img.image_url} alt={`Gallery ${idx}`} />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => {
                                                    // Удаляем из существующих
                                                    setExistingImages(existingImages.filter((_, i) => i !== idx));
                                                    // Добавляем в список на удаление
                                                    if (img.id) {
                                                        setImagesToDelete([...imagesToDelete, img.id]);
                                                    }
                                                }}
                                            >
                                                <Icons.Trash size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Добавление новых изображений в галерею */}
                        <div className="project-form-gallery">
                            <Typography variant="h4" weight="medium">
                                {existingImages.length > 0 ? 'Добавить новые изображения' : 'Галерея (можно несколько файлов)'}
                            </Typography>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e => {
                                    const files = Array.from(e.target.files);
                                    setGalleryImages([...galleryImages, ...files]);
                                    setGalleryPreviews([...galleryPreviews, ...files.map(f => URL.createObjectURL(f))]);
                                }}
                                className="project-form-file"
                            />
                            <div className="project-form-gallery-previews">
                                {galleryPreviews.map((preview, idx) => (
                                    <div key={idx} className="gallery-preview-wrapper">
                                        <img src={preview} alt={`preview-${idx}`} className="project-form-gallery-preview" />
                                        <button
                                            type="button"
                                            className="remove-preview-btn"
                                            onClick={() => {
                                                setGalleryImages(galleryImages.filter((_, i) => i !== idx));
                                                setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx));
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'rooms' && (
                <div className="project-form-section">
                    <div className="project-form-rooms">
                        <div className="project-form-room-add">
                            <input
                                type="text"
                                placeholder="Название помещения"
                                value={currentRoom.name}
                                onChange={e => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                                className="project-form-input"
                            />
                            <input
                                type="number"
                                placeholder="Площадь (м²)"
                                value={currentRoom.area}
                                onChange={e => setCurrentRoom({ ...currentRoom, area: e.target.value })}
                                className="project-form-input"
                            />
                            <MyButton variant="primary" onClick={addRoom} type="button">
                                + Добавить помещение
                            </MyButton>
                        </div>
                        <input
                            type="text"
                            placeholder="Описание помещения"
                            value={currentRoom.description}
                            onChange={e => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                            className="project-form-input-full"
                        />
                        <Typography variant="h4" weight="medium">Список помещений:</Typography>
                        <div className="project-form-room-list">
                            {rooms.map((room, idx) => (
                                <div key={idx} className="project-form-room-item">
                                    <div>
                                        <Typography variant="body" weight="medium">{room.name}</Typography>
                                        <Typography variant="small">{room.area} м²</Typography>
                                        {room.description && <Typography variant="small">{room.description}</Typography>}
                                    </div>
                                    <button type="button" onClick={() => removeRoom(idx)} className="project-form-delete-btn">
                                        <Icons.Trash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Вкладка: Команда */}
            {activeTab === 'team' && (
                <div className="project-form-section">
                    <div className="project-form-team">
                        <Typography variant="h4" weight="medium">Добавить специалиста</Typography>

                        <div className="team-add-form">
                            <div className="autocomplete-wrapper">
                                <input
                                    type="text"
                                    placeholder="Начните вводить имя сотрудника..."
                                    className="project-form-input"
                                    value={teamSearchTerm}
                                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                                />

                                {/* Выпадающий список подсказок */}
                                {teamSearchTerm && filteredTeam.length > 0 && (
                                    <div className="autocomplete-dropdown">
                                        {filteredTeam.map(member => (
                                            <div
                                                key={member.id}
                                                className="autocomplete-item"
                                                onClick={() => {
                                                    setSelectedTeamMember(member);
                                                    setTeamSearchTerm(member.name);
                                                }}
                                            >
                                                <div className="autocomplete-name">{member.name}</div>
                                                <div className="autocomplete-details">
                                                    {member.position} {member.specialization ? `• ${member.specialization}` : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ✅ ИСПРАВЛЕННАЯ КНОПКА ДОБАВЛЕНИЯ */}
                            <MyButton
                                variant="primary"
                                onClick={() => {
                                    console.log('Добавление сотрудника:', selectedTeamMember);
                                    if (selectedTeamMember) {
                                        // Проверяем, не добавлен ли уже
                                        if (!selectedTeam.find(s => s.id === selectedTeamMember.id)) {
                                            setSelectedTeam([...selectedTeam, {
                                                ...selectedTeamMember,
                                                role: 'architect'
                                            }]);
                                            setSelectedTeamMember(null);
                                            setTeamSearchTerm('');
                                        } else {
                                            alert('Этот сотрудник уже добавлен в проект');
                                        }
                                    }
                                }}
                                type="button"
                                disabled={!selectedTeamMember}
                            >
                                + Добавить
                            </MyButton>
                        </div>

                        {/* Показываем выбранного сотрудника для добавления */}
                        {/* Показываем выбранного сотрудника для добавления */}
                        {selectedTeamMember && (
                            <div className="selected-to-add">
                                <Typography variant="small" weight="medium">
                                    Будет добавлен: {selectedTeamMember.name}
                                </Typography>
                                <Typography variant="small" color="default">
                                    Должность: {selectedTeamMember.position}
                                </Typography>
                            </div>
                        )}

                        {availableTeam.length === 0 && (
                            <Typography variant="small" color="default" className="no-team-message">
                                Нет сотрудников в команде. Добавьте их через админ-панель.
                            </Typography>
                        )}

                        {/* Список выбранных участников */}
                        <Typography variant="h4" weight="medium" style={{ marginTop: '24px' }}>
                            Участники проекта ({selectedTeam.length}):
                        </Typography>

                        <div className="project-form-team-list">
                            {selectedTeam.map((member) => (
                                <div key={member.id} className="project-form-team-item">
                                    <div className="team-member-info">
                                        <Typography variant="body" weight="medium" className="project-form-team-name">
                                            {member.name}
                                        </Typography>
                                        <Typography variant="small" color="default" className="team-member-position">
                                            {member.position}
                                        </Typography>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTeam(selectedTeam.filter(t => t.id !== member.id))}
                                        className="project-form-delete-btn"
                                        title="Удалить"
                                    >
                                        <Icons.Trash size={18} />
                                    </button>
                                </div>
                            ))}
                            {selectedTeam.length === 0 && (
                                <div className="empty-team">
                                    <Typography variant="small" color="default">
                                        Сотрудники не выбраны. Выберите специалиста из списка и нажмите "Добавить".
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Кнопки сохранения */}
            <div className="project-form-actions">
                <MyButton variant="outline" type="button" onClick={() => window.history.back()}>
                    Отмена
                </MyButton>
                <MyButton variant="primary" type="submit" disabled={saving}>
                    {saving ? 'Сохранение...' : (projectId ? 'Обновить' : 'Создать')}
                </MyButton>
            </div>
        </form>
    );
};

export default ProjectForm;