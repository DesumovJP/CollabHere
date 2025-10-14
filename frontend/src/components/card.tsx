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
  fixedHeight?: number; // deprecated: keep for compatibility (ignored for responsive rows)
};

export default function Card(props: Props) {
  const { variant } = props;
  const aspect = variant === "blog"
    ? props.size === "large" ? "16 / 9" : props.size === "medium" ? "6 / 5" : "7 / 5"
    : "4 / 5";

  // Large blog card has a special split layout (image left, content right) when used as hero
  if (variant === "blog" && props.size === "large" && props.hero) {
    return (
      <MuiCard sx={{ overflow: "hidden" }}>
        <CardActionArea onClick={props.onClick} component={props.href ? (Link as any) : undefined} href={props.href as any}>
          <Box sx={{ display: { xs: "block", md: "grid" }, gridTemplateColumns: { md: "1.2fr 1fr" } }}>
            <Box sx={{ position: "relative", aspectRatio: { xs: "4 / 3", md: "4 / 3" } }}>
              {props.imageUrl ? (
                <Image src={props.imageUrl} alt={props.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 100vw, 50vw" />
              ) : (
                <CardMedia sx={{ height: { xs: 220, md: "100%" } }} image="/vercel.svg" />
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
                  <Typography variant="body1" color="text.secondary">{props.excerpt}</Typography>
                ) : null}
                {(props.author || props.publishedAt) ? (
                  <Typography variant="caption" color="text.secondary">{props.author ? `${props.author} • ` : ""}{props.publishedAt}</Typography>
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
      bgcolor: isBlogTransparent ? "transparent" : undefined,
      border: isBlogTransparent ? "none" : undefined,
      boxShadow: "none",
    }}>
      <CardActionArea onClick={props.onClick} component={props.href ? (Link as any) : undefined} href={props.href as any}
        sx={{ p: 0, display: 'block' }}
      >
        <Box sx={{ position: "relative", width: '100%', ...(isProduct ? { aspectRatio: '4 / 3' } : { aspectRatio: aspect }) }}>
          {props.imageUrl ? (
            <Image src={props.imageUrl} alt={props.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 600px) 100vw, 33vw" />
          ) : (
            <CardMedia sx={{ height: 220 }} image="/vercel.svg" />
          )}
          {variant === "product" && "badge" in props && props.badge ? (
            <Chip color="secondary" size="small" label={props.badge} sx={{ position: "absolute", top: 12, left: 12 }} />
          ) : null}
        </Box>

        <CardContent sx={{ p: isProduct ? 2 : undefined, display: isProduct ? 'flex' : undefined, flexDirection: isProduct ? 'column' : undefined }}>
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
                <Typography variant={props.size === "large" ? "body1" : "body2"} color="text.secondary">{props.excerpt}</Typography>
              ) : null}
              {variant === "blog" && (props.publishedAt || props.author) ? (
                <Typography variant="caption" color="text.secondary">{props.author ? `${props.author} • ` : ""}{props.publishedAt}</Typography>
              ) : null}
              {variant === "product" && "price" in props ? (
                <Typography fontWeight={700} sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>${props.price.toFixed(2)}</Typography>
              ) : null}
            </Stack>
            {variant === "product" && "price" in props ? (
              <Button size="small" sx={{ mt: 2 }} fullWidth>
                Add to cart
              </Button>
            ) : null}
        </CardContent>
      </CardActionArea>
    </MuiCard>
  );
}