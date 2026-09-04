import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import { LocaleProvider } from './context/LocaleContext';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Cars = lazy(() => import('./pages/Cars'));
const Homes = lazy(() => import('./pages/Homes'));
const HomeDetails = lazy(() => import('./pages/HomeDetails'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const Sell = lazy(() => import('./pages/Sell'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Compare = lazy(() => import('./pages/Compare'));
const Messages = lazy(() => import('./pages/Messages'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminHome = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCars = lazy(() => import('./pages/admin/Cars'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CompareProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute roles={['ADMIN']}>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminHome />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="cars" element={<AdminCars />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                    </Route>
                    <Route element={<MainLayout />}>
                      <Route index element={<Home />} />
                      <Route path="cars" element={<Cars />} />
                      <Route path="cars/:id" element={<CarDetails />} />
                      <Route path="homes" element={<Homes />} />
                      <Route path="homes/:id" element={<HomeDetails />} />
                      <Route path="sell" element={<Sell />} />
                      <Route path="compare" element={<Compare />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                      <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                      <Route path="messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
              </BrowserRouter>
            </ToastProvider>
          </CompareProvider>
        </CurrencyProvider>
      </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
