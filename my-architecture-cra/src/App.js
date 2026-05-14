import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header/Header.jsx';
import Footer from './components/Layout/Footer/Footer.jsx';
import Container from './components/Layout/Container/Container.jsx';
import Calculator from './pages/Calculator/Calculator.jsx';
import AboutCompany from './pages/AboutCompany/AboutCompany.jsx';
import Contacts from './pages/Contacts/Contacts.jsx';
import Office from './pages/Office/Office.jsx';
import MyProjects from './pages/MyProjects/MyProjects.jsx';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage.jsx';
import ProjectPage from './pages/ProjectPage/ProjectPage.jsx';
import MyProjectsNew from './pages/MyProjectsNew/MyProjectsNew.jsx';
import AdminContacts from './pages/Admin/AdminContacts';
import PrivateRoute from './components/UI/PrivateRoute/PrivateRoute.jsx';
import ProjectsEditPage from './pages/adminn/ProjectsEditPage';
import ScrollToTop from './components/UI/ScrollToTop/ScrollToTop.jsx';
import Reviews from './pages/Reviews/Reviews.jsx';
import CalculatorStages from './components/UI/CalculatorStages/CalculatorStages.jsx';
import ProjectForm from './pages/adminn/ProjectForm.jsx';
import ProjectsList from './pages/adminn/ProjectsList';
import ProjectsCreatePage from './pages/adminn/ProjectsCreatePage'; // ⭐ ДОБАВЬТЕ ЭТОТ ИМПОРТ
import AdminAccounts from './pages/adminn/AdminAccounts.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<Container />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/company" element={<AboutCompany />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/office" element={<Office />} />
          <Route path="/my-projects" element={<MyProjectsNew />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/stages" element={<CalculatorStages />} />
          <Route path="/admin/accounts" element={<PrivateRoute adminOnly><AdminAccounts /></PrivateRoute>} />
          {/* Админские маршруты */}
          <Route
            path="/admin/contacts"
            element={
              <PrivateRoute adminOnly={true}>
                <AdminContacts />
              </PrivateRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* ⭐ УПРОЩЕННЫЕ АДМИНСКИЕ МАРШРУТЫ */}
          <Route path="/admin" element={<ProjectsList />} />
          <Route path="/admin/create" element={<ProjectForm />} />
          <Route path="/admin/edit/:id" element={<ProjectsEditPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;