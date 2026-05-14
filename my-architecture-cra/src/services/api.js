// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        console.log('🔐 authAPI.login response:', data);

        return data; // Должен вернуть { success, token, user }
    },
    register: async (data) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            })
        });
        return response.json();
    },

    // Подтверждение email
    verify: async (data) => {
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                code: data.code
            })
        });
        return response.json();
    },

    // Вход
    login: async (data) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            })
        });
        return response.json();
    },

    // Выход
    logout: async () => {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response.json();
    },

    // Получить текущего пользователя
    getCurrentUser: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка получения пользователя');
        }

        return response.json();
    },
    // Сброс пароля
    resetPassword: async (data) => {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Отправить код подтверждения
    sendVerificationCode: async (data) => {
        const response = await fetch(`${API_URL}/auth/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email })
        });
        return response.json();
    },
    // В authAPI
    resetPassword: async (data) => {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
};

// ============================================
// PROFILE API (НОВЫЙ)
// ============================================
export const profileAPI = {
    // Получить профиль пользователя
    getProfile: async () => {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response.json();
    },

    updateProfile: async (data) => {
        // ⭐ ИЗМЕНЕНО: теперь запрос на /team/profile
        const response = await fetch(`${API_URL}/team/profile`, {  // <-- /team/profile
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Обновить аватар (если нужно)
    updateAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${API_URL}/auth/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        return response.json();
    },

    // Сменить пароль
    changePassword: async (oldPassword, newPassword) => {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        return response.json();
    },

    /* getMyProjects: async () => {
         const token = getToken();
         const userType = localStorage.getItem('userType');
         
         // ⭐ Выбираем маршрут в зависимости от типа пользователя
         const url = userType === 'team' 
             ? `${API_URL}/team/my-projects`   // для сотрудников
             : `${API_URL}/projects/my-projects`; // для клиентов
         
         const response = await fetch(url, {
             headers: { 'Authorization': `Bearer ${token}` }
         });
         return response.json();
     }*/
    getMyProjects: async () => {
        const token = getToken();
        const userType = localStorage.getItem('userType');

        // ✅ ИСПРАВЛЕНО: для клиентов используем /projects/my-projects
        const url = userType === 'team'
            ? `${API_URL}/team/my-projects`   // для сотрудников
            : `${API_URL}/projects/my-projects`; // для клиентов

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
};

// ============================================
// PROJECTS API
// ============================================
export const getProjects = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/projects${params ? `?${params}` : ''}`);
    return response.json();
};

export const getProjectById = async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`);
    return response.json();
};

export const getProjectsByType = async (typeId) => {
    const response = await fetch(`${API_URL}/projects?type=${typeId}`);
    return response.json();
};

// ============================================
// SERVICES API
// ============================================
export const getServices = async () => {
    const response = await fetch(`${API_URL}/services`);
    return response.json();
};

export const getPopularServices = async () => {
    const response = await fetch(`${API_URL}/services/popular`);
    return response.json();
};

export const getServicesByCategory = async (category) => {
    const response = await fetch(`${API_URL}/services/category/${category}`);
    return response.json();
};

export const getServicesByCategorySlug = async (slug) => {
    const response = await fetch(`${API_URL}/services/categories/${slug}`);
    return response.json();
};
// Добавьте в ваш файл api.js
export const updateService = async (id, serviceData, token) => {
  try {
    const response = await fetch(`http://localhost:5000/api/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(serviceData)
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при обновлении услуги');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

export const deleteService = async (id, token) => {
  try {
    const response = await fetch(`http://localhost:5000/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении услуги');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

// ============================================
// TEAM API
// ============================================
export const getTeam = async () => {
    const response = await fetch(`${API_URL}/team`);
    return response.json();
};

export const getActiveTeam = async () => {
    const response = await fetch(`${API_URL}/team/active`);
    return response.json();
};

export const getTeamMember = async (id) => {
    const response = await fetch(`${API_URL}/team/${id}`);
    return response.json();
};

// ============================================
// TESTIMONIALS API
// ============================================

// Получить все отзывы (публичные)
export const getTestimonials = async (publishedOnly = true) => {
    const url = publishedOnly ? `${API_URL}/testimonials?published=true` : `${API_URL}/testimonials`;
    const response = await fetch(url);
    return response.json();
};

// Создание отзыва клиентом
export const createTestimonial = async (reviewData) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return { success: false, error: 'Необходимо авторизоваться' };
    }

    const response = await fetch(`${API_URL}/testimonials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            project_id: reviewData.project_id,
            text: reviewData.text,
            rating: reviewData.rating
        })
    });

    const data = await response.json();
    return data;
};

