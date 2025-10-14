"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Container, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import Card from "@/components/card";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";

const ARTICLES_QUERY = gql`
  query Articles($limit: Int = 50) {
    articles(pagination: { pageSize: $limit }) {
      documentId
      title
      description
      publishedAt
      slug
      cover { url }
      category { name }
      author { name }
      displaySize
    }
    categories {
      documentId
      name
      description
    }
  }
`;

export default function BlogPage() {
  const { data } = useQuery(ARTICLES_QUERY, { variables: { limit: 50 } });
  const [activeCategory, setActiveCategory] = useState<string>("Latest");

  const itemsRaw = ((data as any)?.articles ?? []).map((a: any) => ({
    id: a.documentId ?? a.id,
    title: a.title,
    excerpt: a.description,
    imageUrl: toAbsoluteStrapiUrl(a.cover?.url),
    category: a.category?.name ?? undefined,
    author: a.author?.name ?? undefined,
    publishedAt: a.publishedAt,
    slug: a.slug,
    displaySize: a.displaySize,
  }));

  const items = useMemo(() => {
    return [...itemsRaw].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [itemsRaw]);

  const categories = useMemo(() => {
    const cats = ((data as any)?.categories ?? []) as any[];
    return cats.map(c => ({ id: c.documentId ?? c.id, name: c.name, description: c.description }));
  }, [data]);

  const filtered = useMemo(() => {
    if (activeCategory === "Latest") return items;
    return items.filter(it => it.category === activeCategory);
  }, [items, activeCategory]);

  return (
    <Container sx={{ py: 6 }}>
      <Box sx={{ display: "flex", gap: 3, alignItems: "center", mb: 4, borderBottom: "1px solid rgba(255,255,255,0.08)", pb: 1, flexWrap: "wrap" }}>
        {(["Latest", ...categories.map(c => c.name)] as string[]).map((cat, idx) => (
          <Typography
            key={cat}
            role="button"
            tabIndex={0}
            variant="button"
            color={activeCategory===cat?"inherit":"text.secondary"}
            onClick={() => setActiveCategory(cat)}
            sx={{ position: "relative", cursor: "pointer", opacity: activeCategory===cat?1:0.7, '&:hover': { color: "inherit", '&::after': { width: "100%" } }, '&::after': { content: '""', position: "absolute", left: 0, bottom: -6, height: 2, width: activeCategory===cat?"100%":"0%", transition: "width .2s", backgroundColor: "currentColor" } }}
          >
            {cat}
          </Typography>
        ))}
      </Box>
      {activeCategory !== "Latest" && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 5, maxWidth: 900, lineHeight: 1.7 }}>
          {categories.find(c => c.name === activeCategory)?.description || ''}
        </Typography>
      )}

      {(() => {
        const source = filtered;
        const larges = source.filter((x: any) => x.displaySize === "large");
        const mediums = source.filter((x: any) => x.displaySize === "medium");
        const smalls = source.filter((x: any) => x.displaySize === "small" || !x.displaySize);

        const blocks: JSX.Element[] = [];
        let li = 0, mi = 0, si = 0, step = 0;
        while (li < larges.length || mi < mediums.length || si < smalls.length) {
          if (li < larges.length) {
            const hero = larges[li++];
            blocks.push(
              <Box key={`hero-${step}-${hero.id}`} sx={{ mb: 4 }}>
                <Card
                  variant="blog"
                  title={hero.title}
                  excerpt={hero.excerpt}
                  imageUrl={hero.imageUrl}
                  category={hero.category}
                  author={hero.author}
                  publishedAt={new Date(hero.publishedAt).toLocaleDateString()}
                  href={`/blog/${hero.slug}`}
                  size="large"
                  hero
                />
              </Box>
            );
          }

          if (mi < mediums.length || si < smalls.length) {
            const m = mi < mediums.length ? mediums[mi++] : undefined;
            const pair = [ smalls[si++], smalls[si++] ].filter(Boolean) as any[];

            if (m) {
              blocks.push(
                <Box key={`row-${step}`} sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, mb: 4 }}>
                  <Box>
                    <Card
                      variant="blog"
                      title={m.title}
                      excerpt={m.excerpt}
                      imageUrl={m.imageUrl}
                      category={m.category}
                      author={m.author}
                      href={`/blog/${m.slug}`}
                      size="medium"
                      publishedAt={new Date(m.publishedAt).toLocaleDateString()}
                    />
                  </Box>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" } }}>
                    {pair.map((s: any) => (
                      <Card
                        key={s.id}
                        variant="blog"
                        title={s.title}
                        excerpt={undefined}
                        imageUrl={s.imageUrl}
                        category={s.category}
                        author={s.author}
                        href={`/blog/${s.slug}`}
                        size="small"
                        publishedAt={new Date((s as any).date || s.publishedAt).toLocaleDateString()}
                      />
                    ))}
                  </Box>
                </Box>
              );
            } else if (pair.length) {
              blocks.push(
                <Box key={`row-${step}`} sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, mb: 4 }}>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" } }}>
                    {pair.map((s: any) => (
                      <Card
                        key={s.id}
                        variant="blog"
                        title={s.title}
                        excerpt={undefined}
                        imageUrl={s.imageUrl}
                        category={s.category}
                        author={s.author}
                        href={`/blog/${s.slug}`}
                        size="small"
                        publishedAt={new Date(s.publishedAt).toLocaleDateString()}
                      />
                    ))}
                  </Box>
                  <Box />
                </Box>
              );
            }
          }

          step++;
        }
        return blocks;
      })()}
    </Container>
  );
}


