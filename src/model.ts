import { z } from 'zod'

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const equipmentNames = { machines: 'Gym machines', dumbbells: 'Dumbbells', bodyweight: 'Home & bodyweight' }
export const goalNames = { strength: 'Build strength', confidence: 'Feel more confident', consistency: 'Build consistency' }

export const preferencesSchema = z.object({
  goal: z.enum(['strength', 'confidence', 'consistency']),
  experience: z.enum(['new', 'returning']),
  frequency: z.union([z.literal(2), z.literal(3)]),
  minutes: z.union([z.literal(20), z.literal(30), z.literal(45)]),
  equipment: z.enum(['machines', 'dumbbells', 'bodyweight']),
  days: z.array(z.enum(DAYS)).min(2).max(3),
  avoidFloor: z.boolean(),
  avoidOverhead: z.boolean(),
  concern: z.enum(['none', 'restriction', 'unsure']),
}).refine(p => p.days.length === p.frequency && new Set(p.days).size === p.days.length, { message: 'Choose distinct days matching your weekly frequency.' })
export type Preferences = z.infer<typeof preferencesSchema>
export const defaultPreferences: Preferences = { goal: 'confidence', experience: 'returning', frequency: 2, minutes: 30, equipment: 'machines', days: ['Mon', 'Thu'], avoidFloor: false, avoidOverhead: false, concern: 'none' }

export type Exercise = {
  id: string; name: string; equipment: Preferences['equipment']; region: 'legs' | 'push' | 'pull' | 'core';
  setup: string; cues: string[]; reps: string; floor?: boolean; overhead?: boolean; alternatives: string[];
}

export const exercises: Exercise[] = [
  { id: 'leg-press', name: 'Leg press', equipment: 'machines', region: 'legs', setup: 'Adjust the seat so your feet rest flat on the platform and your knees are comfortably bent. Start with a light resistance.', cues: ['Keep your back supported by the seat.', 'Press steadily without locking your knees.', 'Return slowly through a comfortable range.'], reps: '8–10', alternatives: ['leg-curl', 'leg-extension'] },
  { id: 'leg-curl', name: 'Seated leg curl', equipment: 'machines', region: 'legs', setup: 'Align your knees with the machine pivot. Position the lower pad just above your heels and secure the thigh pad comfortably.', cues: ['Sit tall against the backrest.', 'Curl your heels down without lifting your hips.', 'Let the pad return slowly.'], reps: '8–10', alternatives: ['leg-press', 'leg-extension'] },
  { id: 'leg-extension', name: 'Leg extension', equipment: 'machines', region: 'legs', setup: 'Adjust the backrest and position the shin pad above your ankles. Choose a light resistance.', cues: ['Keep your hips and back against the seat.', 'Straighten your legs without snapping your knees.', 'Lower with control.'], reps: '8–10', alternatives: ['leg-press', 'leg-curl'] },
  { id: 'chest-press', name: 'Chest press', equipment: 'machines', region: 'push', setup: 'Set the seat so the handles are around mid-chest height. Keep both feet supported.', cues: ['Keep your shoulders relaxed against the backrest.', 'Press forward smoothly.', 'Return without letting the weights slam.'], reps: '8–10', alternatives: [] },
  { id: 'seated-row', name: 'Seated row', equipment: 'machines', region: 'pull', setup: 'Sit with your feet supported. Adjust the chest pad or seat so you can comfortably reach the handles.', cues: ['Sit tall and keep your torso still.', 'Draw the handles toward your lower ribs.', 'Reach forward slowly without rounding your back.'], reps: '8–10', alternatives: ['lat-pulldown'] },
  { id: 'lat-pulldown', name: 'Lat pulldown', equipment: 'machines', region: 'pull', overhead: true, setup: 'Adjust the thigh pad to hold you comfortably. Take a grip slightly wider than your shoulders.', cues: ['Sit tall with the bar in front of you.', 'Bring the bar toward your upper chest.', 'Return slowly; do not pull behind your head.'], reps: '8–10', alternatives: ['seated-row'] },
  { id: 'goblet-squat', name: 'Goblet squat', equipment: 'dumbbells', region: 'legs', setup: 'Hold one light dumbbell close to your chest. Stand with your feet in a comfortable stance.', cues: ['Keep the weight close to you.', 'Bend at your hips and knees within a comfortable range.', 'Stand steadily with your feet planted.'], reps: '8–10', alternatives: ['sit-to-stand'] },
  { id: 'db-deadlift', name: 'Dumbbell deadlift', equipment: 'dumbbells', region: 'legs', setup: 'Stand holding light dumbbells at your sides. Keep a small bend in your knees.', cues: ['Move your hips back and keep the weights close.', 'Keep your back in a comfortable neutral position.', 'Stand tall without leaning back.'], reps: '8–10', alternatives: ['goblet-squat', 'sit-to-stand'] },
  { id: 'db-floor-press', name: 'Dumbbell floor press', equipment: 'dumbbells', region: 'push', floor: true, setup: 'Lie on a mat with knees bent and feet flat. Hold light dumbbells above your chest; lower your arms until they gently meet the floor.', cues: ['Keep your wrists comfortably straight.', 'Press up smoothly without snapping your elbows.', 'Lower gently to the floor.'], reps: '8–10', alternatives: ['wall-pushup'] },
  { id: 'db-row', name: 'Supported dumbbell row', equipment: 'dumbbells', region: 'pull', setup: 'Support one hand on a sturdy bench or counter. Hold a light dumbbell in the other hand and hinge slightly at your hips.', cues: ['Keep your torso still.', 'Draw the weight toward your hip.', 'Lower slowly; repeat on the other side.'], reps: '8–10 each side', alternatives: [] },
  { id: 'sit-to-stand', name: 'Chair sit-to-stand', equipment: 'bodyweight', region: 'legs', setup: 'Use a sturdy chair against a wall. Sit toward the front with your feet flat on the floor.', cues: ['Lean forward a little from your hips.', 'Press through your feet to stand.', 'Sit back down slowly.'], reps: '8–10', alternatives: ['standing-calf-raise'] },
  { id: 'wall-pushup', name: 'Wall push-up', equipment: 'bodyweight', region: 'push', setup: 'Place your palms on a sturdy wall around chest height. Step back to a comfortable distance.', cues: ['Keep your body in a straight line.', 'Bend your elbows to move toward the wall.', 'Press back smoothly.'], reps: '6–10', alternatives: [] },
  { id: 'standing-calf-raise', name: 'Standing calf raise', equipment: 'bodyweight', region: 'legs', setup: 'Stand beside a wall or sturdy counter for balance. Keep both feet facing forward.', cues: ['Rise onto the balls of your feet.', 'Pause briefly at the top.', 'Lower your heels with control.'], reps: '10–12', alternatives: ['sit-to-stand'] },
  { id: 'bird-dog', name: 'Bird dog', equipment: 'bodyweight', region: 'core', floor: true, setup: 'Start on hands and knees on a mat, with hands below shoulders and knees below hips.', cues: ['Reach one arm and the opposite leg comfortably.', 'Keep your hips still and breathe normally.', 'Return and change sides.'], reps: '6–8 each side', alternatives: ['standing-march'] },
  { id: 'standing-march', name: 'Standing march', equipment: 'bodyweight', region: 'core', setup: 'Stand beside a sturdy counter for balance. Keep your shoulders relaxed.', cues: ['Lift one knee within a comfortable range.', 'Lower gently and alternate sides.', 'Stay tall and keep breathing.'], reps: '8–10 each side', alternatives: ['bird-dog'] },
]
export const exerciseById = (id: string) => exercises.find(e => e.id === id)!

