"use client";

import { Container, Divider, Stack, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Container 
      component="footer" 
      sx={{ 
        py: 6,
        flexShrink: 0,
        mt: "auto"
      }}
    >
      <Divider sx={{ mb: 3, opacity: 0.2 }} />
      <Stack alignItems="center">
        <Typography variant="body2">© {new Date().getFullYear()} SaDi. All rights reserved.</Typography>
      </Stack>
    </Container>
  );
}