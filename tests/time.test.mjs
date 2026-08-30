import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addMonths,
  getArchiveCutoffDate,
  getArchiveInitialWindow,
  getDateStringForTimezone,
  getNextArchiveWindow,
  getSlotForTimezone,
} from '../lib/domain/time.ts'

test('slot uses the requested timezone, not the runner timezone', () => {
  const now = new Date('2026-08-30T16:30:00Z')
  assert.equal(getSlotForTimezone('Europe/Rome', now), 'evening')
  assert.equal(getSlotForTimezone('America/New_York', now), 'morning')
})

test('morning starts at 05:00 and evening starts at 18:00 local time', () => {
  assert.equal(getSlotForTimezone('UTC', new Date('2026-08-30T04:59:00Z')), 'evening')
  assert.equal(getSlotForTimezone('UTC', new Date('2026-08-30T05:00:00Z')), 'morning')
  assert.equal(getSlotForTimezone('UTC', new Date('2026-08-30T17:59:00Z')), 'morning')
  assert.equal(getSlotForTimezone('UTC', new Date('2026-08-30T18:00:00Z')), 'evening')
})

test('date string follows the user timezone across UTC day boundaries', () => {
  const now = new Date('2026-08-30T23:30:00Z')
  assert.equal(getDateStringForTimezone('Europe/Rome', now), '2026-08-31')
  assert.equal(getDateStringForTimezone('America/New_York', now), '2026-08-30')
})

test('month subtraction clamps to the last valid day of the target month', () => {
  assert.equal(addMonths('2026-08-30', -6), '2026-02-28')
  assert.equal(addMonths('2024-08-31', -6), '2024-02-29')
})

test('archive initial window is 14 days plus an exclusive next-day upper bound', () => {
  assert.deepEqual(getArchiveInitialWindow('2026-08-30'), {
    lowerBound: '2026-08-16',
    upperBound: '2026-08-31',
  })
})

test('archive pagination never crosses the six-month cutoff', () => {
  const cutoff = getArchiveCutoffDate('2026-08-30')
  assert.equal(cutoff, '2026-02-28')
  assert.deepEqual(getNextArchiveWindow('2026-03-05', cutoff), {
    lowerBound: '2026-02-28',
    upperBound: '2026-03-05',
  })
  assert.equal(getNextArchiveWindow('2026-02-28', cutoff), undefined)
})
