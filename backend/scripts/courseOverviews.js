// Approved page copy for each course overview page, as ordered content blocks
// rendered by frontend/src/components/course/CourseOverview.jsx. Transcribed
// section-for-section from the signed-off HTML pages (ifoa-*.html).
//
// `overview` renders the page body; `fields` are the sidebar facts (price,
// spec rows, buttons) set on the course itself. Applied by
// scripts/seedCatalog.js.

const TERMS = 'Payment, cancellation and refunds: see our Terms and Conditions.'

const PROPOSAL = '/contact'

module.exports = {
  // ---------------------------------------------------------------------------
  'flight-dispatcher-initial-certification': {
    fields: {
      intakes: [{ label: '4 January 2027', startDate: new Date('2027-01-04T09:00:00Z'), isActive: true }],
      // India also has its own page (flight-dispatcher-initial-training-india),
      // whose Apply button opens this form with India pre-selected.
      locationPrices: [{ location: 'India (New Delhi)', amount: 99999, currency: 'INR', duration: '4 Weeks' }],
      price: { amount: 3500, currency: 'EUR', note: 'Includes training materials, examination and certificate. Travel, accommodation, meals and visa are not included.' },
      sidebarSpecs: [
        { label: 'Next intake', value: '4 January 2027' },
        { label: 'Duration', value: '5 weeks' },
        { label: 'Format', value: '2 weeks online, 3 weeks on-site' },
        { label: 'Location', value: 'Sønderborg, Denmark' },
        { label: 'Assessment', value: 'Practical and multiple-choice exam' },
        { label: 'Certificate', value: 'IFOA Flight Dispatch Completion Certificate' }
      ],
      enrollLabel: 'Apply online'
    },
    overview: {
      sidebarNote: TERMS,
      hero: {
        title: 'Flight Dispatcher Initial Training',
        lead: "Five weeks to learn how to plan, release and follow a flight, and make the calls when it doesn't go to plan. Built on ICAO Doc 10106 and taught by working dispatchers.",
        blocks: [
          {
            type: 'track',
            items: [
              { label: 'Week 1', title: 'Online' },
              { label: 'Week 2', title: 'Online' },
              { label: 'Week 3', title: 'Sønderborg', tone: 'on' },
              { label: 'Week 4', title: 'Sønderborg', tone: 'on' },
              { label: 'Week 5', title: 'Sønderborg', tone: 'on' }
            ],
            key: [{ label: 'Online, from home' }, { label: 'On-site at Air Alsie, Denmark', tone: 'on' }]
          }
        ]
      },
      blocks: [
        {
          type: 'notice',
          anchor: 'qualification',
          title: 'What this course qualifies you for',
          paragraphs: [
            'There is no EASA flight dispatcher licence. In Europe, each operator decides who is qualified to dispatch its flights, and sets its own training and experience requirements.',
            'This course gives you an IFOA Flight Dispatch Completion Certificate. It shows an operator you have completed structured training built on ICAO Doc 10106, the international standard for flight operations officer and dispatcher training. Your employer will still train you on its own procedures before you dispatch.',
            'If you need a government-issued dispatcher licence, see our [FAA Aircraft Dispatcher course](/courses/aircraft-dispatcher-training-faa-part-65).'
          ]
        },
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'Five phases, from the rules that govern the operation to the decisions you make on shift. Select a phase to see what it covers.',
          items: [
            { title: 'The Operating Environment', bullets: ['Air law and civil aviation regulations', 'ICAO and EASA framework', 'Air traffic management', 'Aeronautical communications'] },
            { title: 'Know the Aircraft', bullets: ['Aircraft systems for dispatchers', 'Mass and balance', 'Aircraft performance', 'MEL and CDL'] },
            { title: 'Plan the Flight', bullets: ['Aviation meteorology', 'Navigation and route planning', 'Fuel planning and alternates', 'NOTAMs and flight plan filing'] },
            { title: 'Control the Operation', bullets: ['Flight following and monitoring', 'Operational control', 'Communicating with crew and stakeholders', 'Managing disruptions'] },
            { title: 'Make the Decision', bullets: ['Decision-making under uncertainty', 'Threat and error management', 'Human factors in dispatch', 'Scenario exercises'] }
          ]
        },
        {
          type: 'cols',
          anchor: 'assessment',
          columns: [
            [
              {
                type: 'checks',
                title: "What you'll be able to do",
                items: [
                  'Plan and prepare a flight',
                  'Apply weather, fuel, routing and alternate requirements',
                  'Assess operational risks and constraints',
                  'Monitor flights and anticipate disruptions',
                  'Make operational decisions as conditions change',
                  'Apply ICAO, EASA and operator procedures'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: "How you're assessed",
                items: [
                  { title: 'Practical and multiple-choice exam', text: 'A pass mark of 80% is required.' },
                  { title: 'IFOA Flight Dispatch Completion Certificate', text: 'Issued when you pass. It does not expire.' }
                ],
                standards: [
                  { title: 'ICAO Doc 10106', text: 'Competency-based training for flight operations officers and dispatchers' },
                  { title: 'ICAO Annex 1 and Annex 6', text: 'Flight operations officer requirements' },
                  { title: 'EASA Air Ops', text: 'Regulation (EU) 965/2012, taught as course content' }
                ]
              }
            ]
          ]
        },
        {
          type: 'table',
          anchor: 'compare',
          title: 'EASA or FAA: which course?',
          intro: 'Both teach you to dispatch. They lead to different documents.',
          highlight: 1,
          head: ['', 'Flight Dispatcher Initial (this course)', 'FAA Aircraft Dispatcher'],
          rows: [
            ['You receive', 'IFOA Flight Dispatch Completion Certificate', 'Eligibility for the FAA Aircraft Dispatcher certificate, after passing the FAA knowledge and practical tests'],
            ['Issued by', 'IFOA', 'The FAA, a government authority'],
            ['Regulatory focus', 'ICAO and EASA', 'FAA, 14 CFR Part 65'],
            ['Duration', '5 weeks', '200 hours'],
            ['Location', '2 weeks online, 3 weeks in Denmark', 'Florida, USA, with online preparation'],
            ['Fee', '€3,500', '$4,500 USD, plus FAA test and examiner fees']
          ],
          links: [
            { label: 'See the FAA course', href: '/courses/aircraft-dispatcher-training-faa-part-65' },
            { label: 'Not sure? Ask us', href: '/contact' }
          ]
        },
        {
          type: 'cols',
          columns: [
            [{ type: 'pills', title: "Who it's for", intro: 'No previous dispatch experience needed.', items: ['People starting a career in flight dispatch', 'Airline and OCC staff moving into dispatch', 'Aviation professionals who want formal dispatch training'] }],
            [{ type: 'checks', title: 'Entry requirements', items: ['English good enough to follow professional aviation training', 'No previous dispatch experience required'] }]
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'flight-dispatcher-initial-training-india': {
    fields: {
      intakes: [],
      locationPrices: [],
      price: {
        amount: 99999,
        currency: 'INR',
        note: 'Includes training materials, examination and certificate. Travel, accommodation and meals are not included.'
      },
      sidebarSpecs: [
        { label: 'Next intake', value: 'Contact us for dates' },
        { label: 'Duration', value: '4 weeks' },
        { label: 'Format', value: 'On-site' },
        { label: 'Location', value: 'New Delhi, India' },
        { label: 'Assessment', value: 'Practical and multiple-choice exam' },
        { label: 'Certificate', value: 'IFOA Flight Dispatch Completion Certificate' }
      ],
      enrollLabel: 'Apply online'
    },
    overview: {
      sidebarNote: TERMS,
      hero: {
        title: 'Flight Dispatcher Initial Training, India',
        lead: "Four weeks on-site in New Delhi to learn how to plan, release and follow a flight, and make the calls when it doesn't go to plan. Built on ICAO Doc 10106 and taught by working dispatchers.",
        blocks: [
          {
            type: 'track',
            items: [
              { label: 'Week 1', title: 'New Delhi', tone: 'on' },
              { label: 'Week 2', title: 'New Delhi', tone: 'on' },
              { label: 'Week 3', title: 'New Delhi', tone: 'on' },
              { label: 'Week 4', title: 'New Delhi', tone: 'on' }
            ],
            key: [{ label: 'On-site in New Delhi, every week', tone: 'on' }]
          }
        ]
      },
      blocks: [
        {
          type: 'notice',
          anchor: 'qualification',
          title: 'What this course qualifies you for',
          paragraphs: [
            'This course gives you an IFOA Flight Dispatch Completion Certificate. It shows an operator you have completed structured training built on ICAO Doc 10106, the international standard for flight operations officer and dispatcher training.',
            'Each operator decides who is qualified to dispatch its flights, and your employer will still train you on its own procedures before you dispatch.',
            'If you need a government-issued dispatcher licence, see our [FAA Aircraft Dispatcher course](/courses/aircraft-dispatcher-training-faa-part-65).'
          ]
        },
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'Five phases over four weeks in the classroom, from the rules that govern the operation to the decisions you make on shift. Select a phase to see what it covers.',
          items: [
            { title: 'The Operating Environment', bullets: ['Air law and civil aviation regulations', 'ICAO framework', 'Air traffic management', 'Aeronautical communications'] },
            { title: 'Know the Aircraft', bullets: ['Aircraft systems for dispatchers', 'Mass and balance', 'Aircraft performance', 'MEL and CDL'] },
            { title: 'Plan the Flight', bullets: ['Aviation meteorology', 'Navigation and route planning', 'Fuel planning and alternates', 'NOTAMs and flight plan filing'] },
            { title: 'Control the Operation', bullets: ['Flight following and monitoring', 'Operational control', 'Communicating with crew and stakeholders', 'Managing disruptions'] },
            { title: 'Make the Decision', bullets: ['Decision-making under uncertainty', 'Threat and error management', 'Human factors in dispatch', 'Scenario exercises'] }
          ]
        },
        {
          type: 'cols',
          anchor: 'assessment',
          columns: [
            [
              {
                type: 'checks',
                title: "What you'll be able to do",
                items: [
                  'Plan and prepare a flight',
                  'Apply weather, fuel, routing and alternate requirements',
                  'Assess operational risks and constraints',
                  'Monitor flights and anticipate disruptions',
                  'Make operational decisions as conditions change',
                  'Apply ICAO and operator procedures'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: "How you're assessed",
                items: [
                  { title: 'Practical and multiple-choice exam', text: 'A pass mark of 80% is required.' },
                  { title: 'IFOA Flight Dispatch Completion Certificate', text: 'Issued when you pass. It does not expire.' }
                ],
                standards: [
                  { title: 'ICAO Doc 10106', text: 'Competency-based training for flight operations officers and dispatchers' },
                  { title: 'ICAO Annex 1 and Annex 6', text: 'Flight operations officer requirements' }
                ]
              }
            ]
          ]
        },
        {
          type: 'table',
          anchor: 'compare',
          title: 'EASA or FAA: which course?',
          intro: 'Both teach you to dispatch. They lead to different documents.',
          highlight: 1,
          head: ['', 'Flight Dispatcher Initial (this course)', 'FAA Aircraft Dispatcher'],
          rows: [
            ['You receive', 'IFOA Flight Dispatch Completion Certificate', 'Eligibility for the FAA Aircraft Dispatcher certificate, after passing the FAA knowledge and practical tests'],
            ['Issued by', 'IFOA', 'The FAA, a government authority'],
            ['Regulatory focus', 'ICAO and EASA', 'FAA, 14 CFR Part 65'],
            ['Duration', '4 weeks', '200 hours'],
            ['Location', '4 weeks on-site in New Delhi, India', 'New Delhi, India, with online preparation'],
            ['Fee', '₹99,999 + GST', '$4,500 USD, plus FAA test and examiner fees']
          ],
          links: [
            { label: 'See the FAA course', href: '/courses/aircraft-dispatcher-training-faa-part-65?location=india' },
            { label: 'Not sure? Ask us', href: '/contact' }
          ]
        },
        {
          type: 'cols',
          columns: [
            [{ type: 'pills', title: "Who it's for", intro: 'No previous dispatch experience needed.', items: ['People starting a career in flight dispatch', 'Airline and OCC staff moving into dispatch', 'Aviation professionals who want formal dispatch training'] }],
            [{ type: 'checks', title: 'Entry requirements', items: ['English good enough to follow professional aviation training', 'No previous dispatch experience required'] }]
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'aircraft-dispatcher-training-faa-part-65': {
    fields: {
      intakes: [{ label: "Rolling admissions: start when you're ready", startDate: null, isActive: true }],
      price: { amount: 4500, currency: 'USD', note: 'Tuition. Travel, accommodation, meals and visa are not included.' },
      additionalCosts: {
        intro: 'Full cost to certificate',
        items: [
          { label: 'Tuition', amount: '$4,500 USD' },
          { label: 'ADX knowledge test', amount: '$175 USD' },
          { label: 'Practical test, paid to the examiner', amount: '$600 USD' },
          { label: 'Total to FAA certificate', amount: '$5,275 USD' }
        ],
        note: ''
      },
      sidebarSpecs: [
        { label: 'Approval', value: 'FAA Part 65 approved' },
        { label: 'Duration', value: '200 hours over 6 weeks, plus ADX self-study' },
        { label: 'Exam week', value: '1 week, included in the 6 weeks' },
        { label: 'Format', value: 'Online preparation, then on-site' },
        { label: 'Location', value: 'Daytona Beach, Florida' },
        { label: 'Start', value: 'Rolling admissions' }
      ],
      enrollLabel: 'Apply online'
    },
    overview: {
      sidebarNote: TERMS,
      hero: {
        title: 'FAA Aircraft Dispatcher Course',
        slogan: 'We train dispatchers, not test takers.',
        lead: 'A 200-hour FAA Part 65 approved course. It covers every knowledge area the FAA requires and prepares you to earn the FAA Aircraft Dispatcher certificate.',
        blocks: [
          {
            type: 'track',
            items: [
              { label: 'Step 1', title: 'Complete the 200-hour course', sub: 'IFOA graduation certificate' },
              { label: 'Step 2', title: 'Pass the ADX knowledge test', sub: 'Separate from the 200 hours' },
              { label: 'Step 3', title: 'Pass the practical test', sub: 'With an FAA examiner' },
              { label: 'Step 4', title: 'FAA Aircraft Dispatcher certificate', sub: 'Issued by the FAA', tone: 'on' }
            ],
            note: 'The 200 hours cover the FAA knowledge areas. The 6 weeks include one week for the FAA exams. ADX preparation is extra and done alongside, in your own time. The certificate itself is issued by the FAA.'
          }
        ]
      },
      blocks: [
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'All eight knowledge areas required by Appendix A to 14 CFR Part 65, in the same order. Select an area to see what it covers.',
          columns: 2,
          groups: [
            {
              items: [
                { num: 'I', title: 'Regulations', bullets: ['14 CFR Part 65 Subpart C', 'Parts 1, 25, 61, 71, 91, 121, 139 and 175', '49 CFR Part 830', 'The general operating manual'] },
                { num: 'II', title: 'Meteorology', bullets: ['Basic weather theory', 'Weather reports, forecasts and charts', 'Hazardous weather: icing, turbulence, thunderstorms, windshear'] },
                { num: 'III', title: 'Navigation', bullets: ['Navigation principles and charts', 'Navigation aids and procedures', 'Airspace'] },
                { num: 'IV', title: 'Aircraft', bullets: ['Aircraft systems and the flight manual', 'Performance and mass and balance', 'MEL and CDL'] }
              ]
            },
            {
              items: [
                { num: 'V', title: 'Communications', bullets: ['Regulatory requirements', 'Communication procedures', 'NOTAMs and aeronautical publications'] },
                { num: 'VI', title: 'Air Traffic Control', bullets: ['ATC responsibilities and facilities', 'Flight plans', 'Traffic management'] },
                { num: 'VII', title: 'Emergency and Abnormal Procedures', bullets: ['Emergency assistance and security measures', 'Abnormal situations', 'Reporting requirements'] },
                { num: 'VIII', title: 'Practical Dispatch Applications', bullets: ['Human factors and decision-making', 'Flight planning and the dispatch release', 'Flight monitoring and operational control'] }
              ]
            }
          ]
        },
        {
          type: 'cards',
          anchor: 'adx',
          title: 'We train dispatchers, not test takers',
          intro: 'The 200 hours train you to do the job. The ADX knowledge test is prepared separately, outside the 200 hours, in your own time, with the tools below. Plan for this extra study on top of the course.',
          items: [
            { title: 'ADX learning portal', text: 'Structured online study and practice questions for the knowledge test.' },
            { title: 'Weekly ADX masterclass', text: 'Live online sessions with an instructor on ADX subjects and the questions students find hardest.' },
            { title: 'Instructor support', text: 'Help from your instructors throughout, from your first study week to your practical test.' }
          ]
        },
        {
          type: 'cols',
          columns: [
            [
              {
                type: 'checks',
                title: "What you'll be able to do",
                items: [
                  'Plan and prepare flights',
                  'Evaluate weather, NOTAMs and operational constraints',
                  'Apply fuel, performance and alternate requirements',
                  'Prepare and amend dispatch releases',
                  'Monitor flights as conditions change',
                  'Share operational control with the pilot in command'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: 'How you qualify',
                items: [
                  { title: 'IFOA graduation certificate', text: 'Issued when you complete the approved course. You present it at your practical test.' },
                  { title: 'ADX knowledge test', text: 'FAA multiple-choice test, taken at an approved testing centre. Preparation is not part of the 200 hours.' },
                  { title: 'Practical test', text: 'With an FAA examiner. Pass it and the FAA issues your Aircraft Dispatcher certificate.' }
                ],
                standards: [
                  { title: '14 CFR Part 65, Subpart C', text: 'Aircraft dispatcher certification' },
                  { title: 'Appendix A to Part 65', text: 'Required knowledge areas for approved courses' },
                  { title: 'AC 65-34A', text: 'FAA guidance for dispatcher courses' }
                ]
              }
            ]
          ]
        },
        {
          type: 'table',
          anchor: 'compare',
          title: 'FAA or EASA: which course?',
          intro: 'Both teach you to dispatch. They lead to different documents.',
          highlight: 1,
          head: ['', 'FAA Aircraft Dispatcher (this course)', 'Flight Dispatcher Initial'],
          rows: [
            ['You receive', 'Eligibility for the FAA Aircraft Dispatcher certificate, after passing the FAA knowledge and practical tests', 'IFOA Flight Dispatch Completion Certificate'],
            ['Issued by', 'The FAA, a government authority', 'IFOA'],
            ['Regulatory focus', 'FAA, 14 CFR Part 65', 'ICAO and EASA'],
            ['Duration', '200 hours', '5 weeks'],
            ['Location', 'Florida, USA, with online preparation', '2 weeks online, 3 weeks in Denmark'],
            ['Fee', '$4,500 USD, plus FAA test and examiner fees', '€3,500']
          ],
          links: [
            { label: 'See the EASA-focused course', href: '/courses/flight-dispatcher-initial-certification' },
            { label: 'Not sure? Ask us', href: '/contact' }
          ]
        },
        {
          type: 'cols',
          columns: [
            [{ type: 'pills', title: "Who it's for", intro: 'No previous dispatch experience needed.', items: ['People starting a career in flight dispatch', 'Airline and OCC staff', 'Aviation professionals who want an FAA certificate'] }],
            [
              {
                type: 'checks',
                title: 'FAA eligibility',
                items: ['At least 21 to take the ADX knowledge test', 'At least 23 to be issued the FAA certificate', 'Able to read, speak, write and understand English', 'No previous dispatch experience required']
              }
            ]
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'flight-dispatcher-double-programme': {
    fields: {
      intakes: [{ label: 'Next intake: to be confirmed', startDate: null, isActive: true }],
      price: { amount: 5500, currency: 'USD', note: 'Includes training materials, ADX learning portal and weekly masterclasses. Travel, accommodation, meals and visa are not included.' },
      additionalCosts: {
        intro: 'FAA fees not included',
        items: [
          { label: 'ADX knowledge test', amount: '$175 USD' },
          { label: 'Practical test, paid to the examiner', amount: '$600 USD' }
        ],
        note: ''
      },
      sidebarSpecs: [
        { label: 'Duration', value: '280 hours over 7 weeks, plus ADX self-study' },
        { label: 'Exam week', value: '1 week, included in the 7 weeks' },
        { label: 'Format', value: 'Hybrid' },
        { label: 'Location', value: 'Sønderborg, Denmark' },
        { label: 'Start', value: 'To be confirmed' },
        { label: 'Leads to', value: 'FAA Part 65 certificate, issued by the FAA' }
      ],
      enrollLabel: 'Apply'
    },
    overview: {
      sidebarNote: TERMS,
      hero: {
        title: 'Flight Dispatcher Double Programme',
        slogan: 'We train dispatchers, not test takers.',
        lead: 'One 280-hour programme over 7 weeks: the FAA Part 65 approved course, plus ICAO and EASA operations. It prepares you to earn the FAA Aircraft Dispatcher certificate, issued by the FAA, and to dispatch under European rules too.',
        blocks: [
          {
            type: 'split',
            items: [
              { value: '200 h', label: 'FAA Part 65 approved course', weight: 200 },
              { value: '80 h', label: 'ICAO and EASA operations', weight: 80, tone: 'amber' }
            ],
            note: "The 7 weeks include one week for the FAA exams. ADX preparation is extra and done in your own time. It's not part of the 280 hours."
          }
        ]
      },
      blocks: [
        {
          type: 'notice',
          anchor: 'qualification',
          title: 'What you receive',
          paragraphs: [
            '**From the FAA:** the Aircraft Dispatcher certificate under 14 CFR Part 65. Only the FAA issues it, once you pass the ADX knowledge test and the practical test with an FAA examiner.',
            '**From IFOA:** a course completion certificate for the programme. You present it at your practical test as proof you completed the approved course. It is not an FAA certificate.',
            'There is no EASA flight dispatcher licence. In Europe, operators decide who may dispatch their flights. The ICAO and EASA part shows them you can work under European rules as well as FAA rules.'
          ]
        },
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'Two parts, taught as one programme. Select a topic to see what it covers.',
          layout: 'vertical',
          groups: [
            {
              title: 'FAA Part 65 approved course',
              subtitle: '200 hours. All eight knowledge areas in Appendix A to 14 CFR Part 65.',
              items: [
                { num: 'I', title: 'Regulations', bullets: ['14 CFR Part 65 Subpart C', 'Parts 1, 25, 61, 71, 91, 121, 139 and 175', '49 CFR Part 830', 'The general operating manual'] },
                { num: 'II', title: 'Meteorology', bullets: ['Weather reports, forecasts and charts', 'Hazardous weather'] },
                { num: 'III', title: 'Navigation', bullets: ['Navigation principles, aids and charts', 'Airspace'] },
                { num: 'IV', title: 'Aircraft', bullets: ['Systems and the flight manual', 'Performance, mass and balance', 'MEL and CDL'] },
                { num: 'V', title: 'Communications', bullets: ['Communication procedures', 'NOTAMs and aeronautical publications'] },
                { num: 'VI', title: 'Air Traffic Control', bullets: ['ATC responsibilities and facilities', 'Flight plans and traffic management'] },
                { num: 'VII', title: 'Emergency and Abnormal Procedures', bullets: ['Emergency assistance and security', 'Reporting requirements'] },
                { num: 'VIII', title: 'Practical Dispatch Applications', bullets: ['Human factors and decision-making', 'The dispatch release and flight monitoring'] }
              ]
            },
            {
              title: 'ICAO and EASA operations',
              subtitle: '80 hours. Built on ICAO Doc 10106.',
              items: [
                { num: '1', title: 'ICAO and EASA framework', bullets: ['ICAO Annexes and the flight operations officer', 'EASA Air Operations, Regulation (EU) 965/2012'] },
                { num: '2', title: 'European airspace and ATM', bullets: ['European flight planning and filing', 'Network management and slots'] },
                { num: '3', title: 'EASA fuel and alternates', bullets: ['EASA fuel policy and planning', 'Alternate selection under EASA rules'] },
                { num: '4', title: 'Operational control in Europe', bullets: ['Methods of operational control', 'Working with European OCC structures'] },
                { num: '5', title: 'Competency-based practice', bullets: ['ICAO Doc 10106 competencies', 'Scenario exercises across both systems'] }
              ]
            }
          ]
        },
        {
          type: 'cards',
          anchor: 'adx',
          title: 'ADX preparation, outside the 280 hours',
          intro: 'The 280 hours train you to do the job. You prepare for the ADX knowledge test separately, in your own time, with the tools below.',
          items: [
            { title: 'ADX learning portal', text: 'Structured online study and practice questions for the knowledge test.' },
            { title: 'Weekly ADX masterclass', text: 'Live online sessions with an instructor on the questions students find hardest.' },
            { title: 'Instructor support', text: 'Help from your instructors from your first study week to your practical test.' }
          ]
        },
        {
          type: 'cols',
          columns: [
            [
              {
                type: 'checks',
                title: "What you'll be able to do",
                items: [
                  'Plan and prepare flights under FAA and EASA rules',
                  'Evaluate weather, NOTAMs and operational constraints',
                  'Apply fuel, performance and alternate requirements in both systems',
                  'Prepare and amend dispatch releases and operational flight plans',
                  'Monitor flights and anticipate disruptions',
                  'Share operational control with the pilot in command'
                ]
              }
            ],
            [
              {
                type: 'checks',
                title: 'FAA eligibility',
                items: ['At least 21 to take the ADX knowledge test', 'At least 23 to be issued the FAA certificate', 'Able to read, speak, write and understand English', 'No previous dispatch experience required']
              }
            ]
          ]
        },
        {
          type: 'table',
          anchor: 'compare',
          title: 'Which programme is right for you?',
          intro: 'All three teach you to dispatch. They lead to different documents.',
          highlight: 1,
          head: ['', 'Double Programme', 'FAA Aircraft Dispatcher', 'Flight Dispatcher Initial'],
          rows: [
            ['You receive', 'Eligibility for the FAA certificate, issued by the FAA, plus ICAO and EASA training from IFOA', 'Eligibility for the FAA certificate, issued by the FAA', 'IFOA course completion certificate'],
            ['Regulatory focus', 'FAA, ICAO and EASA', 'FAA', 'ICAO and EASA'],
            ['Duration', '280 hours, 7 weeks', '200 hours', '5 weeks'],
            ['Format', 'Hybrid', 'Online preparation, then Florida', '2 weeks online, 3 weeks in Denmark'],
            ['Fee', '$5,500 USD, plus FAA test and examiner fees', '$4,500 USD, plus FAA test and examiner fees', '€3,500'],
            ['Best for', 'Working anywhere, US or Europe', 'US operators and FAA-regulated carriers', 'European and ICAO-based operators']
          ],
          links: [
            { label: 'FAA course', href: '/courses/aircraft-dispatcher-training-faa-part-65' },
            { label: 'Flight Dispatcher Initial', href: '/courses/flight-dispatcher-initial-certification' },
            { label: 'Not sure? Ask us', href: '/contact' }
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'train-the-trainer-icao-cbta-instructor': {
    fields: {
      isCorporate: true,
      ctaLabel: 'Ask for dates and price',
      rateCard: { eyebrow: 'Course summary', value: 'Price on request', note: '', secondaryCtaLabel: 'Train your own instructors in-house', trustBadge: '' },
      sidebarSpecs: [
        { label: 'Duration', value: '4 days' },
        { label: 'Format', value: 'Classroom, instructor-led' },
        { label: 'Modules', value: '10' },
        { label: 'Assessment', value: '20-minute presentation' },
        { label: 'Certificate', value: 'IFOA Certificate of Completion' }
      ]
    },
    overview: {
      hero: {
        title: 'Train the Trainer',
        lead: 'A 4-day course for aviation professionals who teach. You learn how adults learn, design a course, and then teach twice in front of the group, with feedback each time.',
        blocks: [
          {
            type: 'track',
            items: [
              { label: 'Day 1', title: 'Learn' },
              { label: 'Day 2', title: 'Teach 5 min', tone: 'on' },
              { label: 'Day 3', title: 'Prepare', tone: 'prep' },
              { label: 'Day 4', title: 'Teach 20 min', tone: 'on' }
            ],
            note: 'Both teaching practices get structured feedback. The 20-minute session is your final assessment.'
          }
        ]
      },
      blocks: [
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'Ten modules over four days. Select a module to see what it covers.',
          layout: 'vertical',
          groups: [
            {
              title: 'Day 1',
              subtitle: 'How adults learn',
              items: [
                { num: 'M1', title: 'Introduction', bullets: ['Course aims and how the four days run', "The instructor's role in aviation training", 'Opens with a presentation by the course instructor'] },
                { num: 'M2', title: 'Adult Teaching and Learning', bullets: ['Key differences between adult and child learning', "Knowles' six principles of adult learning", 'Building a learner-centred strategy'] },
                { num: 'M3', title: 'Cross-Cultural Awareness', bullets: ["Hofstede's cultural dimensions", 'How culture affects questions, feedback and participation', 'Teaching multinational groups'] },
                { num: 'M4', title: 'Preparation of the Training Facility', bullets: ['Room layout for the type of session', 'Equipment and materials checks', 'What to confirm before participants arrive'] }
              ]
            },
            {
              title: 'Day 2',
              subtitle: 'Design and first practice',
              items: [
                { num: 'M5', title: 'Designing a Course', bullets: ['Writing clear learning objectives', 'Structuring and sequencing content', 'Evaluating whether a course works'] },
                { num: 'M6', title: 'Learning Styles and Strategies', bullets: ['The main dimensions of learning styles', 'Perceptual preference and information processing', 'Choosing a teaching strategy for the group'] },
                { num: 'M7', title: 'Planning and Presentation', bullets: ['Writing a lesson plan', 'Opening, structuring and closing a session', 'Timing and pace'] }
              ],
              practice: { title: '5-minute presentations', text: 'Each participant teaches a short session and gets feedback from the group and instructor.' }
            },
            {
              title: 'Day 3',
              subtitle: 'Delivery and feedback',
              items: [
                { num: 'M8', title: 'Advanced Presentation Skills', bullets: ['Voice, body language and use of space', 'Questioning techniques', 'Handling objections and difficult situations'] },
                { num: 'M9', title: 'Feedback', bullets: ['Structured feedback models', 'Giving feedback that changes behaviour', 'Receiving feedback'] }
              ],
              practice: { title: '1 to 2 hours of preparation', text: 'You prepare your final 20-minute presentation.' }
            },
            {
              title: 'Day 4',
              subtitle: 'Final assessment',
              items: [{ num: 'M10', title: '20-Minute Presentations', bullets: ['Each participant delivers a 20-minute session', 'Assessed by the instructor', 'Individual debrief and course close'] }]
            }
          ]
        },
        {
          type: 'cols',
          anchor: 'assessment',
          columns: [
            [
              {
                type: 'checks',
                title: "What you'll be able to do",
                items: [
                  'Build a learner-centred strategy using adult learning principles',
                  'Adapt your delivery to multinational and multicultural groups',
                  'Prepare the training room, equipment and materials before a session',
                  'Design a course with clear objectives, and evaluate it',
                  'Plan and structure a lesson from opening to close',
                  'Handle questions, objections and difficult classroom situations',
                  'Give structured feedback, and take it'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: "How you're assessed",
                text: 'On Day 4 you deliver a 20-minute training session on a topic from your own field. The instructor assesses your preparation, structure, delivery and how you engage the group, then debriefs you.',
                items: [
                  { title: 'Practised before assessed', text: 'The 5-minute session on Day 2 is a practice run with feedback, so the final session is never your first attempt.' },
                  { title: 'IFOA Certificate of Completion', text: 'Issued when you pass the final presentation.' }
                ]
              }
            ]
          ]
        },
        { type: 'pills', title: "Who it's for", items: ['New and current instructors', 'Subject matter experts who teach', 'Training and OCC staff', 'Aviation professionals moving into training'] },
        {
          type: 'cards',
          anchor: 'inhouse',
          title: 'Two ways to take it',
          items: [
            { title: 'Open course', text: "Join a scheduled course with instructors from other operators. You'll teach in front of a mixed, international group.", who: 'Individuals and small teams' },
            { title: 'In-house', text: 'We run the course at your base for your own instructors. Teaching practices use your own training topics.', who: 'Operators building an instructor team' }
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'airline-crew-control-flight-rostering': {
    fields: {
      isCorporate: true,
      ctaLabel: 'Request a proposal',
      rateCard: { eyebrow: 'Course summary', value: 'Price on request', note: '', secondaryCtaLabel: 'See the programme', trustBadge: '' },
      sidebarSpecs: [
        { label: 'Duration', value: '2 days' },
        { label: 'Basis', value: 'EASA Part FTL or your OM-A Chapter 7' },
        { label: 'Format', value: 'Instructor-led' },
        { label: 'Delivery', value: 'Online or at your base' },
        { label: 'Modules', value: '6' },
        { label: 'Assessment', value: 'FDP and long-haul exercises, scenarios, test' },
        { label: 'Certificate', value: 'IFOA Certificate' }
      ]
    },
    overview: {
      hero: {
        title: 'Crew Control Training',
        lead: 'Two days for the people who keep crews legal, rested and in position, from short-haul rotations to long-haul acclimatisation. Taught on EASA Part FTL, or built entirely around your own OM-A Chapter 7.',
        blocks: [
          {
            type: 'track',
            items: [
              { label: 'Step 1', title: 'Identify the operation' },
              { label: 'Step 2', title: 'Apply the correct FTL rule' },
              { label: 'Step 3', title: 'Check the limits' },
              { label: 'Step 4', title: 'Consider fatigue risk', tone: 'on' }
            ],
            note: 'The check your team learns to run on every crewing decision. Legal is the minimum, not the answer.'
          }
        ]
      },
      blocks: [
        {
          type: 'cards',
          anchor: 'versions',
          title: 'Two versions',
          items: [
            { title: 'EASA Part FTL', text: 'The standard course on ORO.FTL and CS FTL.1, with exercises on typical CAT rosters.', who: 'Mixed groups and operators new to EASA FTL' },
            { title: 'Tailored to your OM-A Chapter 7', text: 'Built around your approved FTL scheme and company procedures. Every exercise uses your own rosters.', who: 'Operators training their own crew control team' }
          ]
        },
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'Six modules over two days. In the tailored version, every module and exercise follows your OM-A Chapter 7. Select a module to see what it covers.',
          layout: 'vertical',
          groups: [
            {
              title: 'Day 1',
              subtitle: 'The rules',
              items: [
                { title: 'EASA FTL', bullets: ['ORO.FTL and CS FTL.1: the legal framework', 'Flight duty periods, duty and rest requirements', 'Reporting times and time of day'] },
                { title: 'Crew Legality', bullets: ['Checking legality against duty and rest history', 'Cumulative duty and flight time limits', 'Standby, reserve and rest after disruption'] },
                { title: 'Air Taxi FTL', bullets: ['Which rules apply to air taxi operations', 'Key differences from CS FTL.1', 'Operators running both CAT and air taxi'] }
              ]
            },
            {
              title: 'Day 2',
              subtitle: 'Applying them',
              items: [
                { title: 'Fatigue Risk', bullets: ['Fatigue hazards beyond legal compliance', 'Fatigue reporting, assessment and mitigation', 'FRM principles in crew planning'] },
                { title: 'FTL Application', bullets: ['Worked FDP, duty and rest calculations', "Acclimatisation: determining a crew member's state across time zones", 'Long-haul exercises, from reporting time to rest on return', 'Extensions, unforeseen circumstances and disruption cases'] },
                { title: 'Crew Control Operations', bullets: ['Disruption recovery and crew swaps', 'Reserve and standby management', 'Communicating with crew and shift handover'] }
              ]
            }
          ]
        },
        {
          type: 'cols',
          anchor: 'assessment',
          columns: [
            [
              {
                type: 'checks',
                title: 'What your team will be able to do',
                items: [
                  'Interpret EASA FTL requirements',
                  'Assess crew legality against duty and rest history',
                  'Apply the correct rules to air taxi operations',
                  'Recognise fatigue hazards and apply FRM principles to crewing decisions',
                  'Calculate FDP, duty and rest limitations accurately, including acclimatisation on long-haul rotations',
                  'Restore a disrupted crewing plan legally and safely'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: 'How your team is assessed',
                items: [
                  { title: 'FDP calculation exercises', text: 'Calculating maximum FDP, duty and rest for real rosters, including acclimatisation, long-haul rotations, extensions and disruptions.' },
                  { title: 'Operational scenarios', text: 'Disruption cases where participants restore the crewing plan and justify each decision on legality and fatigue.' },
                  { title: 'Written test', text: 'A final test on FTL rules, legality and fatigue risk management.' }
                ],
                standards: [
                  { title: 'ORO.FTL', text: 'Flight and duty time limitations and rest requirements' },
                  { title: 'CS FTL.1', text: 'Commercial air transport by aeroplane' },
                  { title: 'Air taxi', text: 'National FTL rules under Article 8 of Regulation (EU) 965/2012' },
                  { title: 'Fatigue risk management', text: 'ORO.FTL.120 and FRM principles' },
                  { title: 'OM-A Chapter 7', text: 'Your approved FTL scheme, in the tailored version' }
                ]
              }
            ]
          ]
        },
        { type: 'pills', title: "Who it's for", items: ['Crew controllers', 'Crew planners and rostering staff', 'Crew control supervisors', 'OCC and operations staff'] },
        {
          type: 'cards',
          title: 'Two ways to take it',
          items: [
            { title: 'Online', text: 'Live instructor-led sessions for teams across several bases or time zones.', who: 'Distributed crew control teams' },
            { title: 'At your base', text: 'We come to you. Exercises use your own rosters, operation types and disruption cases.', who: 'Operators training a whole department' }
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'human-factors-in-the-occ': {
    fields: {
      isCorporate: true,
      ctaLabel: 'Request a proposal',
      rateCard: { eyebrow: 'Course summary', value: 'Price on request', note: '', secondaryCtaLabel: 'See the programme', trustBadge: '' },
      sidebarSpecs: [
        { label: 'Duration', value: '2 days' },
        { label: 'Format', value: 'Classroom, scenario-based' },
        { label: 'Delivery', value: 'At your OCC or an IFOA facility' },
        { label: 'Modules', value: '11' },
        { label: 'Assessment', value: 'Scenario and group assessment' },
        { label: 'Certificate', value: 'IFOA Certificate' }
      ]
    },
    overview: {
      hero: {
        title: 'Human Factors for the people who run the operation from the ground.',
        lead: 'Not CRM for flight crew. Two days on fatigue, stress, decisions and teamwork as they happen on the OCC floor, including what changes when AI decision-support tools join the shift.'
      },
      blocks: [
        {
          type: 'text',
          anchor: 'sixteen',
          title: 'The Sinful Sixteen',
          mutedLast: true,
          paragraphs: [
            "IFOA's own framework for human error in an OCC that works alongside AI. It takes the aviation Dirty Dozen, shows how each factor changes once AI tools join the shift, and adds four new factors, anchored by Automation Over-Reliance.",
            'Your team works through all sixteen during the course, and every module refers back to them.'
          ]
        },
        {
          type: 'accordion',
          anchor: 'modules',
          title: 'The programme',
          intro: 'Eleven modules over two days, each mapped to an ICAO Doc 10106 competency. Select a module to see what it covers.',
          layout: 'vertical',
          groups: [
            {
              title: 'Day 1',
              items: [
                { title: 'Hard Skills vs. Soft Skills', text: "Why technical competency alone doesn't make a strong OCC operator, and why judgement, communication and self-management usually decide how a shift goes.", competency: 'All non-technical competencies' },
                { title: 'The OCC Environment', text: '24/7 shift work, many stakeholders and constant change: the pressures that are specific to the operations floor.', competency: 'Situational awareness' },
                { title: 'Stress and Performance', text: 'The stress-performance curve, and how to read your own position on it during an irregular-operations day.', competency: 'Workload management' },
                { title: 'Fatigue', text: 'Acute tiredness versus cumulative fatigue, high-risk roster patterns, and countermeasures on shift.', competency: 'Workload management' },
                { title: 'Resilience', text: "Individual and team resilience through the OCC's cycle of disruption and recovery.", competency: 'Leadership and teamwork' },
                { title: 'Decision Making', text: 'Structured decision-making under uncertainty and time pressure, including when a tool should advise and when a human must decide.', competency: 'Problem solving and decision-making' }
              ]
            },
            {
              title: 'Day 2',
              items: [
                { title: 'Communication', text: 'Closing the gaps between dispatch, crew control, ground handling, maintenance and management.', competency: 'Communication' },
                { title: 'Error Management Techniques', text: 'Catching, containing and recovering from error before it cascades across the operation, using TEM.', competency: 'Problem solving and decision-making' },
                { title: 'Situational Awareness', text: "Building and keeping the operational picture, including the risks your tools don't flag.", competency: 'Situational awareness and information management' },
                { title: 'Emotional Intelligence', text: "Managing your own reactions and reading your colleagues' under pressure.", competency: 'Leadership and teamwork' },
                { title: 'AI-CDM in the OCC', text: "Working with AI decision-support tools: where they should advise, where they shouldn't decide, and how to stay the decision-maker rather than a rubber stamp. Draws on IFOA's doctoral research into AI and competency in operational control.", competency: 'Problem solving and decision-making' }
              ]
            }
          ]
        },
        {
          type: 'cols',
          columns: [
            [
              {
                type: 'checks',
                title: 'What your team will be able to do',
                items: [
                  'Recognise why soft skills, not just technical competency, define a strong OCC operator',
                  'Describe the human-performance pressures specific to a 24/7 OCC',
                  'Read your own position on the stress-performance curve during IROPS',
                  'Distinguish acute tiredness from cumulative fatigue and recognise high-risk rosters',
                  'Build individual and team resilience for disruption and recovery',
                  'Apply structured decision-making under uncertainty',
                  'Close communication gaps across dispatch, crew control, ground handling and management',
                  'Catch, contain and recover from error before it cascades',
                  'Maintain the operational picture, including unflagged risks',
                  "Manage your own reactions and read others' under pressure",
                  'Stay the decision-maker when working with AI tools, not a rubber stamp on their output'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: 'One model of risk throughout',
                text: 'Every module is taught through Threat and Error Management, using situations from the OCC floor rather than the flight deck.',
                boxes: [
                  { title: 'Threats', text: 'Disruptions, weather, rosters, tool outputs' },
                  { title: 'Errors', text: 'What the team does or misses in response' },
                  { title: 'Undesired states', text: 'Where the operation ends up if nobody catches it' }
                ],
                items: [
                  { title: 'Scenario assessment', text: 'Each participant works through OCC scenarios and is assessed on how they apply the course to real decisions.' },
                  { title: 'Group assessment', text: 'Mixed-role teams solve a disruption together, assessed on communication, coordination and shared decisions.' }
                ],
                standards: [
                  { title: 'ICAO Doc 10106', text: 'Modules mapped to its non-technical competencies' },
                  { title: 'ICAO Doc 9683', text: 'Human Factors Training Manual' }
                ]
              }
            ]
          ]
        },
        { type: 'pills', title: "Who it's for", items: ['Flight dispatchers', 'Operations controllers', 'Crew control and scheduling', 'Maintenance Control Centre (MCC)', 'OCC duty managers'] },
        {
          type: 'cards',
          title: 'How we deliver it',
          items: [
            { title: 'At your OCC', text: 'We come to you. Scenarios use your own disruptions, procedures and tools.' },
            { title: 'At an IFOA facility', text: 'Your team trains away from the operation, with no calls from the floor.' },
            { title: 'Recurrent refresher', text: "A shorter session to revisit the Sinful Sixteen with your team's recent events." }
          ]
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'airline-occ-setup-operational-consulting': {
    fields: {
      isCorporate: true,
      ctaLabel: 'Request a proposal',
      rateCard: { eyebrow: 'Consulting summary', value: 'Price on request', note: '', secondaryCtaLabel: 'See our services', trustBadge: '' },
      sidebarSpecs: [
        { label: 'Engagement', value: 'Fixed scope or retainer' },
        { label: 'Delivery', value: 'On-site or remote' },
        { label: 'Frameworks', value: 'EASA, FAA, ICAO, DGCA' },
        { label: 'Confidentiality', value: 'NDA on request' },
        { label: 'First step', value: 'A call to scope the work' }
      ]
    },
    overview: {
      hero: {
        title: 'OCC consulting from people who have run one',
        lead: 'We help operators set up, fix and prove their operational control: the structure, the procedures, the training and the approvals. Under EASA, FAA, ICAO and national rules.',
        blocks: [
          {
            type: 'track',
            items: [
              { label: 'Step 1', title: 'Assess', sub: 'Where your operation stands today' },
              { label: 'Step 2', title: 'Design', sub: 'Structure, procedures and manuals' },
              { label: 'Step 3', title: 'Implement', sub: 'Alongside your team, on the floor' },
              { label: 'Step 4', title: 'Train', sub: 'Your people, delivered by IFOA', tone: 'on' }
            ],
            note: 'Start at any step. Most operators come to us for one and stay for the next.'
          }
        ]
      },
      blocks: [
        {
          type: 'cards',
          anchor: 'services',
          title: 'What we do',
          layout: 'tabs',
          intro: 'Six areas, each available on its own or as part of a larger engagement.',
          items: [
            { title: 'OCC assessment', text: 'An independent review of how your operational control works in practice, with a prioritised action plan.', bullets: ['Structure, roles and staffing', 'Procedures and handovers', 'Tools and information flow'] },
            { title: 'Operational control setup', text: 'Designing your method of operational control for a new AOC, a new base or a growing fleet.', bullets: ['OCC structure and roles', 'Shift patterns and handovers', 'Dispatch or flight-watch model'] },
            { title: 'Manuals and procedures', text: 'Writing and reviewing the operations manual sections your OCC works from every day.', bullets: ['Operational control and dispatch', 'Flight time limitations (OM-A Chapter 7)', 'Dangerous goods policy'] },
            { title: 'CBTA training programmes', text: 'Building a competency-based training programme for your OCC staff, based on ICAO Doc 10106.', bullets: ['Competency frameworks', 'Instructor and assessor standards', 'Training records'] },
            { title: 'Authority audits and approvals', text: "Preparing for an authority audit or approval, and closing findings once it's done.", bullets: ['Pre-audit review', 'Findings and corrective actions', 'Evidence and documentation'] },
            { title: 'AI and decision-support readiness', text: 'Introducing AI decision-support tools without losing human control of the operation.', bullets: ['Tool evaluation', 'Human-in-the-loop procedures', 'Automation risk and training'] }
          ]
        },
        {
          type: 'cols',
          columns: [
            [
              {
                type: 'checks',
                title: 'Why operators work with us',
                items: [
                  'Consultants who have worked in and managed operations control, not generalists',
                  'One team for the advice and the training that follows it',
                  'EASA, FAA, ICAO and DGCA experience under one roof',
                  'Recommendations sized to your operation, not a template'
                ]
              }
            ],
            [
              {
                type: 'facts',
                title: 'What you receive',
                items: [
                  { title: 'A clear written report', text: 'Findings ranked by risk and effort, so you know what to fix first.' },
                  { title: 'Documents ready to submit', text: 'Procedures and manual sections written for your authority, not drafts to rework.' },
                  { title: 'A trained team', text: 'If you want it, IFOA trains your staff on the new procedures.' }
                ]
              }
            ]
          ]
        },
        {
          type: 'cards',
          anchor: 'how',
          title: 'How we work',
          items: [
            { title: 'Fixed-scope project', text: 'A defined deliverable, timeline and price, agreed before we start.', who: 'Audits, setups and manual projects' },
            { title: 'Retainer', text: 'Ongoing access to our team for questions, reviews and changes as your operation grows.', who: 'Growing operators and new AOCs' },
            { title: 'On-site or remote', text: "We work at your OCC when it matters and remotely when it doesn't, to keep costs down.", who: 'Any engagement' }
          ]
        },
        { type: 'pills', title: 'Who we work with', items: ['Airlines', 'Cargo operators', 'Business aviation operators', 'New AOC applicants', 'OCC and flight operations managers', 'Accountable managers and nominated persons'] },
        { type: 'related', text: 'Foreign operator flying to the United States and need an FAA agent for service?', label: 'See our Agent for Service', href: 'https://agent.theifoa.com/' }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  'dangerous-goods-regulations-cbta-initial': {
    fields: {
      isCorporate: true,
      ctaLabel: 'Request a proposal',
      rateCard: { eyebrow: 'Your course', value: 'Price per group, on request', note: '', secondaryCtaLabel: 'What operators get', trustBadge: '' },
      sidebarSpecs: [
        { label: 'Duration', value: '4 hours' },
        { label: 'Format', value: 'Self-paced online' },
        { label: 'Course type', value: 'Initial or recurrent' },
        { label: 'Certificate', value: 'Valid 24 months' },
        { label: 'Start', value: 'Scheduled with your group' }
      ]
    },
    overview: {
      hero: {
        title: 'Dangerous goods training for what your job actually involves.',
        lead: 'Choose your role and your operation. The modules, outcomes and assessment change to match.'
      },
      blocks: [
        {
          type: 'dgExplorer',
          roleLegend: 'Your role',
          opLegend: 'Your operation',
          noCabinNote: "Cargo operations don't carry cabin crew.",
          roles: { pilot: { label: 'Pilot' }, dispatcher: { label: 'Flight dispatcher' }, cabin: { label: 'Cabin crew' } },
          ops: {
            nocarry: { label: 'No-carry business aviation', carry: false },
            carry: { label: 'Carry business aviation', carry: true },
            airline: { label: 'Airline', carry: true },
            cargo: { label: 'Cargo', carry: true, noCabin: true }
          },
          modulesTitle: "What you'll cover",
          modules: [
            { t: 'Why dangerous goods matter', d: { all: 'The accidents behind the rules and the decisions that are yours to make.' } },
            { t: 'Classes and hazards', d: { all: 'The nine hazard classes, their labels, and what each can do on board.' } },
            { t: 'Hidden DG and passenger items', d: { all: 'Lithium batteries, electronic devices and undeclared items in baggage and the cabin.' } },
            {
              t: 'Documents and information',
              adapt: true,
              d: { nocarry: 'Spotting DG in cargo, mail and company material paperwork.', carry: "Shipper's Declaration, NOTOC and the information the commander must receive.", cargo: "Shipper's Declaration, NOTOC and cargo-aircraft-only information." }
            },
            {
              t: 'Acceptance, loading and refusal',
              adapt: true,
              d: { nocarry: 'What to refuse, how to refuse it, and how to back the decision.', carry: 'Your role in acceptance and loading checks, and when to stop a load.', cargo: 'Acceptance and loading checks, segregation and quantity limits.' }
            },
            { t: 'Emergencies and reporting', d: { all: 'Emergency response codes, device fires, and reporting incidents and undeclared DG.' } },
            { t: 'Role assessment', d: { all: 'Scenarios built around the decisions your role makes.' } }
          ],
          outcomesTitle: "What you'll be able to do",
          outcomes: {
            pilot: {
              all: ['Recognise hidden DG in cargo, baggage and the cabin', 'Apply the rules for items passengers and crew may carry', 'Handle a DG emergency in flight, including a device fire', 'Report DG incidents and undeclared DG'],
              nocarry: ["Refuse DG and apply your operator's no-carry policy"],
              carry: ['Check the NOTOC against the load and act on discrepancies', 'Give DG information to air traffic services in an emergency']
            },
            dispatcher: {
              all: ['Identify DG in bookings, cargo, mail and company material', 'Answer passenger questions on permitted items', 'Report DG occurrences and undeclared DG'],
              nocarry: ['Stop DG from being booked or loaded under a no-carry policy'],
              carry: ['Verify DG information in load and flight documents', 'Prepare and send the NOTOC', 'Give DG information to air traffic services and emergency services on request'],
              cargo: ['Apply cargo-aircraft-only and quantity limits in load planning']
            },
            cabin: {
              all: ['Recognise hidden DG and suspicious items at boarding and in flight', 'Brief passengers on restricted items', 'Handle a lithium battery or device fire in the cabin', 'Report DG incidents and undeclared DG'],
              carry: ['Know where DG is loaded and how it affects your emergency response']
            }
          },
          assessTitle: "How you're assessed",
          assessShort: { pilot: 'Flight scenarios', dispatcher: 'Dispatch scenarios', cabin: 'Cabin scenarios' },
          duration: '4 hours',
          sidebar: {
            priceTitle: 'Price per group',
            priceNote: 'on request',
            rows: [
              { label: 'Duration', value: '4 hours' },
              { label: 'Format', value: 'Self-paced online' },
              { label: 'Assessment', value: '' },
              { label: 'Certificate', value: 'Valid 24 months' },
              { label: 'Start', value: 'Scheduled with your group' }
            ],
            ctaLabel: 'Request a proposal',
            secondaryLabel: 'What operators get'
          },
          assess: {
            pilot: "Scenarios: a DG found in flight, a NOTOC that doesn't match the load, and a decision to accept or refuse.",
            dispatcher: 'Scenarios: DG in a booking or load document, preparing the information for the commander, and an emergency call.',
            cabin: 'Scenarios: a suspicious item at boarding, a device fire in the cabin, and briefing a passenger.'
          },
          assessFacts: [
            { title: '80% to pass', text: 'Scenario-based, built around decisions your role makes.' },
            { title: 'Certificate valid 24 months', text: "It names your role and operation type, so it matches your operator's training records. We remind you before recurrent is due." }
          ]
        },
        {
          type: 'cards',
          title: 'Three ways to train',
          items: [
            { title: 'Self-paced online', text: 'An animated episode series, one topic at a time. Start any day, finish on your schedule.', who: 'Crew assigned by your operator, and recurrent training' },
            { title: 'Live virtual classroom', text: 'An instructor runs the scenarios with your group and answers questions about your procedures.', who: 'Crews and OCC teams of 6 or more' },
            { title: 'In-house at your base', text: 'Delivered on site, built around your operations manual and your DG policy.', who: 'Operators wanting one standard for all staff' }
          ]
        },
        {
          type: 'band',
          anchor: 'operators',
          title: 'For operators',
          intro: 'One programme for pilots, dispatchers and cabin crew, adapted to your manuals and ready for audit.',
          ctaLabel: 'Request a proposal',
          href: PROPOSAL,
          items: [
            'Content matched to your operations manual, DG policy and fleet',
            'One price per group, whatever the mix of roles',
            "Training records and certificates in one place for your authority's audits",
            'Expiry tracking and automatic recurrent reminders',
            'Initial and recurrent delivered under one agreement'
          ]
        },
        {
            type: 'standards',
            title: 'Built on the standards your authority audits against',
            items: [
              { title: 'ICAO Annex 18', text: 'Safe transport of dangerous goods by air' },
              { title: 'ICAO Technical Instructions', text: 'Doc 9284' },
              { title: 'ICAO Doc 10147', text: 'Competency-based DG training' },
              { title: 'IATA DGR', text: 'Current edition' },
              { title: 'EASA Air Ops', text: 'Regulation (EU) 965/2012' },
              { title: 'FAA', text: '14 CFR Part 121 Subpart Z, Part 135 Subpart K' }
            ]
          },
        {
            type: 'proof',
            title: 'Rated by the people we trained',
            items: [
              { value: '4.7/5', label: 'average rating' },
              { value: '458', label: 'post-training surveys' },
              { value: '70+', label: 'operators trained' }
            ]
          }
      ]
    }
  }
}
