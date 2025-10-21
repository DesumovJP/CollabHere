"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Box, Container, Typography, Modal, Stack, IconButton, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Card from "@/components/card";
import { toAbsoluteStrapiUrl } from "@/lib/strapi";
import { useAuth } from "@/providers/auth-provider";

const ARTICLES_QUERY = gql`
  query Articles($limit: Int = 50) {
    articles(pagination: { pageSize: $limit }) {
      documentId
      title
      description
      date
      slug
      cover { url }
      category { name }
      author { 
        name 
        avatar { url }
      }
    }
    categories {
      documentId
      name
      description
    }
  }
`;

export default function BlogPage() {
  const { data, loading, error } = useQuery(ARTICLES_QUERY, { variables: { limit: 50 } });
  const { user, isAuthenticated, jwt } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("Latest");
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedFromQuery = searchParams?.get("post") || null;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(selectedFromQuery);

  // keep local state in sync with URL changes (back/forward/direct link)
  useEffect(() => {
    setSelectedSlug(selectedFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFromQuery]);

  // Show welcome message after login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user just logged in (you can use sessionStorage or URL params)
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn) {
        setShowWelcome(true);
        sessionStorage.removeItem('justLoggedIn');
        // Auto-hide welcome after 5 seconds
        setTimeout(() => setShowWelcome(false), 5000);
      }
    }
  }, [isAuthenticated, user]);

  const openArticle = (slug: string) => {
    setSelectedSlug(slug);
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.set("post", slug);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const closeArticle = () => {
    setSelectedSlug(null);
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.delete("post");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };


  const itemsRaw = ((data as any)?.articles ?? []).map((a: any) => ({
    id: a.documentId ?? a.id,
    title: a.title,
    excerpt: a.description,
    imageUrl: toAbsoluteStrapiUrl(a.cover?.url),
    category: a.category?.name ?? undefined,
    author: a.author?.name ?? undefined,
    authorAvatar: toAbsoluteStrapiUrl(a.author?.avatar?.url),
    date: a.date,
    slug: a.slug,
  }));

  const items = useMemo(() => {
    return [...itemsRaw].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [itemsRaw]);

  // Group articles by week
  const groupByWeek = (articles: any[]) => {
    const weeks = new Map<string, any[]>();
    
    articles.forEach(article => {
      if (!article.date) return;
      
      const date = new Date(article.date);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday as start of week
      startOfWeek.setHours(0, 0, 0, 0);
      
      const weekKey = startOfWeek.toISOString();
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, []);
      }
      weeks.get(weekKey)!.push(article);
    });
    
    // Sort weeks by date (newest first)
    return Array.from(weeks.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([weekKey, articles]) => ({
        weekStart: new Date(weekKey),
        articles
      }));
  };

  const categories = useMemo(() => {
    const cats = ((data as any)?.categories ?? []) as any[];
    return cats.map(c => ({ id: c.documentId ?? c.id, name: c.name, description: c.description }));
  }, [data]);

  const filtered = useMemo(() => {
    if (activeCategory === "Latest") return items;
    return items.filter(it => it.category === activeCategory);
  }, [items, activeCategory]);

  const weeklyGroups = useMemo(() => {
    return groupByWeek(filtered);
  }, [filtered]);

  if (loading) {
    return (
      <BlogPageRoot className="page-container">
        <Container sx={{ py: 6, minHeight: '100vh' }}>
          <Box className="loading-skeleton">
            <Typography variant="h6" color="rgba(255,255,255,0.7)">Loading articles...</Typography>
          </Box>
        </Container>
      </BlogPageRoot>
    );
  }

  return (
    <BlogPageRoot className="page-container">
      <Container sx={{ py: 6, minHeight: '100vh' }}>
        {isAuthenticated && user && showWelcome && (
          <WelcomeBox>
            <Typography variant="h4" color="#FFFFFF" sx={{ fontWeight: 600, mb: 1 }}>
              Доброго дня, {user.username}! 👋
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.8)" sx={{ mb: 3 }}>
              Ласкаво просимо до нашого блогу! Ось найсвіжіші статті для вас.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/account')}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.4)', 
                color: '#FFFFFF',
                '&:hover': {
                  borderColor: '#FFFFFF',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Мій кабінет
            </Button>
          </WelcomeBox>
        )}
        
        <Box sx={{ display: "flex", gap: 3, alignItems: "center", mb: 4, borderBottom: "1px solid rgba(255,255,255,0.28)", pb: 1, flexWrap: "wrap" }}>
          {(["Latest", ...categories.map(c => c.name)] as string[]).map((cat, idx) => (
            <Typography
              key={cat}
              role="button"
              tabIndex={0}
              variant="button"
              color={activeCategory===cat?"#FFFFFF":"rgba(255,255,255,0.86)"}
              onClick={() => setActiveCategory(cat)}
              sx={{ position: "relative", cursor: "pointer", opacity: activeCategory===cat?1:0.7, '&:hover': { color: "inherit", '&::after': { width: "100%" } }, '&::after': { content: '""', position: "absolute", left: 0, bottom: -6, height: 2, width: activeCategory===cat?"100%":"0%", transition: "width .2s", backgroundColor: "#909CC2" } }}
            >
              {cat}
            </Typography>
          ))}
        </Box>
      {activeCategory !== "Latest" && (
        <Typography variant="body2" color="#FFFFFF" sx={{ mt: 2, mb: 5, maxWidth: 900, lineHeight: 1.85 }}>
          {categories.find(c => c.name === activeCategory)?.description || ''}
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          {weeklyGroups.map((week, weekIdx) => {
            const { weekStart, articles } = week;
            const count = articles.length;
            
            return (
              <Box key={weekIdx} sx={{ mb: 4, position: 'relative' }}>
                {/* White horizontal line between weeks */}
                {weekIdx > 0 && (
                  <Box sx={{ 
                    width: '100%', 
                    height: '1px', 
                    bgcolor: 'rgba(255,255,255,0.3)', 
                    mt: 4,
                    mb: 6 
                  }} />
                )}

            {/* 1 article: full width large */}
            {count === 1 && (
              <BlogCard>
                <Card
                  variant="blog"
                  title={articles[0].title}
                  excerpt={articles[0].excerpt}
                  imageUrl={articles[0].imageUrl}
                  category={articles[0].category}
                  author={articles[0].author}
                  authorAvatar={articles[0].authorAvatar}
                  publishedAt={articles[0].date ? new Date(articles[0].date).toLocaleDateString() : undefined}
                  onClick={() => openArticle(articles[0].slug)}
                  size="large"
                  hero
                />
              </BlogCard>
            )}

            {/* 2 articles: 50% width each */}
            {count === 2 && (
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "stretch" }}>
                {articles.map((article: any) => (
                  <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                    <Card
                      variant="blog"
                      title={article.title}
                      excerpt={article.excerpt}
                      imageUrl={article.imageUrl}
                      category={article.category}
                      author={article.author}
                      authorAvatar={article.authorAvatar}
                      publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                      onClick={() => openArticle(article.slug)}
                      size="medium"
                    />
                  </BlogCard>
                ))}
              </Box>
            )}

            {/* 3 articles: 1 medium left (66%) + 2 small right (33%) */}
            {count === 3 && (
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, alignItems: "stretch" }}>
                <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                  <Card
                    variant="blog"
                    title={articles[0].title}
                    excerpt={articles[0].excerpt}
                    imageUrl={articles[0].imageUrl}
                    category={articles[0].category}
                    author={articles[0].author}
                    authorAvatar={articles[0].authorAvatar}
                    publishedAt={articles[0].date ? new Date(articles[0].date).toLocaleDateString() : undefined}
                    onClick={() => openArticle(articles[0].slug)}
                    size="medium"
                  />
                </BlogCard>
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" }, alignItems: "stretch" }}>
                  {articles.slice(1, 3).map((article: any) => (
                    <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                      <Card
                        variant="blog"
                        title={article.title}
                        excerpt={undefined}
                        imageUrl={article.imageUrl}
                        category={article.category}
                        author={article.author}
                        authorAvatar={article.authorAvatar}
                        publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                        onClick={() => openArticle(article.slug)}
                        size="small"
                      />
                    </BlogCard>
                  ))}
                </Box>
              </Box>
            )}

            {/* 4 articles: 1 large on top, 3 smaller below */}
            {count === 4 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* First row: 1 large article */}
                <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                  <Card
                    variant="blog"
                    title={articles[0].title}
                    excerpt={articles[0].excerpt}
                    imageUrl={articles[0].imageUrl}
                    category={articles[0].category}
                    author={articles[0].author}
                    authorAvatar={articles[0].authorAvatar}
                    publishedAt={articles[0].date ? new Date(articles[0].date).toLocaleDateString() : undefined}
                    onClick={() => openArticle(articles[0].slug)}
                    size="large"
                    hero
                  />
                </BlogCard>
                {/* Second row: 3 articles in a row */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, alignItems: "stretch" }}>
                  {articles.slice(1, 4).map((article: any) => (
                    <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                      <Card
                        variant="blog"
                        title={article.title}
                        excerpt={undefined}
                        imageUrl={article.imageUrl}
                        category={article.category}
                        author={article.author}
                        authorAvatar={article.authorAvatar}
                        publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                        onClick={() => openArticle(article.slug)}
                        size="small"
                      />
                    </BlogCard>
                  ))}
                </Box>
              </Box>
            )}

            {/* 5 articles: First row like 3 articles, second row 2 articles */}
            {count === 5 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* First row: 1 medium + 2 small */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, alignItems: "stretch" }}>
                  <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                    <Card
                      variant="blog"
                      title={articles[0].title}
                      excerpt={articles[0].excerpt}
                      imageUrl={articles[0].imageUrl}
                      category={articles[0].category}
                      author={articles[0].author}
                      authorAvatar={articles[0].authorAvatar}
                      publishedAt={articles[0].date ? new Date(articles[0].date).toLocaleDateString() : undefined}
                      onClick={() => openArticle(articles[0].slug)}
                      size="medium"
                    />
                  </BlogCard>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" }, alignItems: "stretch" }}>
                    {articles.slice(1, 3).map((article: any) => (
                      <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                        <Card
                          variant="blog"
                          title={article.title}
                          excerpt={undefined}
                          imageUrl={article.imageUrl}
                          category={article.category}
                          author={article.author}
                          authorAvatar={article.authorAvatar}
                          publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                          onClick={() => openArticle(article.slug)}
                          size="small"
                        />
                      </BlogCard>
                    ))}
                  </Box>
                </Box>
                {/* Second row: 2 articles at 50% width */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "stretch" }}>
                  {articles.slice(3, 5).map((article: any) => (
                    <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                      <Card
                        variant="blog"
                        title={article.title}
                        excerpt={article.excerpt}
                        imageUrl={article.imageUrl}
                        category={article.category}
                        author={article.author}
                        authorAvatar={article.authorAvatar}
                        publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                        onClick={() => openArticle(article.slug)}
                        size="medium"
                      />
                    </BlogCard>
                  ))}
                </Box>
              </Box>
            )}

            {/* 6 articles: Two rows of 3, second row is mirrored */}
            {count === 6 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* First row: 1 medium left + 2 small right */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, alignItems: "stretch" }}>
                  <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                    <Card
                      variant="blog"
                      title={articles[0].title}
                      excerpt={articles[0].excerpt}
                      imageUrl={articles[0].imageUrl}
                      category={articles[0].category}
                      author={articles[0].author}
                      authorAvatar={articles[0].authorAvatar}
                      publishedAt={articles[0].date ? new Date(articles[0].date).toLocaleDateString() : undefined}
                      onClick={() => openArticle(articles[0].slug)}
                      size="medium"
                    />
                  </BlogCard>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" }, alignItems: "stretch" }}>
                    {articles.slice(1, 3).map((article: any) => (
                      <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                        <Card
                          variant="blog"
                          title={article.title}
                          excerpt={undefined}
                          imageUrl={article.imageUrl}
                          category={article.category}
                          author={article.author}
                          authorAvatar={article.authorAvatar}
                          publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                          onClick={() => openArticle(article.slug)}
                          size="small"
                        />
                      </BlogCard>
                    ))}
                  </Box>
                </Box>
                {/* Second row: 2 small left + 1 medium right (mirrored) */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, alignItems: "stretch" }}>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" }, alignItems: "stretch" }}>
                    {articles.slice(3, 5).map((article: any) => (
                      <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                        <Card
                          variant="blog"
                          title={article.title}
                          excerpt={undefined}
                          imageUrl={article.imageUrl}
                          category={article.category}
                          author={article.author}
                          authorAvatar={article.authorAvatar}
                          publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                          onClick={() => openArticle(article.slug)}
                          size="small"
                        />
                      </BlogCard>
                    ))}
                  </Box>
                  <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                    <Card
                      variant="blog"
                      title={articles[5].title}
                      excerpt={articles[5].excerpt}
                      imageUrl={articles[5].imageUrl}
                      category={articles[5].category}
                      author={articles[5].author}
                      authorAvatar={articles[5].authorAvatar}
                      publishedAt={articles[5].date ? new Date(articles[5].date).toLocaleDateString() : undefined}
                      onClick={() => openArticle(articles[5].slug)}
                      size="medium"
                    />
                  </BlogCard>
                </Box>
              </Box>
            )}

            {/* 7 articles: Top like 4 articles, bottom like 3 articles */}
            {count === 7 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* First row: 1 large article */}
                <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                  <Card
                    variant="blog"
                    title={articles[0].title}
                    excerpt={articles[0].excerpt}
                    imageUrl={articles[0].imageUrl}
                    category={articles[0].category}
                    author={articles[0].author}
                    authorAvatar={articles[0].authorAvatar}
                    publishedAt={articles[0].date ? new Date(articles[0].date).toLocaleDateString() : undefined}
                    onClick={() => openArticle(articles[0].slug)}
                    size="large"
                    hero
                  />
                </BlogCard>
                {/* Second row: 3 articles */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, alignItems: "stretch" }}>
                  {articles.slice(1, 4).map((article: any) => (
                    <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                      <Card
                        variant="blog"
                        title={article.title}
                        excerpt={undefined}
                        imageUrl={article.imageUrl}
                        category={article.category}
                        author={article.author}
                        authorAvatar={article.authorAvatar}
                        publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                        onClick={() => openArticle(article.slug)}
                        size="small"
                      />
                    </BlogCard>
                  ))}
                </Box>
                {/* Third row: 1 medium + 2 small */}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, alignItems: "stretch" }}>
                  <BlogCard sx={{ display: "flex", flexDirection: "column" }}>
                    <Card
                      variant="blog"
                      title={articles[4].title}
                      excerpt={articles[4].excerpt}
                      imageUrl={articles[4].imageUrl}
                      category={articles[4].category}
                      author={articles[4].author}
                      authorAvatar={articles[4].authorAvatar}
                      publishedAt={articles[4].date ? new Date(articles[4].date).toLocaleDateString() : undefined}
                      onClick={() => openArticle(articles[4].slug)}
                      size="medium"
                    />
                  </BlogCard>
                  <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" }, alignItems: "stretch" }}>
                    {articles.slice(5, 7).map((article: any) => (
                      <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                        <Card
                          variant="blog"
                          title={article.title}
                          excerpt={undefined}
                          imageUrl={article.imageUrl}
                          category={article.category}
                          author={article.author}
                          authorAvatar={article.authorAvatar}
                          publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                          onClick={() => openArticle(article.slug)}
                          size="small"
                        />
                      </BlogCard>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* 8+ articles: all in grid 4 per row */}
            {count >= 8 && (
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, alignItems: "stretch" }}>
                {articles.map((article: any) => (
                  <BlogCard key={article.id} sx={{ display: "flex", flexDirection: "column" }}>
                    <Card
                      variant="blog"
                      title={article.title}
                      excerpt={undefined}
                      imageUrl={article.imageUrl}
                      category={article.category}
                      author={article.author}
                      authorAvatar={article.authorAvatar}
                      publishedAt={article.date ? new Date(article.date).toLocaleDateString() : undefined}
                      onClick={() => openArticle(article.slug)}
                      size="small"
                    />
                  </BlogCard>
                ))}
              </Box>
            )}
                
                {/* Vertical date for this week */}
                <Box sx={{ 
                  position: 'absolute', 
                  right: -120, 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: { xs: 'none', md: 'block' }
                }}>
                  <VerticalDate>
                    {weekStart.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }).replace(/\./g, '')} - {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(' р', '')}
                  </VerticalDate>
                </Box>
                </Box>
              );
          })}
        </Grid>
      </Grid>

        <ArticleModal slug={selectedSlug} onClose={closeArticle} />
      </Container>
    </BlogPageRoot>
  );
}

