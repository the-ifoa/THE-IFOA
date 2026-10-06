// Client-side helpers for the dynamic enrollment form. Mirrors the server
// rules in backend/utils/validateAnswers.js - keep the two in sync.
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js/min'

export function emptyValueForField(field) {
  if (field.type === 'checkbox') return false
  if (field.type === 'checkboxGroup') return []
  return ''
}

export function buildEmptyAnswers(sections) {
  const answers = {}
  for (const section of sections) {
    answers[section.id] = {}
    for (const field of section.fields) {
      if (field.type === 'staticText') continue
      answers[section.id][field.id] = emptyValueForField(field)
    }
  }
  return answers
}

export function isFieldEmpty(field, value) {
  if (field.type === 'checkbox') return value !== true
  if (field.type === 'checkboxGroup') return !Array.isArray(value) || value.length === 0
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '')
  )
}

function conditionMet(condition, sectionAnswers) {
  const refValue = sectionAnswers?.[condition.fieldId]
  if (Array.isArray(refValue)) return refValue.includes(condition.equals)
  return refValue === condition.equals
}

export function isFieldRequired(field, sectionAnswers) {
  const idLower = String(field.id || '').toLowerCase()
  const isConsentOrAgreement =
    field.type === 'checkbox' &&
    (field.required ||
      idLower.includes('terms') ||
      idLower.includes('consent') ||
      idLower.includes('acknowledgement') ||
      idLower.includes('dataprocessing'))

  return Boolean(
    field.required ||
      (field.requiredIf && conditionMet(field.requiredIf, sectionAnswers)) ||
      isConsentOrAgreement
  )
}

export function isFieldVisible(field, sectionAnswers) {
  return !field.visibleIf || conditionMet(field.visibleIf, sectionAnswers)
}

// A section reads as "Completed" only once its required fields are filled.
export function isSectionComplete(section, sectionAnswers = {}) {
  const fillableFields = section.fields.filter(
    (field) => field.type !== 'staticText' && isFieldVisible(field, sectionAnswers)
  )
  if (fillableFields.length === 0) return false

  const requiredFields = fillableFields.filter((field) => isFieldRequired(field, sectionAnswers))
  if (requiredFields.length > 0) {
    return requiredFields.every((field) => !isFieldEmpty(field, sectionAnswers[field.id]))
  }
  return fillableFields.some((field) => !isFieldEmpty(field, sectionAnswers[field.id]))
}

export function isTrackableSection(section) {
  return section.fields.some((field) => field.type !== 'staticText')
}

export function getSubmissionDisplayName(submission) {
  const sections = submission.formSchemaSnapshot || []
  let firstName
  let surname
  let email

  for (const section of sections) {
    for (const field of section.fields) {
      const val = submission.answers?.[section.id]?.[field.id]
      if (typeof val !== 'string' || !val) continue
      if ((field.id === 'firstName' || field.id === 'first_name') && !firstName) firstName = val
      if ((field.id === 'surname' || field.id === 'lastName') && !surname) surname = val
      if (field.type === 'email' && !email) email = val
    }
  }

  if (firstName || surname) return [firstName, surname].filter(Boolean).join(' ')
  if (email) return email
  return `Submission ${String(submission._id).slice(-6)}`
}

export function getSubmissionQuickInfo(submission) {
  const sections = submission.formSchemaSnapshot || []
  const info = {
    name: getSubmissionDisplayName(submission),
    email: null,
    phone: null,
    citizenship: null,
    passportNumber: null,
    trainingLocation: null // dispatcher forms ask where to train
  }

  for (const section of sections) {
    for (const field of section.fields) {
      const val = submission.answers?.[section.id]?.[field.id]
      if (typeof val !== 'string' || !val) continue
      if (field.type === 'email' && !info.email) info.email = val
      if (field.type === 'tel' && !info.phone) info.phone = val
      if (field.id === 'citizenship' && !info.citizenship) info.citizenship = val
      if (field.id === 'passportNumber' && !info.passportNumber) info.passportNumber = val
      if (field.id === 'trainingCountry' && !info.trainingLocation) info.trainingLocation = val
    }
  }

  return info
}

export function getSubmissionSearchText(submission) {
  return JSON.stringify(submission.answers || {}).toLowerCase()
}

const NAME_IDS = new Set(['firstName', 'first_name', 'surname', 'lastName', 'last_name'])
const isPhoneField = (field) =>
  field.type === 'tel' ||
  field.id === 'mobilePhone' ||
  field.id === 'telephone' ||
  /phone|telephone/i.test(field.label || '')

// Returns a short message when a filled-in value has the wrong format, or ''.
// Empty values are left to the "required" check.
export function getFormatError(field, value) {
  if (value === undefined || value === null || typeof value !== 'string' || !value.trim()) return ''
  const v = value.trim()

  if (field.type === 'email' || /email/i.test(field.id)) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address, e.g. name@company.com'
  }

  if (isPhoneField(field)) {
    const national = v.replace(/^\+\d{1,4}\s*/, '')
    if (!national) return ''
    if (!isValidPhoneNumber(v)) {
      const dial = parsePhoneNumberFromString(v)?.countryCallingCode
      return `Enter a valid phone number${dial ? ` for +${dial}` : ''}`
    }
  }

  if (NAME_IDS.has(field.id) && !/^[\p{L}][\p{L}\p{M}' .-]*$/u.test(v)) return 'Use letters only'

  if (field.type === 'date') {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return 'Enter a valid date'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (/birth/i.test(field.id) && d >= today) return 'Enter a date in the past'
    if (/expir/i.test(field.id) && d <= today) return 'The passport must still be valid'
  }

  if (/zip|postal/i.test(field.id) && !/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(v)) return 'Enter a valid postal code'

  return ''
}

export function getDetailedValidationErrors(sections, answers) {
  const errors = []

  for (const section of sections) {
    const sectionAnswers = answers?.[section.id] || {}
    for (const field of section.fields) {
      // `intake` is validated against the course's live intakes by the caller.
      if (field.type === 'staticText' || field.type === 'intake') continue
      if (!isFieldVisible(field, sectionAnswers)) continue
      const formatError = getFormatError(field, sectionAnswers[field.id])
      if (formatError) {
        const label = field.label || field.id
        errors.push({ sectionId: section.id, fieldId: field.id, label, fieldMessage: formatError, message: `${section.title}: ${label}: ${formatError}.` })
        continue
      }
      if (isFieldRequired(field, sectionAnswers) && isFieldEmpty(field, sectionAnswers[field.id])) {
        const label = field.label || field.id
        const message =
          field.type === 'checkbox'
            ? `${section.title}: You must accept ${
                label.length > 50 ? label.slice(0, 47) + '…' : label
              }.`
            : `${section.title}: ${label} is required.`
        errors.push({ sectionId: section.id, fieldId: field.id, label, message })
      }
    }
  }

  return errors
}

export function validateSchemaAnswers(sections, answers) {
  return getDetailedValidationErrors(sections, answers).map((e) => e.message)
}

// Terms lines tagged "[India] " apply only to applicants training in India:
// keep them (tag removed) when India is picked, drop them otherwise, and renumber.
export function termsForLocation(content = '', location = '') {
  if (!content.includes('[India] ')) return content;
  const isIndia = /india/i.test(location || '');
  let n = 0;
  return content
    .split('\n')
    .filter((line) => isIndia || !/^\d+\.\s*\[India\] /.test(line.trim()))
    .map((line) => {
      const m = line.trim().match(/^\d+\.\s*(.*)$/);
      return m ? `${++n}. ${m[1].replace('[India] ', '')}` : line;
    })
    .join('\n');
}
