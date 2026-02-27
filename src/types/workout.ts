export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutLog {
  id: string;
  name: string;
  date: string;
  duration: number;
  notes?: string;
  exercises: WorkoutExercise[];
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any;
}

export interface SharedWorkout {
  id: string;
  title: string;
  description?: string;
  creatorName: string;
  creatorId: string;
  createdAt?: any;
  isOfficial?: boolean;
  workouts: Omit<WorkoutLog, 'id' | 'date' | 'createdAt'>[];
}