const exerciseId = z.enum(exercises.map(e => e.id) as [string, ...string[]])
const setSchema = z.object({ reps: z.string().max(3), weight: z.string().max(7), done: z.boolean() })
const sessionExerciseSchema = z.object({ exerciseId, sets: z.array(setSchema).min(1).max(3), skipped: z.boolean() })
const workoutSchema = z.object({
  id: z.string(), name: z.string(), sessionIndex: z.number().int().min(0).max(2),
  minutes: z.number(), short: z.boolean(), startedAt: z.string().datetime(),
  exerciseIndex: z.number().int().min(0).max(4), exercises: z.array(sessionExerciseSchema).min(1).max(5),
})
export type Workout = z.infer<typeof workoutSchema>
const completedSchema = workoutSchema.extend({ completedAt: z.string().datetime(), durationSeconds: z.number().nonnegative(), early: z.boolean(), effort: z.enum(['easy', 'manageable', 'challenging']).nullable(), note: z.string().max(500) })
export type CompletedWorkout = z.infer<typeof completedSchema>
const eventSchema = z.object({ name: z.enum(['onboarding_started', 'onboarding_completed', 'plan_created', 'workout_started', 'workout_completed', 'second_workout_completed', 'pricing_interest', 'feedback_submitted']), at: z.string().datetime() })
export type EventName = z.infer<typeof eventSchema>['name']
const feedbackSchema = z.object({ id: z.string(), at: z.string().datetime(), usefulness: z.number().int().min(1).max(5).nullable(), message: z.string().min(1).max(1000) })
export const stateSchema = z.object({
  version: z.literal(1), preferences: preferencesSchema.nullable(), theme: z.enum(['light', 'dark', 'system']),
  safetyHold: z.boolean().default(false),
  active: workoutSchema.nullable(), history: z.array(completedSchema),
  walkthroughDone: z.boolean(), researchConsent: z.boolean(), events: z.array(eventSchema),
  feedback: z.array(feedbackSchema), pricing: z.enum(['Interested', 'Maybe', 'Not for me']).nullable(),
  rescheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
})
export type AppState = z.infer<typeof stateSchema>
export const newState = (): AppState => ({ version: 1, preferences: null, theme: 'system', safetyHold: false, active: null, history: [], walkthroughDone: false, researchConsent: false, events: [], feedback: [], pricing: null, rescheduledDate: null })
export const STORAGE_KEY = 'back-to-strong.v1'
export function loadState(): { state: AppState; error: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { state: newState(), error: '' }
    const parsed = stateSchema.safeParse(JSON.parse(saved))
    if (!parsed.success || (parsed.data.active && parsed.data.active.exerciseIndex >= parsed.data.active.exercises.length)) throw new Error('invalid')
    return { state: parsed.data, error: '' }
  } catch {
    return { state: newState(), error: 'Your saved data could not be read. It has not been overwritten. Retry, export the original data, or reset it in Settings.' }
  }
}
export const uuid = () => crypto.randomUUID()
export function addEvent(state: AppState, name: EventName): AppState {
  return state.researchConsent ? { ...state, events: [...state.events, { name, at: new Date().toISOString() }].slice(-1000) } : state
}

