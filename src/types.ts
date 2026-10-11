export type Tab = 'home' | 'workout' | 'health' | 'coach' | 'account'

export type HealthSection = 'summary' | 'body' | 'nutrition' | 'trekking'

export type Exercise = {
  id: string
  name: string
  muscle: string
  sets: number
  repMin: number
  repMax: number
  rest: number
  spineStress: 'LOW' | 'MODERATE' | 'HIGH'
  trekking: boolean
  notes?: string
}

export type WorkoutTemplate = {
  id: string
  title: string
  focus: string
  cardio?: string
  source?: 'builtin' | 'imported'
  importedAt?: string
  exercises: Exercise[]
}

export type SetLog = {
  done: boolean
  // Campos legados opcionais: preservam históricos das versões anteriores.
  load?: number | null
  reps?: number | null
  rir?: number | null
  pain?: number | null
}

export type ExerciseLog = {
  exerciseId: string
  exerciseName: string
  sets: SetLog[]
}

export type WorkoutSession = {
  id: string
  templateId: string
  title: string
  date: string
  startedAt: string
  finishedAt?: string
  lumbarPainBefore: number
  radiatingPain: boolean
  exerciseLogs: ExerciseLog[]
}

export type TrekkingLog = {
  id: string
  date: string
  distanceKm: number
  durationMin: number
  elevationM: number
  backpackKg: number
  lumbarPain: number
  kneePain: number
  effort: number
}

export type Measurement = {
  id: string
  date: string
  weightKg: number
  waistCm?: number
  hipCm?: number
  thighCm?: number
}

export type CoachCheckin = {
  id: string
  date: string
  sleepHours: number
  energy: number
  hunger: number
  stress: number
  recovery: number
  pain: number
  adherence: number
  notes?: string
}

export type Profile = {
  name: string
  goal: string
  weeklyTarget: number
}


export type NutritionFood = {
  id: string
  name: string
  amount?: number
  unit?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  notes?: string
}

export type NutritionMeal = {
  id: string
  name: string
  time?: string
  foods: NutritionFood[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type NutritionPlan = {
  id: string
  title: string
  calories: number
  protein: number
  carbs: number
  fat: number
  meals: NutritionMeal[]
  importedAt: string
}


export type NutritionTarget = {
  calories: number
  protein: number
  carbs: number
  fat: number
}
