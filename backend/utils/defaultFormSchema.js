const {
  BANK_DETAILS,
  COURSE_ACKNOWLEDGEMENT_TEXT,
  TERMS_AND_CONDITIONS,
  PRIVACY_NOTICE,
  CONSENT_TEXTS
} = require('./staticContent')

const bankDetailsText = [
  BANK_DETAILS.beneficiary.name,
  ...BANK_DETAILS.beneficiary.address,
  '',
  'Bank Details:',
  BANK_DETAILS.bank.name,
  ...BANK_DETAILS.bank.address,
  '',
  `IBAN: ${BANK_DETAILS.bank.iban}`,
  `BIC: ${BANK_DETAILS.bank.bic}`,
  '',
  BANK_DETAILS.note
].join('\n')

const termsText = [
  ...TERMS_AND_CONDITIONS.map((t, i) => `${i + 1}. ${t}`),
  '',
  `Privacy notice: ${PRIVACY_NOTICE}`
].join('\n')

// The starting point for every new course's enrollment form. Admins clone and
// then edit this per course in the Form Builder.
const defaultFormSchema = {
  sections: [
    {
      id: 'intake',
      title: 'Course Intake',
      description: 'Select the scheduled intake you wish to enroll in',
      order: 0,
      fields: [
        { id: 'intake', label: 'Intake Selection', type: 'intake', required: true, order: 0 }
      ]
    },
    {
      id: 'student-info',
      title: 'Student Information',
      description: 'Personal, identification, contact, and background details',
      order: 1,
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', required: true, order: 0 },
        { id: 'surname', label: 'Surname', type: 'text', required: true, order: 1 },
        { id: 'passportNumber', label: 'Passport Number', type: 'text', required: true, order: 2 },
        { id: 'passportCountry', label: 'Passport Country of Issue', type: 'country', required: true, order: 3 },
        { id: 'passportExpiryDate', label: 'Passport Expiry Date', type: 'date', required: true, order: 4 },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, order: 5 },
        { id: 'citizenship', label: 'Citizenship', type: 'country', required: true, order: 6 },
        {
          id: 'schengenVisa',
          label: 'Schengen Visa',
          type: 'radio',
          required: true,
          options: ['Yes', 'No', 'Not Needed'],
          order: 7
        },
        {
          id: 'usVisa',
          label: 'US Visa',
          type: 'radio',
          required: true,
          options: ['Yes', 'No', 'Not Needed'],
          order: 8
        },
        {
          id: 'idNotice',
          label: '',
          type: 'staticText',
          content:
            'Two copies of the Passport or Government Photo ID Documents with the exact matching name must be sent separately to info@theIFOA.com.',
          order: 9
        },
        { id: 'mobilePhone', label: 'Mobile Phone', type: 'tel', required: true, order: 10 },
        { id: 'email', label: 'Email Address', type: 'email', required: true, order: 11 },
        { id: 'street', label: 'Street & Number', type: 'text', required: true, order: 12 },
        { id: 'zipCode', label: 'Zip / Postal Code', type: 'text', required: true, order: 13 },
        { id: 'stateProvince', label: 'State / Province / Region', type: 'text', required: true, order: 14 },
        { id: 'country', label: 'Country', type: 'country', required: true, order: 15 },
        {
          id: 'englishLevel',
          label: 'English Language Proficiency',
          type: 'select',
          required: true,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Proficient'],
          order: 16
        },
        {
          id: 'education',
          label: 'Highest Level of Education',
          type: 'select',
          required: true,
          options: ['High School', 'Bachelor (BSc/BBA)', 'Master (MSc/MBA)', 'Doctorate (Ph.D./DBA)'],
          order: 17
        },
        {
          id: 'aviationExperience',
          label: 'Aviation Experience',
          type: 'select',
          required: true,
          options: ['Ab Initio', 'Intermediate', 'Experienced'],
          order: 18
        },
        {
          id: 'isLicensedDispatcher',
          label: 'Licensed Flight Dispatcher',
          type: 'radio',
          required: true,
          options: ['Yes', 'No'],
          order: 19
        }
      ]
    },
    {
      id: 'company-info',
      title: 'Company Information',
      description: 'Corporate affiliation and operational details',
      order: 2,
      fields: [
        {
          id: 'hasCompanyInfo',
          label: 'Are you enrolling on behalf of, or sponsored by, a company?',
          type: 'radio',
          required: true,
          options: ['Yes', 'No'],
          order: 0
        },
        {
          id: 'name',
          label: 'Registered Company Name',
          type: 'text',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 1
        },
        {
          id: 'telephone',
          label: 'Company Telephone',
          type: 'tel',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 2
        },
        {
          id: 'email',
          label: 'Business Contact Email',
          type: 'email',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 3
        },
        {
          id: 'street',
          label: 'Street & Number',
          type: 'text',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 4
        },
        {
          id: 'zipCode',
          label: 'Zip / Postal Code',
          type: 'text',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 5
        },
        {
          id: 'stateProvince',
          label: 'State / Province / Region',
          type: 'text',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 6
        },
        {
          id: 'country',
          label: 'Country',
          type: 'country',
          required: true,
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 7
        },
        {
          id: 'operationTypes',
          label: 'Type of Operations',
          type: 'checkboxGroup',
          required: true,
          options: ['Airlines', 'Business Aviation', 'Flight Support', 'Government', 'CAA', 'Other'],
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 8
        },
        {
          id: 'operationOtherDetails',
          label: 'Please indicate other operation details',
          type: 'text',
          required: false,
          requiredIf: { fieldId: 'operationTypes', equals: 'Other' },
          visibleIf: { fieldId: 'hasCompanyInfo', equals: 'Yes' },
          order: 9
        }
      ]
    },
    {
      id: 'course-request',
      title: 'Course Request',
      description: 'Review the course details and certificate statement',
      order: 3,
      fields: [
        {
          id: 'programInfo',
          label: 'Selected Training Program',
          type: 'staticText',
          content: 'Flight Dispatcher Initial, 3500 EUR',
          order: 0
        },
        {
          id: 'acknowledgementAccepted',
          label: COURSE_ACKNOWLEDGEMENT_TEXT,
          type: 'checkbox',
          required: true,
          order: 1
        }
      ]
    },
    {
      id: 'payment-information',
      title: 'Payment Information',
      description: 'Bank wire transfer details',
      order: 4,
      fields: [
        {
          id: 'bankDetails',
          label: 'Payment Information (Bank Wire Transfer)',
          type: 'staticText',
          content: bankDetailsText,
          order: 0
        }
      ]
    },
    {
      id: 'billing-address',
      title: 'Billing Address & Tax ID',
      description: 'Invoice recipient, tax information and billing address',
      order: 5,
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', required: true, order: 0 },
        { id: 'surname', label: 'Surname', type: 'text', required: true, order: 1 },
        { id: 'companyName', label: 'Company Name', type: 'text', required: true, order: 2 },
        { id: 'vatNumber', label: 'VAT / Tax ID Number', type: 'text', required: true, order: 3 },
        { id: 'telephone', label: 'Telephone', type: 'tel', required: true, order: 4 },
        { id: 'email', label: 'Accounts Payable Email', type: 'email', required: true, order: 5 },
        { id: 'street', label: 'Street & Number', type: 'text', required: true, order: 6 },
        { id: 'zipCode', label: 'Zip / Postal Code', type: 'text', required: true, order: 7 },
        { id: 'stateProvince', label: 'State / Province / Region', type: 'text', required: true, order: 8 },
        { id: 'country', label: 'Country', type: 'country', required: true, order: 9 }
      ]
    },
    {
      id: 'terms-conditions',
      title: 'Terms & Conditions & Consent',
      description: 'Legal agreement, data protection policy and final authorization',
      order: 6,
      fields: [
        { id: 'termsText', label: 'Academy Enrollment Policy', type: 'staticText', content: termsText, order: 0 },
        {
          id: 'dataProcessingAccepted',
          label: CONSENT_TEXTS.dataProcessing,
          type: 'checkbox',
          required: true,
          order: 1
        },
        { id: 'termsAccepted', label: CONSENT_TEXTS.terms, type: 'checkbox', required: true, order: 2 }
      ]
    }
  ]
}

module.exports = { defaultFormSchema }
