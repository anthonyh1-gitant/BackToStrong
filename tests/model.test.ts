import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allowedAlternatives, createWorkout, defaultPreferences, exerciseById, finishWorkout, newState, stateSchema, template } from '../src/model.ts'

test('all equipment/time combinations respect floor and overhead preferences', () => {
  for (const equipment of ['machines', 'dumbbells', 'bodyweight'] as const)
    for (const minutes of [20, 30, 45] as const)
      for (const avoidFloor of [true, false])
        for (const avoidOverhead of [true, false]) {
          const preferences = { ...defaultPreferences, equipment, minutes, avoidFloor, avoidOverhead }
          for (let index = 0; index < 3; index++) {
            const plan = template(preferences, index)
            assert.ok(plan.ids.length >= 3 && plan.ids.length <= 5)
            assert.equal(new Set(plan.ids).size, plan.ids.length)
            for (const id of plan.ids) {
              const exercise = exerciseById(id)
              assert.ok(!avoidFloor || !exercise.floor)
              assert.ok(!avoidOverhead || !exercise.overhead)
              assert.ok(exercise.equipment === equipment || exercise.equipment === 'bodyweight')
              for (const alternative of allowedAlternatives(preferences, id)) {
                assert.ok(!avoidFloor || !exerciseById(alternative).floor)
                assert.ok(!avoidOverhead || !exerciseById(alternative).overhead)
              }
            }
          }
        }
})
test('short versions stay within the fixed 20-minute/two-set template', () => {
  const short = template({ ...defaultPreferences, minutes: 45 }, 0, true)
  assert.equal(short.minutes, 20)
  assert.equal(short.sets, 2)
  assert.equal(short.ids.length, 3)
})
test('completion records only logged sets and cannot duplicate a session', () => {
  const state = newState()
  state.preferences = defaultPreferences
  state.active = createWorkout(defaultPreferences, 0)
  assert.equal(finishWorkout(state, true), state, 'empty activity is not a completed workout')
  state.active.exercises[0].sets[0] = { reps: '8', weight: '5', done: true }
  const completed = finishWorkout(state, true)
  assert.equal(completed.history.length, 1)
  assert.equal(completed.active, null)
  assert.equal(finishWorkout(completed, true).history.length, 1)
  assert.equal(finishWorkout({ ...completed, active: state.active }, false).history.length, 1)
})
test('invalid schedules are rejected while older compatible records receive the safety default', () => {
  assert.equal(stateSchema.safeParse({ ...newState(), preferences: { ...defaultPreferences, days: ['Mon', 'Mon'] } }).success, false)
  assert.equal(stateSchema.safeParse({ ...newState(), preferences: { ...defaultPreferences, frequency: 3 } }).success, false)
  const previous = { ...newState(), safetyHold: undefined }
  assert.equal(stateSchema.parse(previous).safetyHold, false)
})
