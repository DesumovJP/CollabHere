"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { use } from "react";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";

const ARTICLE_QUERY = gql`
  query Article($slug: String!) {
    articles(filters: { slug: { eq: $slug } }, pagination: { pageSize: 1 }) {
      title
      description
      publishedAt
      cover { url }
      category { name }
      author { name }
    }
  }
`;

export default function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { data } = useQuery(ARTICLE_QUERY, { variables: { slug: resolvedParams.slug } });
  const a = (data as any)?.articles?.[0];

  if (!a) return null;

  const imageUrl = toAbsoluteStrapiUrl(a.cover?.url);

  return (
    <Container sx={{ py: 6 }}>
      <Stack gap={2}>
        <Typography variant="overline" color="text.secondary">{a.category?.name}</Typography>
        <Typography variant="h3">{a.title}</Typography>
        <Typography variant="subtitle1">{a.description}</Typography>
        {imageUrl ? (
          <Box sx={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 2, overflow: "hidden" }}>
            <Image src={imageUrl} alt={a.title} fill style={{ objectFit: "cover" }} />
          </Box>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          Published {new Date(a.publishedAt).toLocaleDateString()} • By {a.author?.name ?? "Unknown"}
        </Typography>
      </Stack>
    </Container>
  );
}


