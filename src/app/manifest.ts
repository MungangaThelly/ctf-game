import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Startup Security Showdown',
    short_name: 'Security CTF',
    description: 'White-hat web security training challenges.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#4ade80',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
