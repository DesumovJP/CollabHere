"use client";

import { Avatar, Box, Button, Checkbox, Container, Divider, FormControlLabel, IconButton, InputAdornment, Link, Paper, Stack, Tab, Tabs, TextField, Typography, SvgIcon } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [tab, setTab] = useState<'signin'|'signup'>('signin');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const router = useRouter();

  const title = useMemo(() => tab === 'signin' ? 'Welcome Back' : 'Create Account', [tab]);
  const cta = tab === 'signin' ? 'Sign In' : 'Create Account';

  return (
    <Container sx={{ py: 8 }}>
      <AuthGrid>
        {/* Left info column */}
        <StickyInfo gap={3}>
          <Stack direction="row" gap={1.5} alignItems="center">
            <Avatar src={"http://localhost:1337/uploads/no_Filter_726c2c9e9b.webp"} sx={{ width: 40, height: 40 }} />
            <Typography variant="h3" color="#FFFFFF">SaDi Collab</Typography>
          </Stack>
          <Typography variant="subtitle1" color="rgba(255,255,255,0.9)">Fashion Design System</Typography>

          <InfoCard>
            <Typography variant="h6" color="#FFFFFF">Discover Fashion</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.9)">Access exclusive articles, trends, and insights from the world of fashion.</Typography>
          </InfoCard>

          <InfoCard>
            <Typography variant="h6" color="#FFFFFF">Shop Curated Collections</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.9)">Browse hand-picked products from emerging and established brands.</Typography>
          </InfoCard>

          <InfoCard>
            <Typography variant="h6" color="#FFFFFF">Personalized Experience</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.9)">Save your favorites, track orders, and manage your profile.</Typography>
          </InfoCard>
        </StickyInfo>

        {/* Right auth panel */}
        <GlassPanel>
          <PillTabs value={tab} onChange={(_, v) => setTab(v)} aria-label="auth switch" variant="fullWidth">
            <Tab label="Sign In" value="signin" />
            <Tab label="Sign Up" value="signup" />
          </PillTabs>

          <FormArea>
            <Typography variant="h5" color="#FFFFFF" align="center">{title}</Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.9)" align="center" sx={{ mt: 0.5 }}>
              {tab === 'signin' ? 'Sign in to your account to continue' : 'Join Present to unlock exclusive content'}
            </Typography>
            {tab === 'signup' ? (
              <>
                <Typography variant="body2" color="#FFFFFF">Username</Typography>
                <TextField 
                  placeholder="johndoe" 
                  fullWidth 
                  size="medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{ sx: inputStyle, startAdornment: (
                    <InputAdornment position="start"><UserIcon /></InputAdornment>
                  ) }}
                />
              </>
            ) : null}
            <Typography variant="body2" color="#FFFFFF">Email Address</Typography>
            <TextField 
              placeholder="you@example.com" 
              fullWidth 
              size="medium" 
              value={tab === 'signin' ? identifier : email} 
              onChange={(e) => tab === 'signin' ? setIdentifier(e.target.value) : setEmail(e.target.value)}
              InputProps={{ sx: inputStyle, startAdornment: (
                <InputAdornment position="start"><MailIcon /></InputAdornment>
              ) }}
            />
            <Typography variant="body2" color="#FFFFFF">Password</Typography>
            <TextField placeholder="Create a password" type={showPwd? 'text':'password'} fullWidth size="medium" value={password} onChange={(e) => setPassword(e.target.value)}
              InputProps={{ sx: inputStyle, startAdornment: (
                <InputAdornment position="start"><LockIcon /></InputAdornment>
              ), endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(v => !v)} edge="end" aria-label="toggle password visibility" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ) }}
            />
            {tab === 'signup' ? (
              <>
                <Typography variant="body2" color="#FFFFFF">Confirm Password</Typography>
                <TextField 
                  placeholder="Confirm your password" 
                  type={showPwd2? 'text':'password'} 
                  fullWidth 
                  size="medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{ sx: inputStyle, startAdornment: (
                    <InputAdornment position="start"><LockIcon /></InputAdornment>
                  ), endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd2(v => !v)} edge="end" aria-label="toggle password visibility" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {showPwd2 ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                  ) }}
                />
              </>
            ) : null}

            {tab === 'signin' ? (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel control={<Checkbox sx={{ color: 'rgba(255,255,255,0.6)' }} />} label={<Typography variant="body2" color="rgba(255,255,255,0.9)">Remember me</Typography>} />
                <Link href="#" underline="hover" color="#FFFFFF" sx={{ fontSize: '0.875rem' }}>
                  Forgot password?
                </Link>
              </Stack>
            ) : (
              <FormControlLabel control={<Checkbox sx={{ color: 'rgba(255,255,255,0.6)' }} />} label={
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  I agree to the <Link href="#" underline="hover" color="#FFFFFF">Terms of Service</Link> and <Link href="#" underline="hover" color="#FFFFFF">Privacy Policy</Link>
                </Typography>
              } />
            )}
            {error ? (
              <Typography variant="body2" color="#ffb4b4" align="center">{error}</Typography>
            ) : null}
            <PrimaryCta 
              variant="contained" 
              size="large" 
              sx={{ mt: 1 }}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  if (tab === 'signin') {
                    await login({ identifier, password });
                    sessionStorage.setItem('justLoggedIn', 'true');
                  } else {
                    // Validation for signup
                    if (password !== confirmPassword) {
                      throw new Error('Passwords do not match');
                    }
                    if (password.length < 6) {
                      throw new Error('Password must be at least 6 characters');
                    }
                    await register({ username, email, password });
                    sessionStorage.setItem('justLoggedIn', 'true');
                  }
                  router.push('/');
                } catch (e: any) {
                  setError(e?.message || `Failed to ${tab === 'signin' ? 'sign in' : 'register'}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? 'Please wait…' : cta}
            </PrimaryCta>

            <Box sx={{ position: 'relative', my: 3 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.18)' }} />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  px: 1.5,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: 1,
                  borderRadius: 1,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(2px)'
                }}
              >
                {tab === 'signin' ? 'OR CONTINUE WITH' : 'OR SIGN UP WITH'}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <SecondaryBtn fullWidth size="large" startIcon={<GoogleIcon />}>Google</SecondaryBtn>
              <SecondaryBtn fullWidth size="large" startIcon={<GithubIcon />}>GitHub</SecondaryBtn>
            </Stack>
          </FormArea>
        </GlassPanel>
      </AuthGrid>
    </Container>
  );
}

const AuthGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 32,
  alignItems: 'start',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1.2fr 1fr'
  }
}));

const GlassPanel = styled(Paper)(({ theme }) => ({
  padding: 24,
  borderRadius: 16,
  backgroundColor: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.22)',
  backdropFilter: 'blur(12px)',
}));

const StickyInfo = styled(Stack)(({ theme }) => ({
  position: 'sticky',
  top: 24,
  alignSelf: 'start',
  paddingRight: 32,
}));

const InfoCard = styled('div')(({ theme }) => ({
  padding: 20,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(8px)',
  transition: 'transform .2s ease, box-shadow .2s ease',
  boxShadow: '0 12px 24px rgba(31,38,135,0.15)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 24px 38px rgba(31,38,135,0.30)'
  }
}));

const PillTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 44,
  '& .MuiTabs-flexContainer': {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 9999,
    padding: 4,
  },
  '& .MuiTab-root': {
    minHeight: 36,
    borderRadius: 9999,
    color: '#E6EDF3',
    flex: 1,
  },
  '& .Mui-selected': {
    backgroundColor: 'rgba(255,255,255,0.28)',
    color: '#0f1115' as any,
    fontWeight: 700,
  },
  '& .MuiTabs-indicator': { display: 'none' }
}));

const inputStyle = {
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.18)'
};

const FormArea = styled(Stack)(({ theme }) => ({
  gap: 16,
  marginTop: 16,
  justifyContent: 'flex-start'
}));

const PrimaryCta = styled(Button)(({ theme }) => ({
  borderRadius: 9999,
  paddingInline: 20,
  height: 44,
}));

const SecondaryBtn = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.12)',
  color: '#E6EDF3',
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.18)' }
}));

const IconBadge = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.18)'
}));

// SVG Icons (inline for precision with mockup)
function MailIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ color: 'rgba(255,255,255,0.9)' }}>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
    </SvgIcon>
  );
}

function LockIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ color: 'rgba(255,255,255,0.9)' }}>
      <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-7 0H9V9a3 3 0 0 1 6 0v2h-2Z" />
    </SvgIcon>
  );
}

function UserIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ color: 'rgba(255,255,255,0.9)' }}>
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </SvgIcon>
  );
}

function VisibilityIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 12a4.5 4.5 0 1 1 4.5-4.5A4.5 4.5 0 0 1 12 16.5Zm0-7A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Z" />
    </SvgIcon>
  );
}

function VisibilityOffIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 6a9.77 9.77 0 0 1 9 6 9.64 9.64 0 0 1-3 3.73l1.27 1.27-1.41 1.41L4.22 4.22 5.63 2.8l2.2 2.2A9.89 9.89 0 0 1 12 6Zm0 12a9.77 9.77 0 0 1-9-6 9.58 9.58 0 0 1 4-4.5l2.2 2.2a4.5 4.5 0 0 0 6.18 6.18l2.25 2.25A9.89 9.89 0 0 1 12 18Z" />
    </SvgIcon>
  );
}

function GoogleIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" sx={{ color: '#FFFFFF' }}>
      <path d="M21.35 11.1H12v2.8h5.35c-.24 1.5-1.62 4.12-5.35 4.12A6.4 6.4 0 1 1 12 5.2a6 6 0 0 1 3.96 1.46l1.88-1.88A9.25 9.25 0 0 0 12 3 9 9 0 1 0 21 12c0-.3-.02-.6-.05-.9Z" />
    </SvgIcon>
  );
}

function GithubIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 0 0-1.34-1.77c-1.1-.75.08-.74.08-.74a2.5 2.5 0 0 1 1.82 1.23 2.54 2.54 0 0 0 3.47 1 2.55 2.55 0 0 1 .76-1.6c-2.67-.3-5.47-1.34-5.47-5.95A4.67 4.67 0 0 1 6.22 7.2a4.34 4.34 0 0 1 .12-3.21s1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23a4.34 4.34 0 0 1 .12 3.21A4.67 4.67 0 0 1 20 12.1c0 4.62-2.8 5.65-5.48 5.95a2.88 2.88 0 0 1 .82 2.23v3.3c0 .32.21.69.83.58A12 12 0 0 0 12 .5Z" />
    </SvgIcon>
  );
}


