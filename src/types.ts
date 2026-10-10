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
  exercises: Exercise[]
}

export type SetLog = {
  load: number | null
  reps: number | null
  rir: number | null
  pain: number | null
  done: boolean
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
