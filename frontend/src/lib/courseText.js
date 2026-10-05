// Course fields that hold wording shown on the course page. The admin page
// editor makes these click-to-edit and saves them through
// PUT /admin/courses/:id/text-fields (backend keeps the same list), which only
// changes text - numbers, links, dates and list lengths stay as they are.
export const COURSE_TEXT_FIELDS = [
  'title',
  'summary',
  'eyebrow',
  'heroNote',
  'badges',
  'trustStat',
  'duration',
  'location',
  'format',
  'intakeLabel',
  'curriculum',
  'whatYouWillLearn',
  'whoShouldAttend',
  'entryRequirements',
  'certification',
  'trainingStandards',
  'bottomBanner',
  'processSteps',
  'trainingPhilosophy',
  'dgrExplorer',
  'sidebarSpecs',
  'price',
  'rateCard',
  'ctaLabel'
]

// The editable slice of a course, deep-copied so edits never touch the original.
export function pickCourseText(course = {}) {
  const out = {}
  for (const key of COURSE_TEXT_FIELDS) {
    if (course[key] !== undefined && course[key] !== null) out[key] = JSON.parse(JSON.stringify(course[key]))
  }
  return out
}