// Modal with article content loaded by slug
function ArticleModal({ slug, onClose }: { slug: string | null, onClose: () => void }) {
  const open = Boolean(slug);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const conditionalPrevent = (e: Event) => {
      const target = e.target as Node | null;
      const container = scrollRef.current;
      if (!container) { e.preventDefault(); return; }
      if (!target || !container.contains(target)) {
        e.preventDefault();
      }
      // else allow default scrolling inside modal content
    };
    window.addEventListener('wheel', conditionalPrevent, { passive: false });
    window.addEventListener('touchmove', conditionalPrevent, { passive: false });

    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      window.removeEventListener('wheel', conditionalPrevent as any);
      window.removeEventListener('touchmove', conditionalPrevent as any);
    };
  }, [open]);
  return (
    <StyledModal open={open} onClose={onClose} disableScrollLock={false}>
      <ModalContainer>
        <ModalCard>
          <CloseButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </CloseButton>
          <ModalScrollArea ref={scrollRef}>
            {open ? <ArticleContent slug={slug as string} /> : null}
          </ModalScrollArea>
        </ModalCard>
      </ModalContainer>
    </StyledModal>
  );
}

// Lightweight copy of the detail query to render inside the modal
const ARTICLE_QUERY_MODAL = gql`
  query Article($slug: String!) {
    articles(filters: { slug: { eq: $slug } }, pagination: { pageSize: 1 }) {
      title
      description
      date
      cover { url }
      category { name }
      author { 
        name 
        avatar { url }
      }
      blocks {
        __typename
        ... on ComponentSharedMedia { file { url } }
        ... on ComponentSharedRichText { body }
        ... on ComponentSharedSlider { files { url } }
      }
    }
  }
`;