// Проверка существующего отзыва
export const checkTestimonialExists = async (projectId) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return { hasReview: false };
    }

    const response = await fetch(`${API_URL}/testimonials/check/${projectId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.json();
};

// ⭐ ПОЛУЧИТЬ ОТЗЫВЫ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (ТОЛЬКО ОДИН РАЗ!)
export const getMyTestimonials = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return { success: false, testimonials: [] };
    }

    const response = await fetch(`${API_URL}/testimonials/my`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.json();
};

// ⭐ ОБНОВИТЬ СВОЙ ОТЗЫВ
export const updateMyTestimonial = async (id, data) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/testimonials/my/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    return response.json();
};

// ⭐ УДАЛИТЬ СВОЙ ОТЗЫВ
export const deleteMyTestimonial = async (id) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/testimonials/my/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.json();
};

// Получить отзывы по проекту
export const getTestimonialsByProject = async (projectId) => {
    const response = await fetch(`${API_URL}/testimonials?project_id=${projectId}&published=true`);
    return response.json();
};

// ============================================
// PARTNERS API
// ============================================
export const getPartners = async () => {
    const response = await fetch(`${API_URL}/partners`);
    return response.json();
};

// ============================================
// AWARDS API
// ============================================
export const getAwards = async () => {
    const response = await fetch(`${API_URL}/awards`);
    return response.json();
};

// ============================================
// CONTACT API
// ============================================
export const sendContact = async (data) => {
    const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
};

// ============================================
// SEARCH API
// ============================================
export const searchProjects = async (query) => {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    return response.json();
};

// ============================================
// PROJECT TYPES API
// ============================================
export const getProjectTypes = async () => {
    const response = await fetch(`${API_URL}/project-types/all`);
    return response.json();
};

export const getProjectTypesByCategory = async (category) => {
    const response = await fetch(`${API_URL}/project-types?category=${category}`);
    return response.json();
};

// ============================================
// SITE SETTINGS API
// ============================================
export const getSiteSettings = async () => {
    const response = await fetch(`${API_URL}/site-settings`);
    return response.json();
};
// ============================================
// PROJECTS API - ДОПОЛНЕНИЯ
// ============================================

// Получить ВСЕ проекты с пагинацией и фильтрацией
// Получить ВСЕ проекты с пагинацией и фильтрацией
// ============================================
// PROJECTS API - ДОПОЛНЕНИЯ
// ============================================

// Получить ВСЕ проекты с пагинацией и фильтрацией
export const getAllProjects = async (filters = {}, page = 1, limit = 12, sortBy = 'date_desc') => {
    // ⭐ Защита от undefined/null
    const safeFilters = filters || {};
    const safePage = page || 1;
    const safeLimit = limit || 12;
    const safeSortBy = sortBy || 'date_desc';

    const params = new URLSearchParams();

    // Пагинация
    params.append('page', safePage);
    params.append('limit', safeLimit);

    // Сортировка
    params.append('sort', safeSortBy);

    // Фильтры - безопасная проверка
    if (safeFilters.type && safeFilters.type !== '' && safeFilters.type !== 'all') {
        params.append('type', safeFilters.type);
    }
    if (safeFilters.year && safeFilters.year !== '' && safeFilters.year !== 'all') {
        params.append('year', safeFilters.year);
    }
    if (safeFilters.search && safeFilters.search !== '') {
        params.append('search', safeFilters.search);
    }
    if (safeFilters.status && safeFilters.status !== '' && safeFilters.status !== 'all') {
        params.append('status', safeFilters.status);
    }

    const url = `${API_URL}/projects?${params.toString()}`;
    console.log('🔵 Frontend запрос:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('🟢 Frontend ответ:', data);
        return data;
    } catch (error) {
        console.error('🔴 Ошибка запроса:', error);
        return { success: false, projects: [], pagination: { total: 0, page: 1, limit: safeLimit, pages: 0 } };
    }
};

// Получить ПОЛНЫЙ проект по slug (с комнатами и всеми изображениями)
// В services/api.js
// Получить ПОЛНЫЙ проект по slug (с комнатами и всеми изображениями)
export const getFullProjectBySlug = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/projects/full/${slug}`);
        const data = await response.json();

        console.log('🟢 API Response from server:', data);

        // Сервер возвращает { success: true, data: {...} }
        // Возвращаем как есть, не оборачивая дополнительно
        return data;
    } catch (error) {
        console.error('🔴 API Error:', error);
        throw error;
    }
};

// Получить избранные проекты
export const getFeaturedProjects = async (limit = 6) => {
    const response = await fetch(`${API_URL}/projects/featured?limit=${limit}`);
    return response.json();
};

// Обновляем projectsAPI для совместимости с компонентом ProjectPage
export const projectsAPI = {
    getBySlug: getFullProjectBySlug,
    getAll: getAllProjects,
    getFeatured: getFeaturedProjects,
    getTypes: getProjectTypes
};

// Добавьте в конец файла src/services/api.js

// ============================================
// CLIENTS API (ДОБАВИТЬ)
// ============================================
export const getAllClients = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/clients/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

