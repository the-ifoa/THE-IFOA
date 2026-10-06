// Boilerplate text reused by the default form template. Admins can edit any of
// this per-course afterwards via the Form Builder - this only seeds the default.

const BANK_DETAILS = {
  beneficiary: {
    name: 'International Flight Operations Academy GmbH',
    address: ['Oberdorf 26', '4314 Zeiningen', 'Switzerland']
  },
  bank: {
    name: 'Revolut Bank UAB',
    address: ['Konstitucijos ave. 21B', '08130 Vilnius', 'Lithuania'],
    iban: 'LT04 3250 0415 2968 6697',
    bic: 'REVOLT21'
  },
  note: 'IMPORTANT: Bank transfer fees are at the charge of the Student or Company applying for training.'
}

const COURSE_ACKNOWLEDGEMENT_TEXT =
  'I understand that IFOA issues an IFOA Certificate of Completion when I complete the course. It is not a government-issued license or certificate.'

const TERMS_AND_CONDITIONS = [
  'The enrollment form duly filled out and signed shall be emailed to info@theIFOA.com',
  'Students must provide accurate information on the enrollment form. Students discovered to have falsified or misrepresented information may be liable to expulsion from the program.',
  'The total tuition fee is due at least one month before the start of the training.',
  'Cancellation Policy: a) Cancellation 30 days or less before the training start date: IFOA is entitled to charge 50% of the tuition fee. b) Cancellation 14 days or less before the training start date: IFOA is entitled to charge the full tuition fee. c) IFOA reserves the right to cancel or re-schedule courses within three (3) days’ notice for Force Majeure or if the minimum number of students required to ensure efficient training is not reached. All pre-paid fees will automatically be refunded or move toward the next available course in case of cancellation. All other costs, fees, and disbursements will be the student’s responsibility.',
  'IFOA is not responsible if a visa or entry to the training country is refused.',
  'Changing the date is allowed only once for the same paid course. Notify and email info@theIFOA.com. Our team will re-schedule contingent on the next available training date.',
  'Participants can only be transferred or changed once for the same paid course. To do so, notify and email info@theIFOA.com.',
  'Bring a copy of the confirmation message on the first day of the training course.',
  'Total attendance at the training is required to release the training certificate.',
  'IFOA instructor teams will fulfill their obligations to deliver the highest education standards and support the students in exam preparation; however, students must take responsibility for their studies, including attending all scheduled classes, intermediate evaluations, and successful final exams. IFOA cannot be held responsible for exam failure. Furthermore, IFOA has no obligation to refund the students in case of program failure.',
  'Students agree to behave respectfully and ethically to all other fellow students, instructors, examiners, and other members of IFOA. Any transgression or misconduct, including cheating, will directly lead to expulsion from the program.'
]

const PRIVACY_NOTICE =
  'IFOA uses your personal data to process your application, deliver the course and meet legal obligations, as set out in our Privacy Policy (https://theifoa.com/privacy-policy). We keep it only as long as needed for those purposes, including legal retention periods (for example ten years for accounting records). You can ask us to access, correct or delete your data at any time.'

const CONSENT_TEXTS = {
  dataProcessing: 'I consent to my data being processed as described in the privacy notice above.',
  terms:
    'I understand that I have read and accepted the terms and conditions stated on this form by selecting this checkbox.'
}

const CONTACT_INFO = {
  email: 'info@theIFOA.com',
  phone: '+41 78 227 3103'
}

module.exports = {
  BANK_DETAILS,
  COURSE_ACKNOWLEDGEMENT_TEXT,
  TERMS_AND_CONDITIONS,
  PRIVACY_NOTICE,
  CONSENT_TEXTS,
  CONTACT_INFO
}
