import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, preloadImage }) {
  const siteTitle = 'Kashmir Restaurant';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Authentic Desi Taste`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {preloadImage && <link rel="preload" as="image" href={preloadImage} fetchpriority="high" />}
      
      {/* OpenGraph updates for the specific page */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      
      {/* Twitter updates for the specific page */}
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}

      {/* Structured Data (JSON-LD) for Google AI and Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "Kashmir Restaurant",
          "image": "https://www.kashmirrestaurant.pk/hero.webp",
          "@id": "https://www.kashmirrestaurant.pk",
          "url": "https://www.kashmirrestaurant.pk",
          "telephone": "+923005400476",
          "priceRange": "₨100 - ₨5500",
          "menu": "https://www.kashmirrestaurant.pk/#menu",
          "servesCuisine": ["Pakistani", "Desi", "Kashmiri", "Karahi"],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Chak 54MB, Khushab - Sakesar Road",
            "addressLocality": "Khushab",
            "addressRegion": "Punjab",
            "postalCode": "41200",
            "addressCountry": "PK"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 32.2965,
            "longitude": 72.3525
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "06:00",
              "closes": "23:59"
            }
          ],
          "sameAs": [
            "https://www.facebook.com/kashmirrestaurant"
          ]
        })}
      </script>
    </Helmet>
  );
}
