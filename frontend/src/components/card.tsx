"use client";

import { Box, Card as MuiCard, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography, Link as MuiLink, Button } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

type BlogCard = {
  variant: "blog";
  title: string;
  size?: "large" | "medium" | "small";
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  publishedAt?: string;
  author?: string;
  authorAvatar?: string;
};

type ProductCard = {
  variant: "product";
  title: string;
  price: number;
  imageUrl?: string;
  badge?: string;
};

type Props = (BlogCard | ProductCard) & {
  onClick?: () => void;
  href?: string;
  hero?: boolean;
};

export default function Card(props: Props) {
  const { variant } = props;
  const aspect = variant === "blog"
    ? props.size === "large" ? "16 / 9" : props.size === "medium" ? "6 / 5" : "7 / 5"
    : "4 / 5";

  // Large blog card has a special split layout (image left, content right) when used as hero
  if (variant === "blog" && props.size === "large" && props.hero) {
    return (
      <MuiCard sx={{ overflow: "hidden", borderRadius: 2 }}>
        <CardActionArea onClick={props.onClick} component={props.href ? (Link as any) : undefined} href={props.href as any}>
          <Box sx={{ display: { xs: "block", md: "grid" }, gridTemplateColumns: { md: "1.2fr 1fr" } }}>
            <Box sx={{ 
              position: "relative", 
              aspectRatio: { xs: "4 / 3", md: "4 / 3" }, 
              overflow: "hidden !important",
              borderRadius: "inherit"
            }}>
          {props.imageUrl ? (
            <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}>
              <Image 
                src={props.imageUrl} 
                alt={props.title} 
                fill 
                style={{ 
                  objectFit: "cover"
                }} 
                sizes="(max-width: 600px) 100vw, 50vw" 
              />
            </Box>
          ) : (
                <CardMedia sx={{ height: { xs: 220, md: "100%" }, overflow: "hidden" }} image="/vercel.svg" />
              )}
            </Box>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Stack gap={1.5}>
                {props.category ? (
                  <MuiLink href="#" color="text.secondary" underline="none" sx={{ borderBottom: "2px solid transparent", '&:hover': { borderBottomColor: "transparent", color: "text.secondary" } }}>
                    <Typography variant="overline" color="inherit">{props.category}</Typography>
                  </MuiLink>
                ) : null}
                <Typography variant="h4" fontWeight={700}>{props.title}</Typography>
                {props.excerpt ? (
                  <Typography variant="body1" color="#FFFFFF">{props.excerpt}</Typography>
                ) : null}
                {(props.author || props.publishedAt) ? (
                  <Box>
                    <Box sx={{ width: "100%", height: "1px", bgcolor: "rgba(255,255,255,0.2)", my: 1.5 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {props.authorAvatar && (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            overflow: "hidden",
                            position: "relative",
                            flexShrink: 0
                          }}
                        >
                          <Image 
                            src={props.authorAvatar} 
                            alt={props.author || "Author"} 
                            fill 
                            style={{ objectFit: "cover" }}
                            sizes="24px"
                          />
                        </Box>
                      )}
                      <Typography variant="caption" color="#FFFFFF">
                        {props.author ? `${props.author} • ` : ""}{props.publishedAt}
                      </Typography>
                    </Box>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Box>
        </CardActionArea>
      </MuiCard>
    );
  }

  const isBlogTransparent = variant === "blog" && props.size !== "large";
  const isProduct = variant === "product";

  return (
    <MuiCard sx={{
      overflow: "hidden",
      borderRadius: 2,
      bgcolor: isBlogTransparent ? "transparent" : undefined,
      border: isBlogTransparent ? "none" : undefined,
      boxShadow: "none",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      <CardActionArea onClick={props.onClick} component={props.href ? (Link as any) : undefined} href={props.href as any}
        sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', flex: 1, '&:hover': { backgroundColor: 'transparent' } }}
      >
        <Box sx={{ 
          position: "relative", 
          width: '100%', 
          overflow: "hidden !important",
          borderRadius: "inherit",
          ...(isProduct ? { aspectRatio: '4 / 3' } : { aspectRatio: aspect }) 
        }}>
          {props.imageUrl ? (
            <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit" }}>
              <Image 
                src={props.imageUrl} 
                alt={props.title} 
                fill 
                style={{ 
                  objectFit: "cover"
                }} 
                sizes="(max-width: 600px) 100vw, 33vw" 
              />
            </Box>
          ) : (
            <CardMedia sx={{ height: 220, overflow: "hidden" }} image="/vercel.svg" />
          )}
          {variant === "product" && "badge" in props && props.badge ? (
            <Chip color="secondary" size="small" label={props.badge} sx={{ position: "absolute", top: 12, left: 12 }} />
          ) : null}
        </Box>

        <CardContent sx={{ 
          p: isProduct ? 2 : undefined, 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1,
          justifyContent: 'space-between'
        }}>
            {/* Upper content */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: variant === 'blog' && props.size === 'medium' ? 'center' : 'flex-start',
              flex: variant === 'blog' && props.size === 'medium' ? 1 : 'initial'
            }}>
              <Stack gap={0.5}>
                {variant === "blog" && props.category ? (
                  <MuiLink href="#" color="text.secondary" underline="none" sx={{ borderBottom: "2px solid transparent", '&:hover': { borderBottomColor: "transparent", color: "text.secondary" } }}>
                    <Typography variant="overline" color="inherit">{props.category}</Typography>
                  </MuiLink>
                ) : null}
                <Typography
                  variant={variant === "blog" && props.size === "large" ? "h4" : "h6"}
                  fontWeight={700}
                  sx={variant === "product" ? { fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }, lineHeight: 1.2 } : undefined}
                >
                  {props.title}
                </Typography>
                {variant === "blog" && props.excerpt && props.size !== "small" ? (
                  <Typography variant={props.size === "large" ? "body1" : "body2"} color="#FFFFFF">{props.excerpt}</Typography>
                ) : null}
                {variant === "product" && "price" in props ? (
                  <Typography fontWeight={700} sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>${props.price.toFixed(2)}</Typography>
                ) : null}
              </Stack>
            </Box>

            {/* Lower content - always at bottom */}
            <Box>
              {variant === "blog" && (props.publishedAt || props.author) ? (
                <Box>
                  <Box sx={{ width: "100%", height: "1px", bgcolor: "rgba(255,255,255,0.2)", my: 1.5 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {props.authorAvatar && (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          overflow: "hidden",
                          position: "relative",
                          flexShrink: 0
                        }}
                      >
                        <Image 
                          src={props.authorAvatar} 
                          alt={props.author || "Author"} 
                          fill 
                          style={{ objectFit: "cover" }}
                          sizes="24px"
                        />
                      </Box>
                    )}
                    <Typography variant="caption" color="#FFFFFF">
                      {props.author ? `${props.author} • ` : ""}{props.publishedAt}
                    </Typography>
                  </Box>
                </Box>
              ) : null}
              {variant === "product" && "price" in props ? (
                <Button size="small" sx={{ mt: 2 }} fullWidth>
                  Add to cart
                </Button>
              ) : null}
            </Box>
        </CardContent>
      </CardActionArea>
    </MuiCard>
  );
}