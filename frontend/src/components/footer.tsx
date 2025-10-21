"use client";

import { Container, Divider, Stack, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Container 
      component="footer" 
      sx={{ 
        py: 6,
        flexShrink: 0,
        mt: "auto",
        backgroundColor: 'transparent',
        backdropFilter: 'none'
      }}
    >
      <Divider sx={{ mb: 3, opacity: 0.2, borderColor: 'rgba(255,255,255,0.25)' }} />
      <Stack alignItems="center">
        <Typography variant="body2" sx={{ color: 'rgba(230,237,243,0.92)' }}>© {new Date().getFullYear()} SaDi. All rights reserved.</Typography>
      </Stack>
    </Container>
  );
}