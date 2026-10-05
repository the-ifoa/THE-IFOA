import { api } from '@/lib/api'

// Courses fetched this session, so switching between a course's location
// editions (or coming back to a course) renders without a loading spinner.
const loaded = new Map()
const inflight = new Map()

export const cachedCourse = (slug) => loaded.get(slug) || null

export function fetchCourse(slug) {
  if (!inflight.has(slug)) {
    inflight.set(
      slug,
      api
        .getCourse(slug)
        .then((data) => {
          loaded.set(slug, data.course)
          return data.course
        })
        .finally(() => inflight.delete(slug))
    )
  }
  return inflight.get(slug)
}

// Fetch in the background; errors are ignored (the page fetches again on open).
export function prefetchCourse(slug) {
  if (slug && !loaded.has(slug)) fetchCourse(slug).catch(() => {})
}
