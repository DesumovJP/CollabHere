"use client";

import Link from "next/link";
import { AppBar, Box, Container, IconButton, Link as MuiLink, Toolbar, Typography, Button, Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Logout from '@mui/icons-material/Logout';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: 'transparent !important', boxShadow: 'none !important', backdropFilter: 'none !important' }}>
      <Container sx={{ backgroundColor: 'transparent !important' }}>
        <Toolbar disableGutters sx={{ display: "flex", alignItems: "center", minHeight: 64, color: 'rgba(230,237,243,0.96)' }}>
          {/* Left: Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <Avatar src={"http://localhost:1337/uploads/no_Filter_726c2c9e9b.webp"} sx={{ width: 28, height: 28 }} />
            <Typography variant="h6" fontWeight={800}>SaDi Collab</Typography>
          </Box>

          {/* Right: Nav links + auth */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <MuiLink component={Link} href="/" color="inherit">Blog</MuiLink>
            <MuiLink component={Link} href="/shop" color="inherit">Shop</MuiLink>
            {isAuthenticated ? (
              <>
                <IconButton color="inherit" aria-label="profile" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <Avatar 
                    src={user?.avatarUrl ? (
                      user.avatarUrl.startsWith('http') 
                        ? user.avatarUrl 
                        : `http://localhost:1337${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`
                    ) : undefined}
                    sx={{ width: 28, height: 28 }}
                  >
                    {!user?.avatarUrl && (user?.username?.[0]?.toUpperCase() || 'U')}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem component={Link as any} href="/account" onClick={() => setAnchorEl(null)}>
                    <ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>
                    Account
                  </MenuItem>
                  <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <RoundButton component={Link as any} href="/auth" variant="outlined" size="small">Sign In</RoundButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

const RoundButton = styled(Button)(({ theme }) => ({
  borderRadius: 9999,
  paddingInline: 16,
  height: 32,
  color: 'inherit',
  borderColor: 'rgba(255,255,255,0.4)',
  textTransform: 'none',
  '&:hover': {
    borderColor: 'rgba(255,255,255,0.6)'
  }
}));