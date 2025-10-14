"use client";

import Link from "next/link";
import { AppBar, Box, Container, IconButton, Link as MuiLink, Toolbar, Typography, Button } from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [language, setLanguage] = useState<'eng' | 'укр'>('eng');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'eng' ? 'укр' : 'eng');
  };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <Container>
        <Toolbar disableGutters sx={{ display: "grid", gridTemplateColumns: { xs: "1fr auto 1fr" }, alignItems: "center", minHeight: 64 }}>
          {/* Left: Blog / Shop */}
          <Box sx={{ display: "flex", gap: 3 }}>
            <MuiLink component={Link} href="/" color="inherit">Blog</MuiLink>
            <MuiLink component={Link} href="/shop" color="inherit">Shop</MuiLink>
          </Box>

          {/* Center: Brand */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={800}>SaDi</Typography>
          </Box>

          {/* Right: Language Switcher + Icons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, alignItems: "center" }}>
            {mounted && (
              <Button
                onClick={toggleLanguage}
                sx={{
                  color: "inherit",
                  minWidth: "auto",
                  px: 1,
                  py: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: 0,
                  borderBottom: "2px solid transparent",
                  '&:hover': {
                    backgroundColor: "transparent",
                    borderBottom: "2px solid currentColor",
                  }
                }}
              >
                {language}
              </Button>
            )}
            <IconButton color="inherit" aria-label="wishlist">
              <FavoriteBorderOutlinedIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="cart">
              <ShoppingBagOutlinedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}