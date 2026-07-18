"use client";

import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create or update JSON-LD script
      let script = document.getElementById('structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script') as HTMLScriptElement;
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    }
  }, [data]);

  return null;
}

// Helper function to generate organization structured data
export function generateOrganizationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bajrangi Nutrition',
    description: 'Premium protein supplements, vitamins, and fitness nutrition store in Kurukshetra',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9588715527',
      contactType: 'customer service',
      availableLanguage: 'English, Hindi'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kurukshetra',
      addressRegion: 'Haryana',
      addressCountry: 'IN'
    },
    sameAs: [
      'https://www.instagram.com/bajranginutrition',
      'https://wa.me/919588715527'
    ]
  };
}

// Helper function to generate local business structured data
export function generateLocalBusinessData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Bajrangi Nutrition',
    description: 'Authentic protein supplements, pre-workouts, creatine, and vitamins in Kurukshetra',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    telephone: '+91-9588715527',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kurukshetra',
      addressRegion: 'Haryana',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '29.9657',
      longitude: '76.8385'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      opens: '09:00',
      closes: '21:00'
    },
    priceRange: '₹₹'
  };
}

// Helper function to generate website structured data
export function generateWebsiteData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bajrangi Nutrition',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    description: 'Shop 100% authentic whey proteins, pre-workouts, creatine, vitamins, and fitness supplements at Bajrangi Nutrition Kurukshetra',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}
