"use client";

import { Avatar, Box, Button, Container, Divider, Paper, Stack, Typography, Grid, Tabs, Tab, Chip, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@/providers/auth-provider";
import dynamic from "next/dynamic";
import GraphQLTest from "@/components/graphql-test";

const ProtectedRoute = dynamic(() => import("@/components/protected-route"), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#FFFFFF'
    }}>
      Loading...
    </div>
  )
});
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState, useEffect } from "react";

// Стилі для TextField в діалозі
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    color: '#E6EDF3',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 2,
    },
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
      '& fieldset': {
        borderColor: 'rgba(255,255,255,0.4)',
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255,255,255,0.1)',
      '& fieldset': {
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#FFFFFF',
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.75rem',
  },
};

export default function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    location: '',
    avatarUrl: ''
  });
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  // Оновлюємо форму коли user змінюється
  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phoneNumber || '', // З Strapi
        location: user.location || '' // З Strapi
      });
      setAvatar(user.avatarUrl || '');
      console.log('Account page: user updated:', user);
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: user?.location || '',
      avatarUrl: user?.avatarUrl || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: user?.location || '',
      avatarUrl: user?.avatarUrl || ''
    });
  };

  const handleSaveEdit = async () => {
    // Basic validation
    if (!editForm.username.trim()) {
      alert('Username is required');
      return;
    }
    if (!editForm.email.trim()) {
      alert('Email is required');
      return;
    }
    if (!editForm.email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Saving profile with data:', {
        username: editForm.username,
        email: editForm.email,
        location: editForm.location,
        phoneNumber: editForm.phone,
      });

      // Оновлюємо всі поля через updateProfile
      await updateProfile({
        username: editForm.username,
        email: editForm.email,
        location: editForm.location,
        phoneNumber: editForm.phone,
        avatarUrl: editForm.avatarUrl,
      });
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Перевіряємо розмір файлу (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Перевіряємо тип файлу
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Uploading avatar via REST API...');
      
      // 1. Завантажуємо файл через REST API
      const formData = new FormData();
      formData.append('files', file);

      const jwt = localStorage.getItem('auth.jwt');
      console.log('📝 JWT token:', jwt ? jwt.substring(0, 30) + '...' : 'NOT FOUND');
      console.log('📝 File to upload:', { name: file.name, size: file.size, type: file.type });

      // Стандартний Strapi upload (можливо буде EPERM, але URL отримаємо)
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`
        },
        body: formData
      });

      console.log('📡 Upload response status:', uploadResponse.status);
      console.log('📡 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text();
        console.error('❌ Upload error status:', uploadResponse.status);
        console.error('❌ Upload error response:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText };
        }
        
        console.error('❌ Upload error data:', errorData);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorData?.error?.message || errorData?.message || 'Unknown error'}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload success:', uploadResult);
      
      // Стандартний /api/upload повертає масив
      const uploadedFile = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;
      
      if (!uploadedFile || !uploadedFile.url) {
        throw new Error('Upload failed - no file returned');
      }

      const newAvatarUrl = uploadedFile.url;
      
      console.log('🔄 Updating user with new avatarUrl:', newAvatarUrl);
      
      // 2. Оновлюємо User з avatarUrl (не media ID!)
      await updateProfile({
        avatarUrl: newAvatarUrl
      });
      
      setAvatar(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${newAvatarUrl}`);
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      alert(`Error uploading avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ProtectedRoute>
      <Container sx={{ py: 6 }}>
      <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
        ACCOUNT
      </Typography>
      <Typography variant="h3" color="#FFFFFF" sx={{ mb: 2, fontWeight: 800 }}>My Cabinet</Typography>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />
      
      <TabContainer>
        <Tabs 
          value={activeTab} 
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{ mb: 4 }}
        >
          <Tab 
            icon={<PersonOutlineIcon />} 
            label="PROFILE" 
            iconPosition="start"
            sx={{ color: activeTab === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}
          />
          <Tab 
            icon={<ShoppingBagOutlinedIcon />} 
            label="ORDERS" 
            iconPosition="start"
            sx={{ color: activeTab === 1 ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}
          />
          <Tab 
            icon={<FavoriteBorderOutlinedIcon />} 
            label="SAVED" 
            iconPosition="start"
            sx={{ color: activeTab === 2 ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}
          />
          <Tab 
            icon={<SettingsOutlinedIcon />} 
            label="SETTINGS" 
            iconPosition="start"
            sx={{ color: activeTab === 3 ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}
          />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ProfileCard>
                <Stack alignItems="center" spacing={2}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={avatar || "http://localhost:1337/uploads/no_Filter_726c2c9e9b.webp"}
                      sx={{ width: 96, height: 96 }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                        },
                        width: 32,
                        height: 32,
                      }}
                      component="label"
                    >
                      <PhotoCameraIcon sx={{ fontSize: 16 }} />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarUpload}
                      />
                    </IconButton>
                  </Box>
                  <Typography variant="h5" color="#FFFFFF" sx={{ fontWeight: 600 }}>
                    {user?.username || 'Emma Chen'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    {user?.createdAt 
                      ? `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                      : 'Member since January 2024'
                    }
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<EditOutlinedIcon />} 
                    onClick={handleEditClick}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.4)', 
                      color: '#E6EDF3',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                </Stack>
              </ProfileCard>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <InfoCard>
                <Typography variant="h6" color="#FFFFFF" sx={{ mb: 3, fontWeight: 600 }}>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldBox>
                      <FieldLabel>Full Name</FieldLabel>
                      <FieldValue>{user?.username || 'Emma Chen'}</FieldValue>
                    </FieldBox>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldBox>
                      <FieldLabel>Email Address</FieldLabel>
                      <FieldValue>{user?.email || 'emma.chen@example.com'}</FieldValue>
                    </FieldBox>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldBox>
                      <FieldLabel>Phone Number</FieldLabel>
                      <FieldValue>{user?.phoneNumber || editForm.phone || 'Not provided'}</FieldValue>
                    </FieldBox>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldBox>
                      <FieldLabel>Location</FieldLabel>
                      <FieldValue>{user?.location || editForm.location || 'Not provided'}</FieldValue>
                    </FieldBox>
                  </Grid>
                </Grid>
              </InfoCard>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
                <StatCard>
                  <ShoppingBagOutlinedIcon sx={{ color: '#4CAF50', mb: 1, fontSize: 32 }} />
                  <Typography variant="h5" color="#FFFFFF" sx={{ fontWeight: 700 }}>12</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">Total Orders</Typography>
                </StatCard>
                <StatCard>
                  <FavoriteBorderOutlinedIcon sx={{ color: '#E91E63', mb: 1, fontSize: 32 }} />
                  <Typography variant="h5" color="#FFFFFF" sx={{ fontWeight: 700 }}>8</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">Saved Articles</Typography>
                </StatCard>
                <StatCard>
                  <CreditCardIcon sx={{ color: '#FF9800', mb: 1, fontSize: 32 }} />
                  <Typography variant="h5" color="#FFFFFF" sx={{ fontWeight: 700 }}>$1,240</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">Total Spent</Typography>
                </StatCard>
              </Stack>
            </Grid>
          </Grid>
        )}
      </TabContainer>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={isEditing} 
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 33, 48, 0.98) 0%, rgba(42, 45, 58, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#FFFFFF', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          pb: 2,
          pt: 3,
          px: 4,
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ✨ Edit Profile
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                fullWidth
                required
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                fullWidth
                required
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone Number"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                fullWidth
                placeholder="+380 XX XXX XX XX"
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Location"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                fullWidth
                placeholder="Ukraine, Kyiv"
                sx={textFieldStyles}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Avatar URL"
                value={editForm.avatarUrl || ''}
                onChange={(e) => setEditForm({...editForm, avatarUrl: e.target.value})}
                fullWidth
                placeholder="http://localhost:1337/uploads/avatar.jpg"
                helperText="💡 Upload image in Strapi Admin → Media Library, then paste URL here"
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 4, 
          gap: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)',
        }}>
          <Button 
            onClick={handleCancelEdit}
            startIcon={<CancelIcon />}
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
            sx={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              borderRadius: 2,
              px: 4,
              py: 1.2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.25) 100%)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)',
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </ProtectedRoute>
  );
}

const TabContainer = styled(Box)(({ theme }) => ({
  '& .MuiTabs-root': {
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#FFFFFF',
    height: 2,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    minHeight: 48,
    '&.Mui-selected': {
      color: '#FFFFFF',
    },
  },
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: 32,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.22)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.15)',
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: 32,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.22)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.15)',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: 24,
  borderRadius: 16,
  backgroundColor: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.22)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 16px rgba(31,38,135,0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minHeight: 120,
  justifyContent: 'center',
}));

const FieldBox = styled('div')(({ theme }) => ({
  padding: 0,
  marginBottom: 16,
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: '16px !important',
}));

const FieldValue = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: '12px 16px',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.95rem',
  border: '1px solid rgba(255,255,255,0.15)',
}));


