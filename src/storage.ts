import type { CoachCheckin, Measurement, Profile, TrekkingLog, WorkoutSession, WorkoutTemplate } from './types'

const KEYS = {
  sessions: 'trekfit.sessions',
  trekking: 'trekfit.trekking',
  measurements: 'trekfit.measurements',
  profile: 'trekfit.profile',
  coachCheckins: 'trekfit.coachCheckins',
  customWorkouts: 'trekfit.customWorkouts'
}

const read = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}
const write = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value))

const defaultProfile: Profile = { name: 'Atleta', goal: 'Performance + composição corporal', weeklyTarget: 5 }

export const storage = {
  getSessions: () => read<WorkoutSession[]>(KEYS.sessions, []),
  saveSessions: (v: WorkoutSession[]) => write(KEYS.sessions, v),
  getTreks: () => read<TrekkingLog[]>(KEYS.trekking, []),
  saveTreks: (v: TrekkingLog[]) => write(KEYS.trekking, v),
  getMeasurements: () => read<Measurement[]>(KEYS.measurements, []),
  saveMeasurements: (v: Measurement[]) => write(KEYS.measurements, v),
  getCoachCheckins: () => read<CoachCheckin[]>(KEYS.coachCheckins, []),
  saveCoachCheckins: (v: CoachCheckin[]) => write(KEYS.coachCheckins, v),
  getCustomWorkouts: () => read<WorkoutTemplate[]>(KEYS.customWorkouts, []),
  saveCustomWorkouts: (v: WorkoutTemplate[]) => write(KEYS.customWorkouts, v),
  getProfile: () => read<Profile>(KEYS.profile, defaultProfile),
  saveProfile: (v: Profile) => write(KEYS.profile, v),
}
