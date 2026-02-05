import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Techno Gym',
    short_name: 'Techno Gym',
    description: 'Your futuristic gym companion.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: 'https://i.imgur.com/9W1ye1w.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'https://i.imgur.com/9W1ye1w.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}
