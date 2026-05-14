// Header.jsx - исправленная модалка с ContactForm
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import './Header.css';
import logo from '../../../assets/images/logo.png';
import Typography from '../../UI/Typography/Typography.jsx';
import MyButton from '../../UI/MyButton/MyButton.jsx';
import MyButtonOutline from '../../UI/MyButtonOutline/MyButtonOutline.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { scrollToSection } from '../../../utils/scrollToSection.js';
import Icons from '../../UI/Icons/Icons.jsx';
import { authAPI } from '../../../services/api.js';
import AuthModal from '../../Auth/AuthModal/AuthModal.jsx';
import ProfileModal from '../../Auth/ProfileModal/ProfileModal.jsx';
import ContactForm from '../../UI/ContactForm/ContactForm.jsx'; // ✅ Импорт ContactForm
import { useAuth } from '../../../hooks/useAuth.js';

const Header = () => {
  const { logout, isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Получаем роль из localStorage (более надёжно)
  const getUserRole = () => localStorage.getItem('userRole');
  const isAdminUser = getUserRole() === 'admin';
  const isManager = getUserRole() === 'manager';
  const isStaff = isAdminUser || isManager;

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    console.log('🔍 Текущая роль в localStorage:', role);
    console.log('🔍 user объект из хука:', user);
  }, [user]);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-menu')) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Синхронизируем user из хука с состоянием
  useEffect(() => {
    if (user && user.email) {
      setUserData(user);
      setIsLoggedIn(true);
    }
  }, [user]);

  // Также проверяем при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      setIsLoggedIn(true);
      setUserData({
        email: localStorage.getItem('userEmail'),
        role: role,
        id: localStorage.getItem('userId')
      });
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const result = await authAPI.getCurrentUser();
        if (result && result.success) {
          setUserData(result.user);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
  };

  const handleAuthSuccess = (user) => {
    console.log('🔐 handleAuthSuccess получил:', user);

    if (user && user.email) {
      setUserData(user);
      setIsLoggedIn(true);
      console.log('Добро пожаловать,', user.email);
    } else {
      const email = localStorage.getItem('userEmail');
      const role = localStorage.getItem('userRole');

      if (email) {
        setUserData({ email, role });
        setIsLoggedIn(true);
        console.log('Добро пожаловать,', email);
      }
    }

    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setUserData(null);
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setOpenDropdowns({});
    }
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setOpenDropdowns({});
  };

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToServices = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setOpenDropdowns({});
    }
    const isHomePage = window.location.pathname === '/';
    if (isHomePage) {
      scrollToSection('services');
    } else {
      window.location.href = '/#services';
    }
  };

  const menuData = {
    projects: {
      title: 'Проекты',
      links: [
        { href: '/projects', label: 'Все проекты' },
        { href: '/projects?status=built', label: 'Построенные' },
        { href: '/projects?status=in_progress', label: 'В процессе' }
      ]
    },
    clients: {
      title: 'Клиентам',
      links: [
        { href: '/calculator', label: 'Калькулятор стоимости' },
        { href: '/stages', label: 'Этапы работы' },
        { href: '/reviews', label: 'Отзывы' }
      ]
    }
  };

  return (
    <>
      <header className="App-header">
        <div className="logo">
          <a href="/">
            <img src={logo} alt="Логотип компании" />
          </a>
        </div>

        <div className="search-wrapper">
          <button className="search-button" onClick={openModal}>
            <FiSearch size={20} />
            <span>Есть вопрос? Напишите нам</span>
          </button>
        </div>

        <button className="hamburger" onClick={toggleMenu}>
          <FiMenu size={28} />
        </button>

        {/* Десктопное меню */}
        <nav className="desktop-menu">
          <Link to="/company" className="menu-item" onClick={handleLinkClick}>
            <Typography variant="small" color="primary">О компании</Typography>
          </Link>

         {/* <button onClick={scrollToServices} className="menu-item-link">
            <Typography variant="small" color="primary">Возможности</Typography>
          </button>*/}

          <div className="dropdown">
            <span className="menu-item">
              <Typography variant="small" color="primary">{menuData.projects.title} ▼</Typography>
            </span>
            <div className="dropdown-content">
              {menuData.projects.links.map((link, index) => (
                <Link key={index} to={link.href} onClick={handleLinkClick}>
                  <Typography variant="body" color="primary">{link.label}</Typography>
                </Link>
              ))}
            </div>
          </div>

          <div className="dropdown">
            <span className="menu-item">
              <Typography variant="small" color="primary">{menuData.clients.title} ▼</Typography>
            </span>
            <div className="dropdown-content">
              {menuData.clients.links.map((link, index) => (
                <Link key={index} to={link.href} onClick={handleLinkClick}>
                  <Typography variant="body" color="primary">{link.label}</Typography>
                </Link>
              ))}
            </div>
          </div>

          <Link to="/contacts" className="menu-item" onClick={handleLinkClick}>
            <Typography variant="small" color="primary">Контакты</Typography>
          </Link>

          <Link to="/calculator" className="btn-calc-link" onClick={handleLinkClick}>
            <MyButtonOutline variant="dark" style={{ marginTop: '1rem', fontSize: '12px' }}>
              Рассчитать стоимость
            </MyButtonOutline>
          </Link>

          {/* Кнопка пользователя */}
          <div className="user-menu">
            <MyButtonOutline
              variant="dark"
              style={{ marginTop: '1rem' }}
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <Icons.User size={20} color="#C4A484" style={{ marginRight: '8px' }} />
            </MyButtonOutline>

            {isUserDropdownOpen && (
              <div className="user-dropdown">
                {localStorage.getItem('token') ? (
                  <>
                    <div className="user-dropdown-email">{localStorage.getItem('userEmail')}</div>

                    <button onClick={() => { setIsProfileOpen(true); setIsUserDropdownOpen(false); }} className="dropdown-item">
                      <Icons.User size={16} /> Мой профиль
                    </button>

                    {isAdminUser && (
                      <>
                        <Link to="/admin" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <Icons.Settings size={16} /> Управление проектами
                        </Link>
                        <Link to="/admin/accounts" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <Icons.Users size={16} /> Аккаунты
                        </Link>
                        <Link to="/admin/contacts" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <Icons.Settings size={16} /> Запросы
                        </Link>
                      </>
                    )}

                    {isManager && (
                      <>
                        <Link to="/admin/accounts" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <Icons.Users size={16} /> Аккаунты
                        </Link>
                        <Link to="/admin/contacts" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <Icons.Settings size={16} /> Запросы
                        </Link>
                      </>
                    )}

                    <Link to="/my-projects" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <Icons.Folder size={16} /> Мои проекты
                    </Link>

                    <button onClick={handleLogout} className="dropdown-item logout">
                      <Icons.Logout size={16} /> Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setIsAuthModalOpen(true); setIsUserDropdownOpen(false); }} className="dropdown-item">
                      <Icons.User size={16} /> Войти
                    </button>
                    <button onClick={() => { setIsAuthModalOpen(true); setIsUserDropdownOpen(false); }} className="dropdown-item">
                      Регистрация
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Оверлей */}
      <div className={`overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} />

      {/* Боковое меню */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={toggleMenu}>
          <FiX size={24} />
        </button>

        <div className="side-logo">
          <a href="/" onClick={handleLinkClick}>
            <img src={logo} alt="Логотип компании" />
          </a>
        </div>

        {isLoggedIn ? (
          <div className="side-user-info">
            <div className="side-user-email">{userData?.email}</div>

            <button onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }} className="dropdown-item">
              <Icons.User size={16} /> Мой профиль
            </button>

            {isAdminUser && (
              <>
                <Link to="/admin" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <Icons.Settings size={16} /> Управление проектами
                </Link>
                <Link to="/admin/accounts" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <Icons.Users size={16} /> Аккаунты
                </Link>
                <Link to="/admin/contacts" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <Icons.Settings size={16} /> Запросы
                </Link>
              </>
            )}

            {isManager && (
              <>
                <Link to="/admin/accounts" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <Icons.Users size={16} /> Аккаунты
                </Link>
                <Link to="/admin/contacts" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  <Icons.Settings size={16} /> Запросы
                </Link>
              </>
            )}

            <Link to="/my-projects" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
              <Icons.Folder size={16} /> Мои проекты
            </Link>

            <button className="side-logout-btn" onClick={handleLogout}>
              {Icons.Logout && <Icons.Logout size={16} />} Выйти
            </button>
          </div>
        ) : (
          <MyButtonOutline
            variant="dark"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setIsAuthModalOpen(true);
              setIsMenuOpen(false);
            }}
          >
            {Icons.User && <Icons.User size={20} color="#C4A484" style={{ marginRight: '8px' }} />}
          </MyButtonOutline>
        )}

        <Link to="/company" className="menu-item" onClick={handleLinkClick}>
          <Typography variant="body" color="dark">О компании</Typography>
        </Link>

        <button onClick={scrollToServices} className="menu-item-link">
          <Typography variant="body" color="dark">Возможности</Typography>
        </button>

        <div className="dropdown">
          <div
            className={`dropdown-header ${openDropdowns.projects ? 'open' : ''}`}
            onClick={() => toggleDropdown('projects')}
          >
            <Typography variant="body" color="dark">{menuData.projects.title}</Typography>
            <FiChevronDown />
          </div>
          <div className={`dropdown-content ${openDropdowns.projects ? 'open' : ''}`}>
            {menuData.projects.links.map((link, index) => (
              <Link key={index} to={link.href} onClick={handleLinkClick}>
                <Typography variant="small" color="light">{link.label}</Typography>
              </Link>
            ))}
          </div>
        </div>

        <div className="dropdown">
          <div
            className={`dropdown-header ${openDropdowns.clients ? 'open' : ''}`}
            onClick={() => toggleDropdown('clients')}
          >
            <Typography variant="body" color="dark">{menuData.clients.title}</Typography>
            <FiChevronDown />
          </div>
          <div className={`dropdown-content ${openDropdowns.clients ? 'open' : ''}`}>
            {menuData.clients.links.map((link, index) => (
              <Link key={index} to={link.href} onClick={handleLinkClick}>
                <Typography variant="small" color="light">{link.label}</Typography>
              </Link>
            ))}
          </div>
        </div>

        <Link to="/contacts" className="menu-item" onClick={handleLinkClick}>
          <Typography variant="body" color="dark">Контакты</Typography>
        </Link>

        <Link to="/calculator" className="btn-calc-link" onClick={handleLinkClick}>
          <MyButtonOutline variant="dark" style={{ marginTop: '1rem', fontSize: '12px' }}>
            Рассчитать стоимость
          </MyButtonOutline>
        </Link>
      </div>

      {/* ✅ Модальное окно с ContactForm */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FiX size={24} />
            </button>
            <ContactForm 
              variant="default"
              title="Есть вопрос?"
              subtitle="Заполните форму, и мы свяжемся с вами"
              buttonText="Отправить"
              onSuccess={closeModal}
            />
          </div>
        </div>
      )}

      {/* AuthModal - окно входа/регистрации */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultMode="login"
      />

      {/* ProfileModal - окно профиля */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={userData}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
};

export default Header;