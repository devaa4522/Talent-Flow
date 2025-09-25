export const slugify = (s='') =>
  s.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g,'')
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-');