function ArticleContent({ slug }: { slug: string }) {
  const { data } = useQuery(ARTICLE_QUERY_MODAL, { variables: { slug } });
  const a = (data as any)?.articles?.[0];
  if (!a) return null;
  return (
    <ArticleContentRoot>
      <Stack gap={3}>
        <Stack gap={1.5}>
          <Typography variant="overline" color="#FFFFFF">{a.category?.name}</Typography>
          <Typography variant="h3" color="#FFFFFF">{a.title}</Typography>
          <Typography variant="subtitle1" color="#FFFFFF">{a.description}</Typography>
        </Stack>


        {(a as any)?.blocks ? (
          <Stack gap={3}>
            {(a as any).blocks.map((block: any, idx: number) => {
              // Strapi REST returns blocks with component key like "shared.rich-text"
              const comp = block.__component || block.__typename;
              if (comp === 'shared.media' || comp === 'SharedMedia' || comp === 'ComponentSharedMedia') {
                const url = block?.file?.url || block?.url;
                if (!url) return null;
                return (
                  <MediaBox key={`b-${idx}`}>
                    <Image src={toAbsoluteStrapiUrl(url)!} alt={`media-${idx}`} fill style={{ objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                  </MediaBox>
                );
              }
              if (comp === 'shared.slider' || comp === 'SharedSlider' || comp === 'ComponentSharedSlider') {
                const files: any[] = block?.files || [];
                return (
                  <SliderGrid key={`b-${idx}`}>
                    {files.map((f: any, i: number) => {
                      const u = f?.url;
                      if (!u) return null;
                      return (
                        <SliderItem key={i}>
                          <Image src={toAbsoluteStrapiUrl(u)!} alt={`slide-${i}`} fill style={{ objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                        </SliderItem>
                      );
                    })}
                  </SliderGrid>
                );
              }
              if (comp === 'shared.rich-text' || comp === 'SharedRichText' || comp === 'ComponentSharedRichText') {
                const html = block?.body || '';
                return (
                  <Typography key={`b-${idx}`} component="div" variant="body1" sx={{ lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              }
              return null;
            })}
          </Stack>
        ) : null}

        <Box>
          <Box sx={{ width: "100%", height: "1px", bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {a.author?.avatar?.url && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0
                }}
              >
                <Image 
                  src={toAbsoluteStrapiUrl(a.author.avatar.url)!} 
                  alt={a.author?.name ?? 'Author'} 
                  fill 
                  style={{ objectFit: "cover" }}
                  sizes="32px"
                />
              </Box>
            )}
        <Typography variant="caption" color="#FFFFFF">
              {a.date ? new Date(a.date).toLocaleDateString() : 'No date'} • By {a.author?.name ?? 'Unknown'}
        </Typography>
          </Box>
        </Box>
      </Stack>
    </ArticleContentRoot>
  );
}

// styled components (centralized styles for the modal)
const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2%',
  ['& .MuiBackdrop-root' as any]: {
    backgroundColor: 'rgba(2,6,23,0.6)',
    backdropFilter: 'blur(12px)'
  }
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  width: '72vw',
  maxHeight: '86vh',
  [theme.breakpoints.down('md')]: {
    width: '76vw'
  }
}));

const ModalCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 16,
  overflow: 'hidden',
  // glass-like card per mock
  backgroundColor: 'rgba(255,255,255,0.24)',
  border: '0.8px solid rgba(255,255,255,0.15)',
  boxShadow: '0 24px 38px rgba(31,38,135,0.20)',
  color: theme.palette.text.primary,
}));

