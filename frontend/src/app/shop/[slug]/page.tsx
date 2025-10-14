"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { use } from "react";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";

const PRODUCT_QUERY = gql`
  query Product($slug: String!) {
    products(filters: { slug: { eq: $slug } }, pagination: { pageSize: 1 }) {
      title
      description
      price
      image { url }
    }
  }
`;

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { data } = useQuery(PRODUCT_QUERY, { variables: { slug: resolvedParams.slug } });
  const p = (data as any)?.products?.[0];
  if (!p) return null;

  const imageUrl = toAbsoluteStrapiUrl(p.image?.url);

  return (
    <Container sx={{ py: 6 }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={4}>
        <Box sx={{ position: "relative", width: { xs: "100%", md: 480 }, aspectRatio: "4 / 5", borderRadius: 2, overflow: "hidden" }}>
          {imageUrl ? <Image src={imageUrl} alt={p.title} fill style={{ objectFit: "cover" }} /> : null}
        </Box>
        <Stack gap={2} sx={{ flex: 1 }}>
          <Typography variant="h4">{p.title}</Typography>
          <Typography variant="h6" color="text.secondary">${p.price?.toFixed?.(2) ?? "0.00"}</Typography>
          <Typography variant="body1">{p.description}</Typography>
          <Button size="large" variant="contained">Add to cart</Button>
        </Stack>
      </Stack>
    </Container>
  );
}