const templates = {
  machines: [
    ['leg-press', 'chest-press', 'seated-row', 'standing-march', 'leg-curl'],
    ['leg-curl', 'seated-row', 'chest-press', 'standing-calf-raise', 'leg-press'],
    ['leg-press', 'chest-press', 'lat-pulldown', 'standing-march', 'leg-extension'],
  ],
  dumbbells: [
    ['goblet-squat', 'db-floor-press', 'db-row', 'standing-march', 'db-deadlift'],
    ['db-deadlift', 'db-row', 'db-floor-press', 'standing-calf-raise', 'goblet-squat'],
    ['goblet-squat', 'db-floor-press', 'db-row', 'bird-dog', 'standing-calf-raise'],
  ],
  bodyweight: [
    ['sit-to-stand', 'wall-pushup', 'standing-march', 'standing-calf-raise', 'bird-dog'],
    ['standing-calf-raise', 'wall-pushup', 'standing-march', 'sit-to-stand', 'bird-dog'],
    ['sit-to-stand', 'wall-pushup', 'bird-dog', 'standing-calf-raise', 'standing-march'],
  ],
}
export const sessionNames = ['Full body · A', 'Full body · B', 'Full body · C']
export function template(p: Preferences, index: number, short = false) {
  const count = short ? 3 : p.minutes === 20 ? 3 : p.minutes === 30 ? 4 : 5
  const sets = short || p.minutes !== 45 ? 2 : 3
  const ids = templates[p.equipment][index].map(id => {
    const exercise = exerciseById(id)
    if (p.avoidFloor && exercise.floor) return id === 'db-floor-press' ? 'wall-pushup' : 'standing-march'
    if (p.avoidOverhead && exercise.overhead) return 'seated-row'
    return id
  }).slice(0, count)
  return { ids: [...new Set(ids)], sets, minutes: short ? 20 : p.minutes }
}
export function createWorkout(p: Preferences, index: number, short = false): Workout {
  const plan = template(p, index, short)
  return { id: uuid(), name: sessionNames[index], sessionIndex: index, short, minutes: plan.minutes, startedAt: new Date().toISOString(), exerciseIndex: 0,
    exercises: plan.ids.map(exerciseId => ({ exerciseId, skipped: false, sets: Array.from({ length: plan.sets }, () => ({ reps: '', weight: '', done: false })) })) }
}
export function allowedAlternatives(p: Preferences, id: string) {
  return exerciseById(id).alternatives.filter(alternative => {
    const e = exerciseById(alternative)
    return (!p.avoidFloor || !e.floor) && (!p.avoidOverhead || !e.overhead)
  })
}
export function finishWorkout(state: AppState, early: boolean, now = new Date()): AppState {
  if (!state.active || !loggedSets(state.active) || state.history.some(w => w.id === state.active!.id)) return state
  const completed: CompletedWorkout = { ...state.active, completedAt: now.toISOString(), durationSeconds: Math.max(0, Math.round((now.getTime() - Date.parse(state.active.startedAt)) / 1000)), early, effort: null, note: '' }
  let next: AppState = { ...state, active: null, history: [...state.history, completed], rescheduledDate: null }
  next = addEvent(next, 'workout_completed')
  if (next.history.length === 2) next = addEvent(next, 'second_workout_completed')
  return next
}
export const loggedSets = (w: Workout) => w.exercises.reduce((sum, e) => sum + e.sets.filter(s => s.done).length, 0)
export const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export function weekDates(now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)
  return DAYS.map((label, i) => { const date = new Date(monday); date.setDate(date.getDate() + i); return { label, date: localDate(date) } })
}
export function nextSessionDate(p: Preferences, rescheduled: string | null, now = new Date()) {
  if (rescheduled && rescheduled >= localDate(now)) return new Date(rescheduled + 'T12:00:00')
  for (let i = 0; i < 7; i++) {
    const date = new Date(now); date.setDate(date.getDate() + i)
    if (p.days.includes(DAYS[(date.getDay() + 6) % 7])) return date
  }
  return now
}
export function nextDate(state: AppState) {
  const now = new Date()
  if (state.history.some(w => localDate(new Date(w.completedAt)) === localDate(now))) now.setDate(now.getDate() + 1)
  return nextSessionDate(state.preferences!, state.rescheduledDate, now)
}
export const formatDay = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })
export const weeklyCount = (state: AppState) => state.history.filter(w => weekDates().some(d => d.date === localDate(new Date(w.completedAt)))).length
