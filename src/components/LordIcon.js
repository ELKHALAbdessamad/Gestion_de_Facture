import React, { useEffect, useRef } from 'react';

export const LordIcon = ({ 
  src, 
  trigger = 'hover', 
  colors = 'primary:#2196f3',
  size = 64,
  delay = 0,
  ...props 
}) => {
  const iconRef = useRef(null);

  useEffect(() => {
    // Charger le script Lordicon si ce n'est pas déjà fait
    if (!window.lottie) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <lord-icon
      ref={iconRef}
      src={src}
      trigger={trigger}
      colors={colors}
      style={{ width: size, height: size }}
      delay={delay}
      {...props}
    />
  );
};

// Icônes prédéfinies pour l'application
export const Icons = {
  // Dashboard
  dashboard: 'https://cdn.lordicon.com/cnpvyndp.json',
  stats: 'https://cdn.lordicon.com/qhviklyi.json',
  chart: 'https://cdn.lordicon.com/fhtaantg.json',
  
  // Factures
  invoice: 'https://cdn.lordicon.com/nocovwne.json',
  receipt: 'https://cdn.lordicon.com/slkvcfos.json',
  document: 'https://cdn.lordicon.com/jgnvfzqg.json',
  pdf: 'https://cdn.lordicon.com/dxjqoygy.json',
  
  // Clients
  user: 'https://cdn.lordicon.com/hrjifpbq.json',
  users: 'https://cdn.lordicon.com/dxjqoygy.json',
  profile: 'https://cdn.lordicon.com/kthelypq.json',
  
  // Articles
  box: 'https://cdn.lordicon.com/jnikqyih.json',
  package: 'https://cdn.lordicon.com/wzwygmng.json',
  product: 'https://cdn.lordicon.com/nocovwne.json',
  
  // Actions
  add: 'https://cdn.lordicon.com/jgnvfzqg.json',
  edit: 'https://cdn.lordicon.com/wuvorxbv.json',
  delete: 'https://cdn.lordicon.com/wpyrrmcq.json',
  download: 'https://cdn.lordicon.com/qhviklyi.json',
  upload: 'https://cdn.lordicon.com/smwmetfi.json',
  save: 'https://cdn.lordicon.com/jgnvfzqg.json',
  
  // Status
  success: 'https://cdn.lordicon.com/oqdmuxru.json',
  error: 'https://cdn.lordicon.com/keaiyjcx.json',
  warning: 'https://cdn.lordicon.com/tdrtiskw.json',
  pending: 'https://cdn.lordicon.com/xzksbhzh.json',
  
  // Navigation
  menu: 'https://cdn.lordicon.com/msoeawqm.json',
  home: 'https://cdn.lordicon.com/cnpvyndp.json',
  settings: 'https://cdn.lordicon.com/lecprnjb.json',
  logout: 'https://cdn.lordicon.com/gwvmctbb.json',
  
  // Money
  money: 'https://cdn.lordicon.com/qhviklyi.json',
  wallet: 'https://cdn.lordicon.com/qhviklyi.json',
  payment: 'https://cdn.lordicon.com/qhviklyi.json',
  
  // Categories
  category: 'https://cdn.lordicon.com/nocovwne.json',
  tag: 'https://cdn.lordicon.com/nocovwne.json',
  
  // Search
  search: 'https://cdn.lordicon.com/kkvxgpti.json',
  filter: 'https://cdn.lordicon.com/fhtaantg.json',
};
