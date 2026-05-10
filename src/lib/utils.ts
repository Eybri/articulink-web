export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // If it's already a full URL or absolute path, return it
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  
  // Specific check for icons that are known to be in public/icons/
  const knownIcons = ['ampalaya.jpg', 'banana.jpg', 'pineapple.jpg', 'strawberry.jpg'];
  if (knownIcons.includes(url.toLowerCase())) {
    return `/icons/${url}`;
  }
  
  // Fallback: if it's just a filename, assume it's an icon
  return `/icons/${url}`;
}
