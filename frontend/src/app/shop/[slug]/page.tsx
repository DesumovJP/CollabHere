"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Button, Container, Stack, Typography, Grid, Rating, IconButton, Link } from "@mui/material";
import Image from "next/image";
import { use, useState, useEffect } from "react";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { GlassmorphismBox, GlassmorphismButton } from "@/styles/glassmorphism";

const PRODUCT_QUERY = gql`
  query Product($slug: String!) {
    products(filters: { slug: { eq: $slug } }, pagination: { pageSize: 1 }) {
      title
      description
      price
      image { url }
      gallery {
        url
      }
      category
      inStock
    }
  }
`;

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { data, loading, error } = useQuery(PRODUCT_QUERY, { variables: { slug: resolvedParams.slug } });
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Generate stable random values for price and sales
  const [randomValues] = useState(() => ({
    isOnSale: Math.random() > 0.5,
    soldCount: Math.floor(Math.random() * 2000) + 500,
    rating: 4.5 + Math.random() * 0.5
  }));
  
  const p = (data as any)?.products?.[0];
  const imageUrl = toAbsoluteStrapiUrl(p?.image?.url);
  const galleryImages = p?.gallery?.map((img: any) => toAbsoluteStrapiUrl(img.url)) || [];
  const allImages = [imageUrl, ...galleryImages].filter(Boolean);
  const currentImage = allImages[selectedImageIndex] || imageUrl;
  
  if (loading) return (
    <Container className="loading-container" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="rgba(255,255,255,0.7)">Loading product...</Typography>
    </Container>
  );
  
  if (error || !p) return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="error">Product not found</Typography>
    </Container>
  );
  
  const originalPrice = p.price * 1.3;
  const isOnSale = randomValues.isOnSale;

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }} className="page-container">
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Link 
          href="/" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none',
            '&:hover': { color: '#FFFFFF', textDecoration: 'underline' }
          }}
        >
          Homepage
        </Link>
        <Typography component="span" sx={{ color: 'rgba(255,255,255,0.7)', mx: 1 }}>
          {'>'}
        </Typography>
        <Link 
          href="/shop" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none',
            '&:hover': { color: '#FFFFFF', textDecoration: 'underline' }
          }}
        >
          Shop
        </Link>
        <Typography component="span" sx={{ color: 'rgba(255,255,255,0.7)', mx: 1 }}>
          {'>'}
        </Typography>
        <Link 
          href={`/shop?category=${p.category?.toLowerCase()}`}
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none',
            '&:hover': { color: '#FFFFFF', textDecoration: 'underline' }
          }}
        >
          {p.category}
        </Link>
        <Typography component="span" sx={{ color: 'rgba(255,255,255,0.7)', mx: 1 }}>
          {'>'}
        </Typography>
        <Typography component="span" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          {p.title}
        </Typography>
      </Box>
      
      <Grid container spacing={8}>
        {/* Product Images - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            {/* Main Image */}
            <Box sx={{ position: 'relative', aspectRatio: '4/5', borderRadius: 2, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={p.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  bgcolor: '#f0f0f0',
                  color: '#666'
                }}>
                  <Typography variant="h6">No Image Available</Typography>
                </Box>
              )}
              

              {/* Action Buttons */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => setIsFavorite(!isFavorite)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: isFavorite ? '#f44336' : '#666',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                  }}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
            </Box>
            
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, justifyContent: 'center' }}>
                  {allImages.map((img, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? '2px solid #000' : '2px solid transparent',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          borderColor: selectedImageIndex === index ? '#000' : 'rgba(0,0,0,0.5)'
                        }
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${p.title} ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Box>
                
                {/* Image Counter */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                    {selectedImageIndex + 1} / {allImages.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Grid>
        
        {/* Product Details - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={4}>
            {/* Brand */}
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {p.category || 'Brand'}
            </Typography>
            
            {/* Product Name */}
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 600, lineHeight: 1.2 }}>
              {p.title}
            </Typography>
            
            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isOnSale && (
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>
                  ${originalPrice.toFixed(2)}
                </Typography>
              )}
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                ${p.price?.toFixed?.(2) ?? "0.00"}
              </Typography>
            </Box>
            
            {/* Sales & Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {randomValues.soldCount} Sold
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating 
                  value={randomValues.rating} 
                  precision={0.1} 
                  size="small" 
                  readOnly
                  sx={{ 
                    '& .MuiRating-iconFilled': { color: '#FFD700' },
                    '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' }
                  }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {randomValues.rating.toFixed(1)}
                </Typography>
              </Box>
            </Box>
            
            {/* Description */}
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              {p.description}
            </Typography>
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={3} sx={{ pt: 3 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  flex: 1,
                  bgcolor: '#000000',
                  color: '#FFFFFF',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#333333' }
                }}
              >
                Add To Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  flex: 1,
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Checkout Now
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
