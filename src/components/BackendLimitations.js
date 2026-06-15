import React from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Divider
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { AnimatedCard } from './AnimatedCard';

const LIMITATIONS = [
  {
    point: 'Envoi email automatique sans intervention',
    note: 'Utilise mailto: — suffisant pour démo PFA',
  },
  {
    point: 'JWT réel',
    note: 'localStorage démo — Firebase Auth activable',
  },
  {
    point: 'Archivage annuel',
    note: 'Besoin stockage cloud supplémentaire',
  },
  {
    point: 'Multi-devise / Multi-société',
    note: 'Architecture future V2',
  },
];

export const BackendLimitations = () => (
  <AnimatedCard delay={100}>
    <Paper className="bento-card" sx={{ p: 4, borderRadius: 3, mt: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <InfoOutlined sx={{ color: '#D4A853' }} />
        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
          Limites (nécessitent un backend serveur)
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
        Fonctionnalités disponibles en mode démo — version production à venir en V2
      </Typography>
      <Divider sx={{ borderColor: 'rgba(212,168,83,0.2)', mb: 2 }} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#D4A853', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' }}>
                Point
              </TableCell>
              <TableCell sx={{ color: '#D4A853', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' }}>
                Note
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {LIMITATIONS.map((row) => (
              <TableRow key={row.point} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.08)', fontWeight: 500 }}>
                  {row.point}
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.65)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </AnimatedCard>
);
