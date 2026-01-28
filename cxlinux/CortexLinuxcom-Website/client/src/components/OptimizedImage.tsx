interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  loading = 'lazy', 
  priority = false,
  fetchPriority
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding="async"
      {...(priority || fetchPriority === 'high' ? { fetchPriority: 'high' } : {})}
    />
  );
}