export const createClient = async (clientData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/clients/create-from-account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientData)
    });
    return response.json();
};

// ============================================
// ADMIN PROJECTS API (ДЛЯ СОЗДАНИЯ/РЕДАКТИРОВАНИЯ)
// ============================================
export const createFullProject = async (formData) => {
    const token = getToken();
    // ✅ ИСПРАВЛЕНО: убрал /admin, оставил только /projects
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    return response.json();
};

export const updateFullProject = async (id, formData) => {
    const token = getToken();
    // ✅ ИСПРАВЛЕНО: убрал /admin
    const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    return response.json();
};

export const getProjectForAdmin = async (id) => {
    const token = getToken();
    // ✅ ИСПРАВЛЕНО: убрал /admin
    const response = await fetch(`${API_URL}/projects/${id}/full`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};
// ============================================
// ADMIN API (УПРАВЛЕНИЕ АККАУНТАМИ)
// ============================================

export const adminAPI = {
    // Получить все аккаунты с фильтрацией
    getAccounts: async (filters = {}) => {
        const token = getToken();
        console.log('🔑 adminAPI.getAccounts - токен есть?', !!token);
        console.log('🔑 adminAPI.getAccounts - роль в localStorage:', localStorage.getItem('userRole'));

        const params = new URLSearchParams();

        if (filters.type && filters.type !== 'all') {
            params.append('type', filters.type);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }

        const queryString = params.toString();
        const url = `${API_URL}/admin/accounts${queryString ? `?${queryString}` : ''}`;
        console.log('📡 adminAPI.getAccounts - URL:', url);

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('📡 adminAPI.getAccounts - статус:', response.status);

            const data = await response.json();
            console.log('📡 adminAPI.getAccounts - данные:', data);

            return data;
        } catch (error) {
            console.error('❌ adminAPI.getAccounts - ошибка:', error);
            throw error;
        }
    },

    // Получить один аккаунт
    getAccount: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/admin/accounts/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    // Обновить аккаунт (роль, статус)
    updateAccount: async (id, data) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/admin/accounts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Обновить клиента
    updateClient: async (clientId, data) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/admin/clients/${clientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Обновить сотрудника
    updateTeam: async (teamId, data) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/admin/team/${teamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Создать клиента
    createClient: async (data) => {
        const token = getToken();
        const response = await fetch(`${API_URL}/admin/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Получить расшифрованные данные сотрудника
    getTeamSecureData: async (teamId, name) => {
        const token = getToken();
        console.log('🔐 getTeamSecureData вызван:', { teamId, name });

        const response = await fetch(`${API_URL}/admin/team-secure/${teamId}?name=${encodeURIComponent(name || '')}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log('📦 getTeamSecureData ответ:', data);
        return data;
    },

    // Получить расшифрованные данные клиента
    getClientSecureData: async (clientId, name) => {
        const token = getToken();
        console.log('🔐 getClientSecureData вызван:', { clientId, name });

        const response = await fetch(`${API_URL}/admin/client-secure/${clientId}?name=${encodeURIComponent(name || '')}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log('📦 getClientSecureData ответ:', data);
        return data;
    },
    // В adminAPI, после getClientSecureData, добавь:

    // Создать/обновить приватные данные сотрудника
    createTeamSecureData: async (teamId, data) => {
        const token = getToken();
        console.log('📝 createTeamSecureData вызван:', { teamId, data });

        const response = await fetch(`${API_URL}/admin/team-secure/${teamId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('📦 createTeamSecureData ответ:', result);
        return result;
    },

    // Создать/обновить приватные данные клиента
    createClientSecureData: async (clientId, data) => {
        const token = getToken();
        console.log('📝 createClientSecureData вызван:', { clientId, data });

        const response = await fetch(`${API_URL}/admin/client-secure/${clientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('📦 createClientSecureData ответ:', result);
        return result;
    },
};
// Обновляем экспорт
const api = {
    authAPI,
    profileAPI,
    adminAPI,           // ← ⭐ ДОБАВИТЬ
    getProjects,
    getAllProjects,
    getFullProjectBySlug,
    getFeaturedProjects,
    getProjectById,
    getProjectsByType,
    getServices,
    getPopularServices,
    getServicesByCategory,
    getServicesByCategorySlug,
    getTeam,
    getActiveTeam,
    getTeamMember,
    getTestimonials,
    createTestimonial,      // ← добавить
    checkTestimonialExists, // ← добавить
    getMyTestimonials,      // ← добавить
    updateMyTestimonial,    // ← добавить
    deleteMyTestimonial,    // ← добавить
    getTestimonialsByProject,
    getPartners,
    getAwards,
    sendContact,
    searchProjects,
    getProjectTypes,
    getProjectTypesByCategory,
    getSiteSettings,
    getAllClients,
    createClient,
    createFullProject,
    updateFullProject,
    getProjectForAdmin
};

export default api;

