import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        return {
            id: 'not-found',
            description: 'Image not found',
            imageUrl: 'https://picsum.photos/seed/notfound/600/400',
            imageHint: 'placeholder',
        };
    }
    return img;
};

// IMPORTANT: These prices and titles are sent directly to Stripe.
// You can edit them here, and the changes will reflect on the checkout page.
export const subscriptions = [
  {
    id: "classic",
    title: "Techno Classic",
    price: "120 RON",
    description: "Acces în intervalul 08:00 - 16:00",
    period: "/lună",
    durationDays: 30,
    benefits: [
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
      "Toate beneficiile Classic",
      "Acces la clasele de grup",
      "O sesiune gratuită cu antrenor",
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
      "Reducere 10% la magazin",
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
    cta: "Cumpără Acum",
  },
];

export const workouts = [
  {
    id: "strength",
    category: "Strength",
    image: getImage('workout-strength'),
  },
  {
    id: "hiit",
    category: "HIIT",
    image: getImage('workout-hiit'),
  },
  {
    id: "cardio",
    category: "Cardio",
    image: getImage('workout-cardio'),
  },
  {
    id: "recovery",
    category: "Recovery",
    image: getImage('workout-recovery'),
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

export const transformations = [
  {
    id: 8,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-8'),
    after: getImage('transformation-after-8'),
  },
  {
    id: 9,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-9'),
    after: getImage('transformation-after-9'),
  },
  {
    id: 10,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-10'),
    after: getImage('transformation-after-10'),
  },
  {
    id: 11,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-11'),
    after: getImage('transformation-after-11'),
  },
  {
    id: 12,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-12'),
    after: getImage('transformation-after-12'),
  },
  {
    id: 13,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-13'),
    after: getImage('transformation-after-13'),
  },
  {
    id: 14,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-14'),
    after: getImage('transformation-after-14'),
  },
  {
    id: 15,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-15'),
    after: getImage('transformation-after-15'),
  },
  {
    id: 16,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-16'),
    after: getImage('transformation-after-16'),
  },
  {
    id: 17,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-17'),
    after: getImage('transformation-after-17'),
  },
  {
    id: 18,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-18'),
    after: getImage('transformation-after-18'),
  },
  {
    id: 19,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-19'),
    after: getImage('transformation-after-19'),
  },
  {
    id: 20,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-20'),
    after: getImage('transformation-after-20'),
  },
  {
    id: 21,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-21'),
    after: getImage('transformation-after-21'),
  },
  {
    id: 22,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-22'),
    after: getImage('transformation-after-22'),
  },
  {
    id: 23,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-23'),
    after: getImage('transformation-after-23'),
  },
  {
    id: 24,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-24'),
    after: getImage('transformation-after-24'),
  },
  {
    id: 25,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-25'),
    after: getImage('transformation-after-25'),
  },
  {
    id: 26,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-26'),
    after: getImage('transformation-after-26'),
  },
  {
    id: 27,
    name: 'Membru Nou',
    story: 'O nouă transformare de succes!',
    before: getImage('transformation-before-27'),
    after: getImage('transformation-after-27'),
  }
];

    




    



