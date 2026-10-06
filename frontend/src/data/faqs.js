// Service FAQs, transcribed from the signed-off course pages (ifoa-*.html).
// One source for both the /faq page and the "Questions" block on each course
// page (CourseDetailView appends it when the course overview has no faq block
// of its own). Answers support **bold** and [label](href) like the overview
// blocks do.

const TERMS = "They're set out in our Terms and Conditions. Please read them before you apply."
const VISA = "Contact us before you apply and we'll tell you what support is available for your situation."

const dispatcherInitial = (onlineWeeks) => [
  {
    q: 'Is this an EASA license?',
    a: 'No. EASA does not issue flight dispatcher licenses. Operators in Europe decide who can dispatch for them. This course gives you the structured training they look for, and an IFOA certificate to show it.'
  },
  {
    q: 'Will this get me a job?',
    a: 'No course can guarantee that. It gives you the knowledge and skills operators expect from a new dispatcher, and your employer will then train you on its own procedures.'
  },
  ...(onlineWeeks ? [{ q: 'What happens in the online weeks?', a: onlineWeeks }] : []),
  { q: 'Do you help with visas and accommodation?', a: VISA },
  { q: 'What are the payment and refund terms?', a: TERMS }
]

export const FAQ_SECTIONS = [
  {
    id: 'flight-dispatcher-initial',
    title: 'Flight Dispatcher Initial',
    courseSlug: 'flight-dispatcher-initial-certification',
    items: dispatcherInitial(
      'Live and self-paced study from home, so the on-site weeks (Sønderborg, Daytona Beach or New Delhi) can focus on practical work with instructors.'
    )
  },
  {
    id: 'faa-aircraft-dispatcher',
    title: 'FAA Aircraft Dispatcher (Part 65)',
    courseSlug: 'aircraft-dispatcher-training-faa-part-65',
    items: [
      {
        q: 'Do I need to be a US citizen?',
        a: 'No. The FAA Aircraft Dispatcher certificate is open to any nationality. You need to meet the age and English requirements.'
      },
      {
        q: 'Is ADX preparation part of the 200 hours?',
        a: 'No. The 200 hours are the FAA-approved course. You prepare for the ADX separately, in your own time, using our learning portal and weekly masterclasses, which are included in the tuition.'
      },
      {
        q: 'When should I take the ADX?',
        a: 'Before or during the course. Your ADX result stays valid for 24 months, so you have time to complete the practical test.'
      },
      {
        q: 'Is the IFOA certificate the same as the FAA certificate?',
        a: 'No. IFOA issues an IFOA Certificate of Completion, your graduation certificate, when you complete the course. The FAA issues the Aircraft Dispatcher certificate once you pass the knowledge and practical tests.'
      },
      { q: 'Do you help with visas and accommodation?', a: VISA },
      { q: 'What are the payment and refund terms?', a: TERMS }
    ]
  },
  {
    id: 'dispatcher-double-programme',
    title: 'Double Program: FAA & EASA',
    courseSlug: 'flight-dispatcher-double-programme',
    items: [
      {
        q: 'Is this a dual license?',
        a: 'No. The only license is the FAA Aircraft Dispatcher certificate, and the FAA issues it, not IFOA. EASA does not issue dispatcher licenses. The ICAO and EASA part shows European operators you can work under their rules.'
      },
      {
        q: 'Is ADX preparation part of the 280 hours?',
        a: 'No. The 280 hours are the program. You prepare for the ADX separately, in your own time, with our learning portal and weekly masterclasses.'
      },
      {
        q: 'Why not take the two courses separately?',
        a: 'The double program is shorter and teaches both systems side by side, so you learn where FAA and EASA rules differ as you go.'
      },
      {
        q: 'Do I need to be a US citizen?',
        a: 'No. The FAA Aircraft Dispatcher certificate is open to any nationality. You need to meet the age and English requirements.'
      },
      {
        q: 'Does the price change by location?',
        a: 'No. The fee is $5,500 USD at every location: Denmark and India. FAA test and examiner fees are paid separately.'
      },
      { q: 'What are the payment and refund terms?', a: TERMS }
    ]
  },
  {
    id: 'dangerous-goods',
    title: 'Dangerous Goods Training',
    courseSlug: 'dangerous-goods-regulations-cbta-initial',
    items: [
      {
        q: "We don't carry dangerous goods. Do we still need training?",
        a: "Yes. Every operator must train its staff, whether or not it carries DG. For a no-carry operator, the training covers recognizing DG, refusing it and reporting it. It doesn't cover acceptance procedures you'll never use."
      },
      {
        q: 'How long is the certificate valid?',
        a: "24 months. Recurrent training must be completed within that period. We send a reminder before it's due."
      },
      {
        q: 'Can the training follow our own procedures?',
        a: 'Yes. Operator programs are built around your operations manual and DG policy. Groups that choose the standard version follow it for each role and operation.'
      },
      {
        q: "What's the difference between initial and recurrent?",
        a: 'Initial is a full course for anyone new to the role or the operation type. Recurrent is shorter: it covers regulation changes, recent occurrences and a new assessment.'
      },
      {
        q: "My role isn't listed.",
        a: "Ground handling, acceptance and freight staff need a different course. [Contact us](/contact) and we'll tell you which one applies."
      }
    ]
  },
  {
    id: 'crew-control',
    title: 'Crew Control Training',
    courseSlug: 'airline-crew-control-flight-rostering',
    items: [
      {
        q: 'We run both CAT and air taxi. Is that covered?',
        a: 'Yes. The course covers both frameworks and how to tell which one applies to a given flight, which is where most legality errors start.'
      },
      {
        q: 'What changes in the tailored version?',
        a: 'We build the course from your OM-A Chapter 7: your FTL scheme, your company procedures and your rosters. Participants train on the exact rules they apply on shift, not a generic version.'
      },
      {
        q: 'Is it only for new crew controllers?',
        a: 'No. Experienced staff use it as a refresher on current rules and on fatigue risk beyond legal limits.'
      },
      {
        q: 'Do participants need to know a rostering system?',
        a: 'No. The course is system-independent. Tell us which system you use and we can reference it in the exercises.'
      }
    ]
  },
  {
    id: 'human-factors-occ',
    title: 'Human Factors for the OCC',
    courseSlug: 'human-factors-in-the-occ',
    items: [
      {
        q: 'How is this different from CRM?',
        a: 'CRM was written for flight crew. This course covers the same discipline for ground roles: shift fatigue, disruption-day stress, coordinating many stakeholders, and deciding with AI tools.'
      },
      {
        q: "We don't use AI tools yet. Is Module 11 still relevant?",
        a: 'Yes. The same traps apply to any automation your OCC relies on today, and most operators will introduce AI decision-support within the next few years. Better to set the habits before the tools arrive.'
      },
      {
        q: 'Can you use our own events and procedures?',
        a: 'Yes. For in-house delivery we build the scenarios around your operation, your manuals and your recent disruptions.'
      },
      {
        q: 'Can we mix roles in one group?',
        a: 'We recommend it. Dispatch, crew control and MCC working through the same scenario is where most communication gaps show up.'
      }
    ]
  },
  {
    id: 'train-the-trainer',
    title: 'Train the Trainer',
    courseSlug: 'train-the-trainer-icao-cbta-instructor',
    items: [
      {
        q: 'Do I need teaching experience?',
        a: 'No. The course starts from the basics of how adults learn. Experienced instructors use it to formalize what they already do.'
      },
      {
        q: 'What do I present on?',
        a: "A topic from your own work. That way you practice on material you'll actually teach."
      },
      {
        q: 'Is there homework?',
        a: 'Only on Day 3: you get 1 to 2 hours to prepare your 20-minute presentation.'
      },
      {
        q: 'Can you run it for our instructors only?',
        a: 'Yes. In-house courses run at your base, and the teaching practices use your own training content.'
      }
    ]
  },
  {
    id: 'occ-consulting',
    title: 'OCC and Flight Operations Consulting',
    courseSlug: 'airline-occ-setup-operational-consulting',
    items: [
      {
        q: "We're a small operator. Is this for us?",
        a: 'Yes. We size the work to the operation. A small operator usually needs a focused review or one manual section, not a full program.'
      },
      {
        q: 'Do you just advise, or do you implement?',
        a: 'Both. We can deliver a report and leave it with your team, or work alongside them until the changes are in place and your staff are trained.'
      },
      {
        q: 'We have an authority audit coming up. Can you help in time?',
        a: "Tell us the audit date when you contact us. We'll say honestly what can be done before it."
      },
      {
        q: 'Is our information kept confidential?',
        a: 'Yes. We sign an NDA before reviewing your manuals or data if you ask.'
      }
    ]
  }
]

const BY_SLUG = Object.fromEntries(FAQ_SECTIONS.map((s) => [s.courseSlug, s]))

export function faqForCourse(slug) {
  return BY_SLUG[slug] || null
}

// Plain text for search and structured data: drops the **bold** and
// [label](href) markup.
export function faqPlainText(text = '') {
  return String(text)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}
