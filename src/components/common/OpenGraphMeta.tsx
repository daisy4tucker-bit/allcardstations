import React from 'react';
import { SEO, SEOProps } from './SEO';

export interface OpenGraphMetaProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export const OpenGraphMeta: React.FC<OpenGraphMetaProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  canonicalPath,
  type = 'website',
  noindex = false,
  jsonLd,
}) => {
  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      ogImage={image}
      canonicalUrl={url}
      canonicalPath={canonicalPath}
      ogType={type}
      noindex={noindex}
      structuredData={jsonLd}
    />
  );
};

export default OpenGraphMeta;
