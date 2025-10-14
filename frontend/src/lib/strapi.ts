export function toAbsoluteStrapiUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}


