/**
 * Charge le logo NovaFact et retire le fond noir (remplace les pixels sombres par transparent)
 */
export const loadLogoBase64 = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Supprimer le fond noir : rendre transparents les pixels très sombres
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Si le pixel est très sombre (fond noir), le rendre transparent
        if (r < 40 && g < 40 && b < 40) {
          data[i + 3] = 0; // alpha = 0 (transparent)
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = `${window.location.origin}/NovaFact1.png`;
  });
};
