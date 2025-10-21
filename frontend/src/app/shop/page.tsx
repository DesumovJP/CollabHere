"use client";

import React from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Container, Typography, Chip, Stack, Rating, IconButton } from "@mui/material";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/navigation";
import { GlassmorphismBox, GlassmorphismButton } from "@/styles/glassmorphism";

const PRODUCTS_QUERY = gql`
  query Products($limit: Int = 12) {
    products(pagination: { pageSize: $limit }) {
      documentId
      title
      description
      slug
      price
      category
      inStock
      image { url }
    }
  }
`;

export default function CatalogPage() {
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, { variables: { limit: 12 } });
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const products = ((data as any)?.products ?? []).map((item: any) => ({
    id: item.documentId ?? item.id,
    title: item.title,
    price: item.price ?? 0,
    imageUrl: toAbsoluteStrapiUrl(item.image?.url),
    slug: item.slug,
    category: item.category,
    inStock: item.inStock,
    description: item.description,
  }));

  // Get unique categories
  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];
  
  // Filter products by category
  const filteredProducts = selectedCategory 
    ? products.filter((p: any) => p.category === selectedCategory)
    : products;

  return (
    <Box className="page-container" sx={{ 
      minHeight: '100vh',
      background: [
        'radial-gradient(1200px circle at 26% 12%, rgba(144,156,194,0.40), transparent 58%)',
        'radial-gradient(1000px circle at 78% 88%, rgba(118,129,179,0.30), transparent 70%)',
        'linear-gradient(135deg, rgba(144,156,194,0.70) 0%, rgba(118,129,179,0.65) 40%, rgba(64,77,117,0.62) 70%, rgba(24,29,39,0.60) 100%)'
      ].join(', '),
      py: 6
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'left' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Marketplace
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)' }}>
            Discover exclusive collections from top fashion brands
          </Typography>
          
          {/* Filter and Sort Bar */}
          <GlassmorphismBox sx={{ p: 3, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              {/* Category Filters */}
              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600, mr: 1, display: 'flex', alignItems: 'center' }}>
                  Filter by:
                </Typography>
                <Chip
                  label="All"
                  onClick={() => setSelectedCategory(null)}
                  sx={{
                    color: selectedCategory === null ? '#667eea' : '#FFFFFF',
                    bgcolor: selectedCategory === null ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: selectedCategory === null ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                    }
                  }}
                />
                {categories.map((category: string) => (
                  <Chip
                    key={category}
                    label={category.charAt(0).toUpperCase() + category.slice(1)}
                    onClick={() => setSelectedCategory(category)}
                    sx={{
                      color: selectedCategory === category ? '#667eea' : '#FFFFFF',
                      bgcolor: selectedCategory === category ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': {
                        bgcolor: selectedCategory === category ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                      }
                    }}
                  />
                ))}
              </Stack>
              
              {/* Sort Button */}
              <GlassmorphismButton startIcon={<TrendingUpIcon />}>
                Trending First
              </GlassmorphismButton>
            </Stack>
          </GlassmorphismBox>
        </Box>

      {/* Loading State */}
      {loading && (
        <Box className="loading-container" sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">Loading products…</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="error" variant="h6">
            {String(error.message || error)}
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary" variant="h6">
            {selectedCategory 
              ? `No products found in ${selectedCategory} category`
              : "No products found. Make sure items are Published and public permissions allow find."
            }
          </Typography>
        </Box>
      )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)', // 1 on mobile
                sm: 'repeat(2, 1fr)', // 2 on tablet
                lg: 'repeat(3, 1fr)', // 3 on desktop like in the mockup
              },
              gridAutoRows: 'minmax(280px, auto)', // Much more compact height for all cards
              maxWidth: '1400px',
              mx: 'auto',
            }}
          >
            {filteredProducts.map((p: any, index: number) => {
              // Generate random badges for demo
              const badges = ['New', 'Sale', 'Trending'];
              const randomBadge = badges[index % badges.length];
              const isOnSale = randomBadge === 'Sale';
              const originalPrice = isOnSale ? p.price * 1.3 : null;
              
              const isFavorite = favorites.has(p.id);
              
              return (
                <GlassmorphismBox 
                  key={p.id} 
                  onClick={() => router.push(`/shop/${p.slug}`)}
                  sx={{ 
                    p: 0, 
                    overflow: 'hidden', 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      background: 'rgba(255, 255, 255, 0.12)',
                      '& .favorite-button': {
                        opacity: 1,
                        transform: 'scale(1)',
                      }
                    }
                  }}
                >
                  {/* Product Badge */}
                  <Chip
                    label={randomBadge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      zIndex: 1,
                      bgcolor: randomBadge === 'New' ? '#2196F3' : 
                              randomBadge === 'Sale' ? '#F44336' : '#4CAF50',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                  
                  {/* Favorite Button */}
                  <IconButton
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFavorites = new Set(favorites);
                      if (isFavorite) {
                        newFavorites.delete(p.id);
                      } else {
                        newFavorites.add(p.id);
                      }
                      setFavorites(newFavorites);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 2,
                      opacity: 0,
                      transform: 'scale(0.8)',
                      transition: 'all 0.3s ease',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    {isFavorite ? (
                      <FavoriteIcon sx={{ color: '#F44336', fontSize: 20 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    )}
                  </IconButton>
                  
                  {/* Stock Status Badge */}
                  {!p.inStock && (
                    <Chip
                      label="Out of Stock"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1,
                        bgcolor: 'rgba(244, 67, 54, 0.9)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  
                  {/* Product Image */}
                  <Box sx={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </Box>
                  
                  {/* Product Info */}
                  <Box sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    minHeight: 160
                  }}>
                    {/* Content Section - fixed height */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Brand */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          mb: 0.5, 
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {p.category?.charAt(0).toUpperCase() + p.category?.slice(1) || 'Brand'}
                      </Typography>
                      
                      {/* Product Name - 2 lines max */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#FFFFFF', 
                          mb: 1, 
                          fontWeight: 600,
                          fontSize: '1rem',
                          lineHeight: 1.3,
                          height: '2.6em', // Exactly 2 lines
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {p.title}
                      </Typography>
                      
                      {/* Rating - fixed height */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1.5,
                        height: '1.5em'
                      }}>
                        <Rating 
                          value={4.5 + Math.random() * 0.5} 
                          precision={0.1} 
                          size="small" 
                          readOnly
                          sx={{ 
                            '& .MuiRating-iconFilled': { color: '#FFD700' },
                            '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' },
                            fontSize: '1rem'
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            ml: 1, 
                            fontSize: '0.8rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ({Math.floor(Math.random() * 200) + 50})
                        </Typography>
                      </Box>
                      
                      {/* Price - fixed height */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 2,
                        height: '1.5em'
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#FFFFFF', 
                            fontWeight: 700, 
                            fontSize: '1.1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ${p.price.toFixed(2)}
                        </Typography>
                        {isOnSale && originalPrice && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.5)', 
                              textDecoration: 'line-through',
                              fontSize: '0.9rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ${originalPrice.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Add to Cart Button - always at bottom */}
                    <GlassmorphismButton 
                      fullWidth 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic here
                        console.log('Added to cart:', p.title);
                      }}
                      sx={{ 
                        background: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '0.9rem',
                        py: 1,
                        mt: 'auto',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        }
                      }}
                    >
                      Add to Cart
                    </GlassmorphismButton>
                  </Box>
                </GlassmorphismBox>
              );
            })}
          </Box>
        )}

        {/* Results Count */}
        {!loading && !error && filteredProducts.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Showing {filteredProducts.length} of {products.length} products
              {selectedCategory && ` in ${selectedCategory} category`}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
