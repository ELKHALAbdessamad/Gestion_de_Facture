import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton
} from '@mui/material';
import { Close, Refresh, Check, Draw } from '@mui/icons-material';

// Fix pour webpack 5
const SignaturePad = SignatureCanvas.default || SignatureCanvas;

export const SignatureModal = ({ open, onClose, onSave }) => {
  const sigPadRef = useRef(null);

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  const handleSave = () => {
    if (sigPadRef.current?.isEmpty()) {
      return;
    }
    // Retourner l'image base64 PNG
    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(18, 18, 18, 0.97)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 168, 83, 0.3)',
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Draw sx={{ color: '#D4A853' }} />
            <Typography variant="h6" fontWeight={700}>Signature Numérique</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
          Dessinez votre signature dans la zone ci-dessous. Elle sera intégrée dans le PDF de la facture.
        </Typography>

        {/* Zone de dessin */}
        <Box
          sx={{
            border: '2px dashed rgba(212, 168, 83, 0.5)',
            borderRadius: 2,
            background: 'rgba(255,255,255,0.05)',
            cursor: 'crosshair',
            overflow: 'hidden',
          }}
        >
          <SignaturePad
            ref={sigPadRef}
            penColor="#D4A853"
            canvasProps={{
              width: 480,
              height: 180,
              style: {
                display: 'block',
                width: '100%',
                height: '180px',
              }
            }}
            backgroundColor="rgba(0,0,0,0)"
          />
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1, display: 'block' }}>
          Utilisez votre souris ou votre doigt sur écran tactile pour signer
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          startIcon={<Refresh />}
          onClick={handleClear}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.2)',
            '&:hover': { background: 'rgba(255,255,255,0.05)' }
          }}
          variant="outlined"
        >
          Effacer
        </Button>
        <Button
          variant="contained"
          startIcon={<Check />}
          onClick={handleSave}
          sx={{
            background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
            color: '#080807',
            fontWeight: 700,
          }}
        >
          Valider la Signature
        </Button>
      </DialogActions>
    </Dialog>
  );
};
