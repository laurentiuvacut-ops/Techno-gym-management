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
    id: "day",
    title: "Day Pass",
    price: "$15",
    period: "/day",
    benefits: [
      "Access to all gym facilities",
      "Free towel service",
      "Locker access",
    ],
    cta: "Get Day Pass",
  },
  {
    id: "monthly",
    title: "Monthly",
    price: "$60",
    period: "/month",
    benefits: [
      "Unlimited access",
      "2 free personal training sessions",
      "Access to all classes",
      "Guest pass every weekend",
    ],
    cta: "Renew Now",
    popular: true,
  },
  {
    id: "yearly",
    title: "Yearly",
    price: "$600",
    period: "/year",
    benefits: [
      "All monthly benefits",
      "10% off at the Gym Shop",
      "Personalized workout plan",
      "Free monthly body composition analysis",
    ],
    cta: "Go Pro",
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
    name: "Alex Ray",
    specialty: "Bodybuilding Expert",
    image: getImage('trainer-1'),
  },
  {
    id: "2",
    name: "Jane Fonda",
    specialty: "HIIT & Cardio Queen",
    image: getImage('trainer-2'),
  },
  {
    id: "3",
    name: "Sam Sulek",
    specialty: "Strength & Conditioning",
    image: getImage('trainer-3'),
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
