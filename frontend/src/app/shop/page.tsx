"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Container, Typography } from "@mui/material";
import Card from "@/components/card";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";

const PRODUCTS_QUERY = gql`
  query Products($limit: Int = 12) {
    products(pagination: { pageSize: $limit }) {
      documentId
      title
      description
      slug
      price
      image { url }
    }
  }
`;

export default function CatalogPage() {
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, { variables: { limit: 12 } });

  const products = ((data as any)?.products ?? []).map((item: any) => ({
    id: item.documentId ?? item.id,
    title: item.title,
    price: item.price ?? 0,
    imageUrl: toAbsoluteStrapiUrl(item.image?.url),
    slug: item.slug,
  }));

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>Shop</Typography>
      {loading && <Typography color="text.secondary">Loading products…</Typography>}
      {error && <Typography color="error">{String(error.message || error)}</Typography>}
      {!loading && !error && products.length === 0 && (
        <Typography color="text.secondary">No products found. Make sure items are Published and public permissions allow find.</Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // 2 on mobile
            sm: 'repeat(3, 1fr)', // 3 on tablet
            md: 'repeat(4, 1fr)', // 4 on desktop
          },
        }}
      >
        {products.map((p: any) => (
          <Box key={p.id}>
            <Card
              variant="product"
              title={p.title}
              price={p.price}
              imageUrl={p.imageUrl}
              href={`/shop/${p.slug}`}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}




