
import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export const getImage = (id: string): ImagePlaceholder => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        const fallbackImg = PlaceHolderImages.find(p => p.id === 'gym-interior-1');
        return fallbackImg || {
            id: 'not-found',
            description: 'Image not found',
            imageUrl: 'https://i.imgur.com/6N8o2LA.jpg',
            imageHint: 'dark gym',
        };
    }
    return img;
};

export const subscriptions = [
  {
    id: "classic",
    title: "Techno Classic",
    price: "120 RON",
    description: "Acces în intervalul 08:00 - 16:00",
    period: "/lună",
    durationDays: 30,
    benefits: [
      "Acces în intervalul 08:00 - 16:00",
      "Acces la aparate și greutăți",
      "Vestiar cu dușuri inclus",
    ],
    cta: "Cumpără Acum",
  },
  {
    id: "pro",
    title: "Techno Pro",
    price: "150 RON",
    description: "Acces în intervalul 08:00 - 22:00",
    period: "/lună",
    durationDays: 30,
    benefits: [
      "Acces în intervalul 08:00 - 22:00",
      "Toate beneficiile Classic",
    ],
    cta: "Cumpără Acum",
    popular: true,
  },
  {
    id: "student",
    title: "Techno Elevi",
    price: "130 RON",
    description: "Valabil cu carnet de elev/student",
    period: "/lună",
    durationDays: 30,
    benefits: [
      "Acces în intervalul 08:00 - 22:00",
      "Toate beneficiile Pro",
    ],
    cta: "Cumpără Acum",
  },
  {
    id: "nonstop",
    title: "Techno Non-Stop",
    price: "170 RON",
    description: "Acces 24/7 nelimitat",
    period: "/lună",
    durationDays: 30,
    benefits: [
      "Acces nelimitat 24/7",
      "Toate beneficiile Pro",
      "Invitați un prieten în weekend",
    ],
    cta: "Se cumpără în locație",
  },
];

export const trainers = [
  {
    id: "1",
    name: "Laurentiu Vacut",
    specialty: "Personal Trainer & Nutritionist",
    image: getImage('trainer-1'),
    instagramUrl: "https://www.instagram.com/laurentiuvacut/",
  },
  {
    id: "2",
    name: "Luca Mihai",
    specialty: "Personal Trainer & Nutritionist",
    image: getImage('trainer-2'),
    instagramUrl: "https://www.instagram.com/iamlucamihai/",
  },
  {
    id: "3",
    name: "Maria Cirnu",
    specialty: "Personal Trainer",
    image: getImage('trainer-3'),
    instagramUrl: "https://www.instagram.com/maria_cirnu/",
  },
  {
    id: "4",
    name: "Ana Oprescu",
    specialty: "Personal Trainer",
    image: getImage('trainer-4'),
    instagramUrl: "https://www.instagram.com/__a176__/",
  },
];

export const shopItems = [
    {
        id: "1",
        name: "Protein Whey 2kg",
        price: "189 RON",
        stock: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "2",
        name: "Apă minerală 0.5L",
        price: "5 RON",
        stock: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "3",
        name: "Baton proteic",
        price: "12 RON",
        stock: "Out of Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "4",
        name: "BCAA 500g",
        price: "129 RON",
        stock: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "5",
        name: "Pre-workout",
        price: "149 RON",
        stock: "Out of Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    }
];

export const transformations = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: `Transformare ${i + 1}`,
  story: `Povestea de succes a membrului ${i + 1}.`,
  before: getImage(`t-b-${i + 1}`),
  after: getImage(`t-a-${i + 1}`),
}));
