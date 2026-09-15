import type { Measurement, TrekkingLog, WorkoutSession } from './types'

const KEYS = {
  sessions: 'trekfit.sessions',
  trekking: 'trekfit.trekking',
  measurements: 'trekfit.measurements',
  profile: 'trekfit.profile'
}

const read = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}
const write = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value))

export const storage = {
  getSessions: () => read<WorkoutSession[]>(KEYS.sessions, []),
  saveSessions: (v: WorkoutSession[]) => write(KEYS.sessions, v),
  getTreks: () => read<TrekkingLog[]>(KEYS.trekking, []),
  saveTreks: (v: TrekkingLog[]) => write(KEYS.trekking, v),
  getMeasurements: () => read<Measurement[]>(KEYS.measurements, []),
  saveMeasurements: (v: Measurement[]) => write(KEYS.measurements, v),
}