const ModalScrollArea = styled('div')(({ theme }) => ({
  maxHeight: '86vh',
  overflowY: 'auto',
  paddingLeft: '10%',
  paddingRight: '10%',
  paddingTop: '4%',
  paddingBottom: '4%',
  [theme.breakpoints.down('md')]: {
    paddingLeft: '4%',
    paddingRight: '4%',
    paddingTop: '3%',
    paddingBottom: '3%'
  }
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 24,
  zIndex: 1,
  backgroundColor: 'rgba(0,0,0,0.25)',
  color: '#fff',
  '&:hover': { backgroundColor: 'rgba(0,0,0,0.35)' }
}));

const ArticleContentRoot = styled(Box)(({ theme }) => ({
  padding: 16,
  [theme.breakpoints.up('sm')]: { padding: 24 },
  [theme.breakpoints.up('md')]: { padding: 32 }
}));

const MediaBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '16 / 9',
  borderRadius: 8,
  overflow: 'hidden',
  maxHeight: '42vh',
  width: '72%',
  marginLeft: 'auto',
  marginRight: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxHeight: '36vh',
    aspectRatio: '16 / 10'
  }
}));

const SliderGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: '1fr 1fr',
  width: '86%',
  marginLeft: 'auto',
  marginRight: 'auto',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    width: '100%'
  }
}));

const SliderItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '16 / 10',
  borderRadius: 8,
  overflow: 'hidden',
  maxHeight: '32vh',
  [theme.breakpoints.down('md')]: { maxHeight: '28vh' }
}));

// Blog page styles
const BlogPageRoot = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, rgba(144,156,194,0.68) 0%, rgba(118,129,179,0.62) 35%, rgba(64,77,117,0.66) 70%, rgba(24,29,39,0.70) 100%)',
  color: '#E6EDF3'
}));

const BlogCard = styled(Box)(({ theme }) => ({
  marginBottom: 16,
  backgroundColor: 'rgba(255,255,255,0.24)',
  borderRadius: 16,
  border: '0.8px solid rgba(255,255,255,0.15)',
  boxShadow: '0 24px 38px rgba(31,38,135,0.20)',
  backdropFilter: 'blur(12px)',
  overflow: 'visible',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 32px 48px rgba(31,38,135,0.30)',
    transition: 'all 0.3s ease'
  },
  '& .MuiCard-root': {
    backgroundColor: 'transparent !important',
    boxShadow: 'none !important',
    border: 'none !important',
    height: '100%',
    overflow: 'hidden'
  },
  '& .MuiCardActionArea-root': {
    height: '100% !important',
    minHeight: '100% !important'
  }
}));

const VerticalDate = styled(Box)(({ theme }) => ({
  writingMode: 'vertical-rl',
  textOrientation: 'mixed',
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#FFFFFF',
  letterSpacing: '0.05em',
  paddingLeft: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.9,
  minWidth: 32,
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));

const WelcomeBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 16,
  padding: 24,
  marginBottom: 32,
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.15)',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    padding: 1,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'xor',
    WebkitMaskComposite: 'xor'
  }
}));


