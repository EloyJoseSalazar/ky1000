// src/app/domains/shared/models/banner.model.ts
export interface Banner {
  id_banner: string;
  imageUrl: string; // URL de Minio
  altText: string;
  linkType: 'CATEGORY' | 'PRODUCT' | 'QUERY' | 'EXTERNAL';
  linkValue: string; // El ID de categoría, ID de producto, término de búsqueda, etc.
}
