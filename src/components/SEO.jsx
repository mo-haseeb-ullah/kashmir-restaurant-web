import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords }) {
  const siteTitle = 'Kashmir Restaurant';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Authentic Desi Taste`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* OpenGraph updates for the specific page */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      
      {/* Twitter updates for the specific page */}
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
}
