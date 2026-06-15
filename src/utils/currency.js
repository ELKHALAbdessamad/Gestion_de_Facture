export const DEVISES = [
  { code: 'MAD', label: 'Dirham marocain (MAD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'Dollar US (USD)' },
  { code: 'XOF', label: 'Franc CFA (XOF)' },
];

export const formatMoney = (amount, devise = 'MAD') => {
  const value = parseFloat(amount) || 0;
  return `${value.toFixed(2)} ${devise}`;
};

export const getActiveEntreprise = (parametres) => {
  if (!parametres) return {};
  if (parametres.societes?.length) {
    const index = parametres.societe_active ?? 0;
    return parametres.societes[index] || parametres.entreprise || {};
  }
  return parametres.entreprise || {};
};
