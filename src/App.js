import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Factures } from './pages/Factures';
import { FactureForm } from './pages/FactureForm';
import { FactureDetail } from './pages/FactureDetail';
import { Clients } from './pages/Clients';
import { Articles } from './pages/Articles';
import { Categories } from './pages/Categories';
import { Parametres } from './pages/Parametres';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4A853',
    },
    secondary: {
      main: '#F4D03F',
    },
    background: {
      default: '#080807',
      paper: 'rgba(255, 255, 255, 0.03)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
          color: '#080807',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(212, 168, 83, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
            boxShadow: '0 8px 24px rgba(212, 168, 83, 0.5)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          '&:hover': {
            borderColor: 'rgba(212, 168, 83, 0.5)',
            backgroundColor: 'rgba(212, 168, 83, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
        },
      },
    },
  },
});

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
          style={{ zIndex: 9999 }}
        />
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/factures"
              element={
                <PrivateRoute>
                  <Layout>
                    <Factures />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/factures/nouvelle"
              element={
                <PrivateRoute>
                  <Layout>
                    <FactureForm />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/factures/edit/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <FactureForm />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/factures/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <FactureDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <PrivateRoute>
                  <Layout>
                    <Clients />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/articles"
              element={
                <PrivateRoute adminOnly>
                  <Layout>
                    <Articles />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute adminOnly>
                  <Layout>
                    <Categories />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/parametres"
              element={
                <PrivateRoute adminOnly>
                  <Layout>
                    <Parametres />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
