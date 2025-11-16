import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.realityradionetwork.com'
  
  // Static pages
  const routes = [
    '',
    '/radio',
    '/store',
    '/store/albums',
    '/store/singles',
    '/talents',
    '/personas',
    '/story',
    '/contact',
    '/blog',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/blog' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : route.includes('/store') || route === '/radio' ? 0.9 : 0.8,
  }))

  // Artist pages (22 artists - add dynamically later)
  const artists = [
    'johnathan-gold',
    'kaira-heartfelt',
    'mathew-cage',
    'eryk-saint',
    'daina-vein',
    'lance-eldon',
    'heather-brown',
    'bryan-tannon',
    'tellerman',
    'vinny-tame',
    'xenia-hex',
    'jonny-faint',
    'sangie-main',
    'mitch-stang',
    'fitch-onaman',
    'luke-todder',
    'braina-taylor',
    'taylor-hellen',
    'chat-figner',
    'jethro-gaurd',
    'chronix',
    'max-reaper',
  ]

  const artistRoutes = artists.map((artist) => ({
    url: `${baseUrl}/talents/${artist}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...artistRoutes]
}
