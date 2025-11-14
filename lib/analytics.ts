// Analytics implementation for Reality Radio Network
// Supports Google Analytics 4 and custom event tracking

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  // Load gtag script
  const script1 = document.createElement('script');
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script1.async = true;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Predefined events for common actions
export const trackAlbumView = (albumTitle: string, artist: string) => {
  event({
    action: 'view_album',
    category: 'Store',
    label: `${artist} - ${albumTitle}`,
  });
};

export const trackSingleView = (singleTitle: string, artist: string) => {
  event({
    action: 'view_single',
    category: 'Store',
    label: `${artist} - ${singleTitle}`,
  });
};

export const trackArtistView = (artistName: string) => {
  event({
    action: 'view_artist',
    category: 'Artists',
    label: artistName,
  });
};

export const trackRadioPlay = (stationName: string) => {
  event({
    action: 'play_radio',
    category: 'Radio',
    label: stationName,
  });
};

export const trackMusicPreview = (trackTitle: string, artist: string) => {
  event({
    action: 'preview_track',
    category: 'Music',
    label: `${artist} - ${trackTitle}`,
  });
};

export const trackPurchaseIntent = (itemType: 'album' | 'single', itemTitle: string, price: string) => {
  event({
    action: 'add_to_cart',
    category: 'Ecommerce',
    label: `${itemType} - ${itemTitle}`,
    value: parseFloat(price.replace('$', '')),
  });
};

export const trackNewsletterSignup = (location: string) => {
  event({
    action: 'newsletter_signup',
    category: 'Engagement',
    label: location,
  });
};

export const trackContactForm = (formType: string) => {
  event({
    action: 'contact_form_submit',
    category: 'Engagement',
    label: formType,
  });
};

export const trackSearch = (query: string, filters: string[]) => {
  event({
    action: 'search',
    category: 'Site',
    label: `${query} [${filters.join(', ')}]`,
  });
};

export const trackSocialClick = (platform: string, location: string) => {
  event({
    action: 'social_click',
    category: 'Social',
    label: `${platform} - ${location}`,
  });
};

export const trackDownload = (fileType: string, fileName: string) => {
  event({
    action: 'file_download',
    category: 'Downloads',
    label: `${fileType} - ${fileName}`,
  });
};

export const trackOutboundLink = (url: string, label?: string) => {
  event({
    action: 'outbound_click',
    category: 'Outbound',
    label: label || url,
  });
};
