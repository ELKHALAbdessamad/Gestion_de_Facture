import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  People,
  Inventory,
  Category,
  Settings,
  Logout,
  Archive,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContextMongoDB';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

const drawerWidth = 240;

export const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, isAdmin, currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: t('menu.dashboard'), icon: <Dashboard />, path: '/dashboard' },
    { text: t('menu.invoices'), icon: <Receipt />, path: '/factures' },
    { text: 'Archives', icon: <Archive />, path: '/archive' },
    ...(isAdmin ? [
      { text: t('menu.clients'), icon: <People />, path: '/clients' },
      { text: t('menu.articles'), icon: <Inventory />, path: '/articles' },
      { text: t('menu.categories'), icon: <Category />, path: '/categories' },
      { text: t('menu.settings'), icon: <Settings />, path: '/parametres' }
    ] : [
      { text: t('menu.clients'), icon: <People />, path: '/clients' },
    ])
  ];

  const drawer = (
    <Box sx={{ background: '#080807', height: '100%' }}>
      <Toolbar sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          <span className="gradient-text">Nova</span>Fact
        </Typography>
      </Toolbar>
      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.15) 0%, rgba(244, 208, 63, 0.1) 100%)',
                  border: '1px solid rgba(212, 168, 83, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.2) 0%, rgba(244, 208, 63, 0.15) 100%)',
                  }
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#D4A853' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontWeight: location.pathname === item.path ? 600 : 400 
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(8, 8, 7, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {t('dashboard.title')}
          </Typography>
          <LanguageSwitcher />
          <Box 
            sx={{ 
              mr: 2, 
              px: 2, 
              py: 0.5, 
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {currentUser?.email}
            </Typography>
            <Typography variant="caption" className="gradient-text">
              {isAdmin ? t('menu.admin') || 'Administrateur' : t('menu.user') || 'Utilisateur'}
            </Typography>
          </Box>
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<Logout />}
            sx={{
              borderRadius: 2,
              px: 2,
              ml: 2,
              '&:hover': {
                background: 'rgba(212, 168, 83, 0.1)',
                border: '1px solid rgba(212, 168, 83, 0.3)'
              }
            }}
          >
            {t('menu.logout')}
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: '#080807',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: '#080807',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: '#080807',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
