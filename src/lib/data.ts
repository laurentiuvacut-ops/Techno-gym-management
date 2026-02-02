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

export const subscriptions = [
  {
    id: "classic",
    title: "Techno Classic",
    price: "120 Ron",
    period: "/lună",
    benefits: [
      "Acces în intervalul 08:00 - 16:00",
      "Acces la aparate și greutăți",
      "Vestiar cu dușuri inclus",
    ],
    cta: "Alege Classic",
  },
  {
    id: "pro",
    title: "Techno Pro",
    price: "150 Ron",
    period: "/lună",
    benefits: [
      "Acces în intervalul 08:00 - 22:00",
      "Toate beneficiile Classic",
    ],
    cta: "Alege Pro",
    popular: true,
  },
  {
    id: "student",
    title: "Techno Elevi",
    price: "130 Ron",
    period: "/lună",
    benefits: [
      "Acces în intervalul 08:00 - 22:00",
      "Valabil cu carnet de elev/student",
      "Toate beneficiile Pro",
    ],
    cta: "Alege Elev",
  },
  {
    id: "nonstop",
    title: "Techno Non-Stop",
    price: "170 Ron",
    period: "/lună",
    benefits: [
      "Acces 24/7 nelimitat",
      "Toate beneficiile Pro",
    ],
    cta: "Alege Non-Stop",
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
  },
  {
    id: "2",
    name: "Luca Mihai",
    specialty: "Personal Trainer & Nutritionist",
    image: getImage('trainer-2'),
  },
  {
    id: "3",
    name: "Maria Cirnu",
    specialty: "Personal Trainer",
    image: getImage('trainer-3'),
  },
  {
    id: "4",
    name: "Ana Oprescu",
    specialty: "Personal Trainer",
    image: getImage('trainer-4'),
  },
];

export const shopItems = [
    {
        id: "1",
        name: "Techno Whey Protein",
        price: "$45.00",
        stock: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "2",
        name: "Pulse Pre-Workout",
        price: "$35.00",
        stock: "Low Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "3",
        name: "Hydro-Flask Water Bottle",
        price: "$25.00",
        stock: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "4",
        name: "Creatine Monohydrate",
        price: "$30.00",
        stock: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    },
    {
        id: "5",
        name: "Techno Gym T-Shirt",
        price: "$20.00",
        stock: "Out of Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    }
];

export const transformations = [
  {
    id: 1,
    before: getImage('transformation-before-1'),
    after: getImage('transformation-after-1'),
  },
  {
    id: 2,
    before: getImage('transformation-before-2'),
    after: getImage('transformation-after-2'),
  },
  {
    id: 3,
    before: getImage('transformation-before-3'),
    after: getImage('transformation-after-3'),
  },
  {
    id: 4,
    before: getImage('transformation-before-4'),
    after: getImage('transformation-after-4'),
  },
  {
    id: 5,
    before: getImage('transformation-before-5'),
    after: getImage('transformation-after-5'),
  },
];

    