// Migrates the hard-coded ServicesPage catalog into the database so every
// course card on the site has a real detail page. Upserts by slug - safe to
// re-run, and it will not clobber edits made in the admin to other fields.
//
// Hero images point at files in frontend/public/course-images so the pages
// look right before Cloudflare R2 is configured. Uploading a hero image in
// the admin replaces them.
//
// Run: npm run seed:catalog
//      npm run seed:catalog -- --only=<slug>   (upsert just that one course)
require('dotenv').config()

const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const Course = require('../models/Course')

const ICAO_INTRO =
  'This programme is delivered under the IFOA Competency-Based Training and Assessment (CBTA) framework, aligned with ICAO Annex 1 & 6 and ICAO Doc 10106.'

const courses = [
  {
    slug: 'flight-dispatcher-initial-certification',
    authority: "EASA / FAA Part 65 Standards",
    format: "Hybrid: 2 Weeks Online, 3 Weeks Onsite Sønderborg (Denmark)",
    careerPath: "Commercial Airline Dispatcher, Cargo Flight Follower, Corporate OCC Specialist",
    intakeLabel: "Next Intake: 4th Jan 2027",
    title: 'Flight Dispatcher Initial Training',
    refCode: 'FD-INITIAL',
    category: 'dispatch',
    featured: true,
    order: 10,
    summary:
      "Five weeks to learn how to plan, release and follow a flight, and make the calls when it doesn't go to plan. Built on ICAO Doc 10106 and taught by working dispatchers.",
    // No heroImage: falls back to the same photo as the "Flight Dispatch"
    // Services card (frontend/src/components/course/CourseCard.jsx CATEGORY_IMG).
    heroImage: null,
    schedule: {
      mode: 'Hybrid',
      startDate: new Date('2027-01-04T09:00:00Z'),
      endDate: new Date('2027-02-05T17:00:00Z'),
      timeText: '2 Weeks Online, 3 Weeks On-site Sønderborg (Denmark)'
    },
    duration: '5 Weeks',
    location: 'Sønderborg, Denmark',
    price: { amount: 3500, currency: 'EUR', note: 'Includes training materials, examination and certificate. Travel, accommodation, meals and visa are not included.' },
    whatYouWillLearn: {
      intro: "What you'll be able to do:",
      points: [
        'Plan and prepare a flight',
        'Apply weather, fuel, routing and alternate requirements',
        'Assess operational risks and constraints',
        'Monitor flights and anticipate disruptions',
        'Make operational decisions as conditions change',
        'Apply ICAO, EASA and operator procedures'
      ]
    },
    delivery: {
      intro: '2 weeks online, from home, then 3 weeks on-site at Air Alsie in Sønderborg, Denmark. The online weeks are live and self-paced study, so the on-site weeks can focus on practical work with instructors.',
      items: [
        { label: 'School', title: 'IFOA', description: 'Taught by working dispatchers' },
        { label: 'Format', title: '2 weeks online, 3 weeks on-site', description: 'Air Alsie, Sønderborg (Denmark)' }
      ]
    },
    trainingStandards: {
      intro: 'Built on ICAO Doc 10106, the international standard for flight operations officer and dispatcher training, with EASA Air Operations taught as course content.',
      cards: [
        { code: 'ICAO Doc 10106', title: 'Competency-based training for flight operations officers and dispatchers' },
        { code: 'ICAO Annex 1 and Annex 6', title: 'Flight operations officer requirements' },
        { code: 'EASA Air Ops', title: 'Regulation (EU) 965/2012, taught as course content' }
      ],
      logos: []
    },
    whoShouldAttend: {
      intro: 'No previous dispatch experience needed.',
      points: [
        'Aspiring Flight Dispatchers: people starting a career in flight dispatch.',
        'OCC & Operations Personnel: airline and OCC staff moving into dispatch.',
        'Aviation Professionals: aviation professionals who want formal dispatch training.'
      ],
      outro: 'Your employer will still train you on its own procedures before you dispatch.'
    },
    entryRequirements: {
      intro: 'Entry requirements:',
      points: ['English good enough to follow professional aviation training', 'No previous dispatch experience required']
    },
    courseContent: {
      intro: 'The curriculum covers the full prerequisite learning objectives for international flight dispatch:',
      modules: [
        'Civil Aviation Air Law & Airspace Regulations (ICAO / EASA / FAA)',
        'Advanced Aeronautical Meteorology & Severe Weather Mitigation',
        'Aircraft Navigation, Jeppesen / Lido Route Optimization & NOTAMs',
        'Aircraft Systems, Powerplants, MEL / CDL & Performance Limitations',
        'Mass & Balance Calculation, Fuel Policies & ETOPS / EDTO Requirements',
        'Real-Time OCC Simulator Practicum: High-Stress In-Flight Emergency Scenarios'
      ],
      note: 'Curriculum draws on both FAA Part 65 and EASA-aligned flight dispatch training content.'
    },
    certification: {
      text: 'You receive an IFOA Flight Dispatch Completion Certificate when you pass. It does not expire. It shows an operator you have completed structured training built on ICAO Doc 10106.',
      points: ['Practical and multiple-choice exam', 'Pass mark of 80%']
    },
    heroNote:
      'There is no EASA flight dispatcher licence. In Europe, each operator decides who is qualified to dispatch its flights. This course gives you an IFOA Flight Dispatch Completion Certificate, built on ICAO Doc 10106. If you need a government-issued dispatcher licence, see our FAA Aircraft Dispatcher course.',
    processSteps: ['Week 1: Online', 'Week 2: Online', 'Week 3: Sønderborg', 'Week 4: Sønderborg', 'Week 5: Sønderborg'],
    curriculum: {
      eyebrow: 'The Programme',
      title: 'Five phases',
      subtitle: 'From the rules that govern the operation to the decisions you make on shift.',
      phases: [
        { num: '01', label: 'PHASE 01', title: 'The Operating Environment', topics: ['Air law and civil aviation regulations', 'ICAO and EASA framework', 'Air traffic management', 'Aeronautical communications'] },
        { num: '02', label: 'PHASE 02', title: 'Know the Aircraft', topics: ['Aircraft systems for dispatchers', 'Mass and balance', 'Aircraft performance', 'MEL and CDL'] },
        { num: '03', label: 'PHASE 03', title: 'Plan the Flight', topics: ['Aviation meteorology', 'Navigation and route planning', 'Fuel planning and alternates', 'NOTAMs and flight plan filing'] },
        { num: '04', label: 'PHASE 04', title: 'Control the Operation', topics: ['Flight following and monitoring', 'Operational control', 'Communicating with crew and stakeholders', 'Managing disruptions'] },
        { num: '05', label: 'PHASE 05', title: 'Make the Decision', topics: ['Decision-making under uncertainty', 'Threat and error management', 'Human factors in dispatch', 'Scenario exercises'] }
      ]
    },
    seo: {
      metaTitle: 'Flight Dispatcher Initial Training: 5 Weeks, Hybrid | IFOA',
      metaDescription: 'A 5-week flight dispatcher course built on ICAO Doc 10106: 2 weeks online, 3 weeks on-site in Sønderborg, Denmark. €3,500. Next intake 4 January 2027.'
    }

  },
  {
    // US pathway counterpart to flight-dispatcher-initial-certification (EASA).
    // Content matches the FAA 14 CFR Part 65 Appendix A knowledge-area
    // structure (8 areas, not the EASA course's 5-phase framing) - see
    // pageContent.courseDetail.curriculum.phases below.
    slug: 'aircraft-dispatcher-training-faa-part-65',
    authority: 'FAA Part 65 Standards',
    format: 'Online preparation, then on-site (Daytona Beach, FL)',
    careerPath: 'Commercial Airline Dispatcher, Cargo Flight Follower, Corporate OCC Specialist',
    intakeLabel: 'Rolling Admissions',
    title: 'Aircraft Dispatcher Initial Certification',
    refCode: 'AD-FAA65',
    category: 'dispatch',
    featured: true,
    order: 15,
    summary:
      'A 200-hour FAA Part 65 approved course. It covers every knowledge area the FAA requires and prepares you to earn the FAA Aircraft Dispatcher certificate.',
    trustStat: '500+ dispatchers trained across 70+ operators',
    // No heroImage: falls back to the same "Flight Dispatch" Services image
    // as the EASA course (frontend/src/components/course/CourseCard.jsx).
    heroImage: null,
    schedule: {
      mode: 'Hybrid',
      timeText: 'Online preparation, then on-site, Daytona Beach (FL)'
    },
    duration: '200 Hours',
    location: 'Daytona Beach, FL',
    price: { amount: 4500, currency: 'USD', note: 'Tuition. Travel, accommodation, meals and visa are not included.' },
    whatYouWillLearn: {
      intro: "What you'll be able to do:",
      points: [
        'Plan and prepare flights',
        'Evaluate weather, NOTAMs and operational constraints',
        'Apply fuel, performance and alternate requirements',
        'Prepare and amend dispatch releases',
        'Monitor flights as conditions change',
        'Share operational control with the pilot in command'
      ]
    },
    delivery: {
      intro: 'Online preparation, then on-site at IFOA USA, Daytona Beach (FL).',
      items: [
        { label: 'School', title: 'IFOA USA', description: 'FAA Part 65 approved aircraft dispatcher school' },
        { label: 'Format', title: 'Online preparation, then on-site', description: 'Daytona Beach (FL)' }
      ]
    },
    trainingStandards: {
      intro: 'A 200-hour FAA Part 65 approved course covering every knowledge area required by Appendix A to 14 CFR Part 65.',
      cards: [
        { code: '14 CFR Part 65, Subpart C', title: 'Aircraft dispatcher certification' },
        { code: 'Appendix A to Part 65', title: 'Required knowledge areas for approved courses' },
        { code: 'AC 65-34A', title: 'FAA guidance for dispatcher courses' }
      ],
      logos: []
    },
    whoShouldAttend: {
      intro: 'No previous dispatch experience needed. Open to any nationality.',
      points: [
        'People starting a career in flight dispatch',
        'Airline and OCC staff',
        'Aviation professionals who want an FAA certificate'
      ],
      outro: ''
    },
    entryRequirements: {
      intro: 'FAA eligibility:',
      points: [
        'At least 21 to take the ADX knowledge test',
        'At least 23 to be issued the FAA certificate',
        'Able to read, speak, write and understand English',
        'No previous dispatch experience required'
      ]
    },
    // Per-course reference list only - the actual curriculum shown on the page
    // comes from pageContent.courseDetail.curriculum.phases below (8 FAA
    // Appendix A knowledge areas), not this generic module list.
    courseContent: {
      intro: 'All eight FAA-required knowledge areas, presented in the same order as Appendix A to 14 CFR Part 65:',
      modules: [
        'I. Regulations: Part 65 Subpart C, Parts 1, 25, 61, 71, 91, 121, 139 & 175, 49 CFR Part 830, General Operating Manual',
        'II. Meteorology: Weather theory, hazardous weather phenomena, NOTAMs, weather charts',
        'III. Navigation: Enroute and terminal navigation, charts and publications, alternate airport planning',
        'IV. Aircraft: Aircraft systems, performance, weight and balance, airworthiness requirements',
        'V. Communications: Dispatch communications procedures, radio phraseology, ATC coordination',
        'VI. ATC: Air traffic control procedures, airspace classifications, operational coordination',
        'VII. Emergency: Emergency and abnormal procedures, in-flight contingencies, irregular operations',
        'VIII. Practical Dispatch: Applied flight planning, dispatch release preparation, scenario-based decision-making'
      ],
      note: 'We train Aircraft Dispatchers, not test takers: the ADX knowledge test is one step in the certification process.'
    },
    certification: {
      text:
        'IFOA graduation certificate: issued when you complete the approved course, and presented at your practical test. It is not the FAA certificate. ADX knowledge test: FAA multiple-choice test at an approved testing centre; your result stays valid for 24 months. Practical test: with an FAA examiner. Pass it and the FAA issues your Aircraft Dispatcher certificate.',
      points: ['ADX Knowledge Test', 'Practical Test with FAA Examiner']
    },
    additionalCosts: {
      intro: 'Full cost to FAA certificate',
      items: [
        { label: 'Tuition', amount: '$4,500' },
        { label: 'ADX knowledge test', amount: '$175' },
        { label: 'Practical test, paid to the examiner', amount: '$600' },
        { label: 'Total to FAA certificate', amount: '$5,275' }
      ],
      note: 'Payment, cancellation and refunds: see our Terms and Conditions.'
    },
    trainingPhilosophy: {
      eyebrow: 'ADX Preparation',
      title: 'We train dispatchers, not test takers',
      intro:
        'The 200 hours train you to do the job. The ADX knowledge test is prepared separately, outside the 200 hours, in your own time, with the tools below. Plan for this extra study on top of the course.',
      cards: [
        { title: 'ADX learning portal', desc: 'Structured online study and practice questions for the knowledge test.' },
        { title: 'Weekly ADX masterclass', desc: 'Live online sessions with an instructor on ADX subjects and the questions students find hardest.' },
        { title: 'Instructor support', desc: 'Help from your instructors throughout, from your first study week to your practical test.' }
      ]
    },
    // Curriculum shown on the page: the 8 FAA Appendix A knowledge areas, in
    // the exact order 14 CFR Part 65 Appendix A lists them. Arrays merge
    // wholesale (see mergeContent in utils/pageContent.js) so all 8 items must
    // be listed here even though this replaces the shared 5-phase default.
    pageContent: {
      courseDetail: {
        // Objects merge key-by-key onto the shared labels (unlike arrays,
        // which replace wholesale) - only these keys actually differ for FAA.
        labels: {
          eyebrowSecondary: 'Aircraft Dispatcher Training',
          applyOnlineLabel: 'Apply Online',
          admissionsTitle: 'Ready to start your dispatcher certification?',
          admissionsDesc: '200 hours · FAA Part 65 approved · $4,500',
          admissionsApplyLabel: 'Apply Online'
        },
        curriculum: {
          eyebrow: 'Curriculum Framework',
          title: 'What the Aircraft Dispatcher Programme Covers',
          subtitle: 'All eight knowledge areas required by Appendix A to 14 CFR Part 65, in the same order. Select an area to see what it covers.',
          phases: [
            {
              num: 'I',
              label: 'AREA I',
              title: 'Regulations',
              topics: [
                '14 CFR Part 65 Subpart C',
                'Parts 1, 25, 61, 71, 91, 121, 139 and 175',
                '49 CFR Part 830',
                'The general operating manual'
              ]
            },
            {
              num: 'II',
              label: 'AREA II',
              title: 'Meteorology',
              topics: [
                'Basic weather theory',
                'Weather reports, forecasts and charts',
                'Hazardous weather: icing, turbulence, thunderstorms, windshear'
              ]
            },
            {
              num: 'III',
              label: 'AREA III',
              title: 'Navigation',
              topics: [
                'Navigation principles and charts',
                'Navigation aids and procedures',
                'Airspace'
              ]
            },
            {
              num: 'IV',
              label: 'AREA IV',
              title: 'Aircraft',
              topics: [
                'Aircraft systems and the flight manual',
                'Performance and mass and balance',
                'MEL and CDL'
              ]
            },
            {
              num: 'V',
              label: 'AREA V',
              title: 'Communications',
              topics: [
                'Regulatory requirements',
                'Communication procedures',
                'NOTAMs and aeronautical publications'
              ]
            },
            {
              num: 'VI',
              label: 'AREA VI',
              title: 'Air Traffic Control',
              topics: [
                'ATC responsibilities and facilities',
                'Flight plans',
                'Traffic management'
              ]
            },
            {
              num: 'VII',
              label: 'AREA VII',
              title: 'Emergency and Abnormal Procedures',
              topics: [
                'Emergency assistance and security measures',
                'Abnormal situations',
                'Reporting requirements'
              ]
            },
            {
              num: 'VIII',
              label: 'AREA VIII',
              title: 'Practical Dispatch Applications',
              topics: [
                'Human factors and decision-making',
                'Flight planning and the dispatch release',
                'Flight monitoring and operational control'
              ]
            }
          ]
        }
      }
    },
    heroNote:
      'We train dispatchers, not test takers. The 200 hours cover the FAA knowledge areas. ADX preparation is extra and done alongside, in your own time. The certificate itself is issued by the FAA.',
    processSteps: ['Complete the 200-hour course', 'Pass the ADX knowledge test', 'Pass the practical test with an FAA examiner', 'FAA Aircraft Dispatcher certificate, issued by the FAA'],
    seo: {
      metaTitle: 'FAA Aircraft Dispatcher Course: Part 65 Approved, 200 Hours | IFOA',
      metaDescription: 'FAA Part 65 approved 200-hour Aircraft Dispatcher course in Florida. Covers all eight Appendix A knowledge areas and prepares you for the ADX and practical test. $4,500.'
    }

  },
  {
    // FAA Part 65 approved course (200 h) + ICAO/EASA operations (80 h),
    // taught as one programme. Only the FAA issues the dispatcher
    // certificate - IFOA issues a course completion certificate.
    slug: 'flight-dispatcher-double-programme',
    authority: 'FAA Part 65, ICAO & EASA',
    format: 'Hybrid, Europe',
    careerPath: 'Flight Dispatcher for US and European operators',
    intakeLabel: 'Start date to be confirmed',
    title: 'Flight Dispatcher Double Programme',
    refCode: 'FD-DOUBLE',
    category: 'dispatch',
    featured: true,
    order: 5,
    summary:
      'One 280-hour programme over 7 weeks: the FAA Part 65 approved course, plus ICAO and EASA operations. It prepares you to earn the FAA Aircraft Dispatcher certificate, issued by the FAA, and to dispatch under European rules too.',
    heroNote:
      'We train dispatchers, not test takers. 200 hours FAA Part 65 approved course plus 80 hours ICAO and EASA operations. ADX preparation is extra and done in your own time; it is not part of the 280 hours.',
    badges: ['FAA Part 65 Approved', 'ICAO Doc 10106', 'EASA Air Operations'],
    heroImage: null,
    card: {
      badge: 'FAA & EASA',
      durationLabel: '280 Hours · 7 Weeks'
    },
    schedule: {
      mode: 'Hybrid',
      timeText: 'Hybrid, Europe'
    },
    duration: '280 Hours · 7 Weeks',
    location: 'Sønderborg, Denmark',
    price: {
      amount: 5500,
      currency: 'EUR',
      note: 'Includes training materials, ADX learning portal and weekly masterclasses. Travel, accommodation, meals and visa are not included.'
    },
    whatYouWillLearn: {
      intro: "What you'll be able to do:",
      points: [
        'Plan and prepare flights under FAA and EASA rules',
        'Evaluate weather, NOTAMs and operational constraints',
        'Apply fuel, performance and alternate requirements in both systems',
        'Prepare and amend dispatch releases and operational flight plans',
        'Monitor flights and anticipate disruptions',
        'Share operational control with the pilot in command'
      ]
    },
    delivery: {
      intro: 'Two parts, taught as one hybrid programme in Europe.',
      items: [
        { label: 'School', title: 'IFOA', description: 'Delivered by the International Flight Operations Academy' },
        { label: 'Format', title: 'Hybrid', description: '280 hours over 7 weeks, plus ADX self-study' }
      ]
    },
    trainingStandards: {
      intro:
        'The FAA part covers all eight knowledge areas in Appendix A to 14 CFR Part 65. The ICAO and EASA part is built on ICAO Doc 10106 and teaches EASA Air Operations, Regulation (EU) 965/2012.',
      logos: []
    },
    curriculum: {
      eyebrow: 'The Programme',
      title: 'Two parts, taught as one programme',
      subtitle:
        'FAA Part 65 approved course: 200 hours, all eight knowledge areas in Appendix A to 14 CFR Part 65. ICAO and EASA operations: 80 hours, built on ICAO Doc 10106.',
      layout: 'accordion',
      phases: [
        { num: 'I', label: 'FAA · AREA I', title: 'Regulations', topics: ['14 CFR Part 65 Subpart C', 'Parts 1, 25, 61, 71, 91, 121, 139 and 175', '49 CFR Part 830', 'The general operating manual'] },
        { num: 'II', label: 'FAA · AREA II', title: 'Meteorology', topics: ['Weather reports, forecasts and charts', 'Hazardous weather'] },
        { num: 'III', label: 'FAA · AREA III', title: 'Navigation', topics: ['Navigation principles, aids and charts', 'Airspace'] },
        { num: 'IV', label: 'FAA · AREA IV', title: 'Aircraft', topics: ['Systems and the flight manual', 'Performance, mass and balance', 'MEL and CDL'] },
        { num: 'V', label: 'FAA · AREA V', title: 'Communications', topics: ['Communication procedures', 'NOTAMs and aeronautical publications'] },
        { num: 'VI', label: 'FAA · AREA VI', title: 'Air Traffic Control', topics: ['ATC responsibilities and facilities', 'Flight plans and traffic management'] },
        { num: 'VII', label: 'FAA · AREA VII', title: 'Emergency and Abnormal Procedures', topics: ['Emergency assistance and security', 'Reporting requirements'] },
        { num: 'VIII', label: 'FAA · AREA VIII', title: 'Practical Dispatch Applications', topics: ['Human factors and decision-making', 'The dispatch release and flight monitoring'] },
        { num: '1', label: 'ICAO / EASA · 1', title: 'ICAO and EASA framework', topics: ['ICAO Annexes and the flight operations officer', 'EASA Air Operations, Regulation (EU) 965/2012'] },
        { num: '2', label: 'ICAO / EASA · 2', title: 'European airspace and ATM', topics: ['European flight planning and filing', 'Network management and slots'] },
        { num: '3', label: 'ICAO / EASA · 3', title: 'EASA fuel and alternates', topics: ['EASA fuel policy and planning', 'Alternate selection under EASA rules'] },
        { num: '4', label: 'ICAO / EASA · 4', title: 'Operational control in Europe', topics: ['Methods of operational control', 'Working with European OCC structures'] },
        { num: '5', label: 'ICAO / EASA · 5', title: 'Competency-based practice', topics: ['ICAO Doc 10106 competencies', 'Scenario exercises across both systems'] }
      ]
    },
    whoShouldAttend: {
      points: [
        'No previous dispatch experience required',
        'Aspiring dispatchers who want to work in the US or Europe',
        'Airline & OCC Personnel',
        'Aviation Professionals'
      ],
      outro: 'Best for: working anywhere, US or Europe.'
    },
    entryRequirements: {
      intro: 'FAA eligibility:',
      points: [
        'At least 21 to take the ADX knowledge test',
        'At least 23 to be issued the FAA certificate',
        'Able to read, speak, write and understand English',
        'No previous dispatch experience required'
      ]
    },
    courseContent: {
      intro: 'Two parts, taught as one programme:',
      modules: [
        'FAA Part 65 approved course (200 hours): all eight knowledge areas in Appendix A to 14 CFR Part 65',
        'ICAO and EASA operations (80 hours): built on ICAO Doc 10106'
      ],
      note: 'ADX preparation is outside the 280 hours: you prepare for the ADX knowledge test separately, in your own time.'
    },
    certification: {
      text:
        'From the FAA: the Aircraft Dispatcher certificate under 14 CFR Part 65. Only the FAA issues it, once you pass the ADX knowledge test and the practical test with an FAA examiner. From IFOA: a course completion certificate, which you present at your practical test as proof you completed the approved course. It is not an FAA certificate. There is no EASA flight dispatcher licence: in Europe, operators decide who may dispatch their flights.',
      points: ['ADX Knowledge Test', 'Practical Test with FAA Examiner']
    },
    additionalCosts: {
      intro: 'FAA fees not included',
      items: [
        { label: 'ADX knowledge test', amount: '$175' },
        { label: 'Practical test, paid to the examiner', amount: '$600' }
      ],
      note: 'Payment, cancellation and refunds: see our Terms and Conditions.'
    },
    trainingPhilosophy: {
      eyebrow: 'ADX Preparation',
      title: 'ADX preparation, outside the 280 hours',
      intro:
        'The 280 hours train you to do the job. You prepare for the ADX knowledge test separately, in your own time, with the tools below.',
      cards: [
        { title: 'ADX learning portal', desc: 'Structured online study and practice questions for the knowledge test.' },
        { title: 'Weekly ADX masterclass', desc: 'Live online sessions with an instructor on the questions students find hardest.' },
        { title: 'Instructor support', desc: 'Help from your instructors from your first study week to your practical test.' }
      ]
    },
    bottomBanner: {
      title: 'Ready to start your dispatcher certification?',
      desc: '280 hours · FAA Part 65, ICAO and EASA · €5,500'
    },
    seo: {
      metaTitle: 'Flight Dispatcher Double Programme: FAA, ICAO & EASA, 280 Hours | IFOA',
      metaDescription:
        'A 280-hour, 7-week hybrid programme in Europe, €5,500: the FAA Part 65 approved dispatcher course plus ICAO and EASA operations. Prepares you for the FAA Aircraft Dispatcher certificate.'
    },
    registrationOpen: true
  },
  {
    slug: 'dangerous-goods-regulations-cbta-initial',
    authority: 'ICAO Annex 18 · Doc 10147 · IATA DGR',
    format: 'Self-paced online, live virtual or in-house',
    careerPath: 'Pilots, flight dispatchers and cabin crew',
    intakeLabel: 'Scheduled with your group',
    title: 'Dangerous Goods Training',
    refCode: 'DGR-CBTA',
    category: 'dangerous-goods',
    order: 25,
    summary:
      'Competency-based dangerous goods training for pilots, flight dispatchers and cabin crew. Adapted to no-carry, carry, airline and cargo operations.',
    heroImage: { url: '/course-images/02_dangerous_goods.webp', key: '', alt: 'Dangerous Goods Regulations Training' },
    heroNote:
      'Dangerous goods training for what your job actually involves. Choose your role and your operation below: the modules, outcomes and assessment change to match.',
    badges: ['Pilots · Dispatchers · Cabin Crew', 'No-Carry · Carry · Airline · Cargo', 'Initial & Recurrent', 'ICAO Doc 10147'],
    schedule: { mode: 'Online', timeText: 'Self-paced online' },
    duration: '4 Hours',
    location: 'Online or in-house',
    price: { amount: null, currency: 'EUR', note: 'Price per group, on request, whatever the mix of roles.' },
    whatYouWillLearn: {
      eyebrow: 'Learning Outcomes',
      title: "What you'll be able to do",
      intro: 'Outcomes depend on your role and operation. Every course includes:',
      points: [
        'Recognise hidden DG in cargo, baggage, bookings and the cabin',
        'Apply the rules for items passengers and crew may carry',
        'Handle a DG emergency, including a lithium battery or device fire',
        'Report DG incidents and undeclared DG',
        'No-carry operations: refuse DG and apply your operator’s no-carry policy',
        'Carry operations: check DG information, the NOTOC and the load, and act on discrepancies'
      ]
    },
    delivery: {
      intro: 'Three ways to train.',
      items: [
        { label: 'Format', title: 'Self-paced online', description: 'An animated episode series, one topic at a time. Start any day, finish on your schedule. For crew assigned by your operator, and recurrent training.' },
        { label: 'Format', title: 'Live virtual classroom', description: 'An instructor runs the scenarios with your group and answers questions about your procedures. For crews and OCC teams of 6 or more.' },
        { label: 'Format', title: 'In-house at your base', description: 'Delivered on site, built around your operations manual and your DG policy. For operators wanting one standard for all staff.' }
      ]
    },
    trainingStandards: {
      eyebrow: 'Standards',
      title: 'Built on the standards your authority audits against',
      intro: '',
      cards: [
        { code: 'ICAO Annex 18', title: 'Safe transport of dangerous goods by air' },
        { code: 'ICAO Technical Instructions', title: 'Doc 9284' },
        { code: 'ICAO Doc 10147', title: 'Competency-based DG training' },
        { code: 'IATA DGR', title: 'Current edition' },
        { code: 'EASA Air Ops', title: 'Regulation (EU) 965/2012' },
        { code: 'FAA', title: '14 CFR Part 121 Subpart Z, Part 135 Subpart K' }
      ],
      logos: []
    },
    curriculum: {
      eyebrow: 'Modules',
      title: "What you'll cover",
      subtitle: 'Seven modules. Modules marked adapted change with your operation.',
      layout: 'accordion',
      phases: [
        { num: '01', label: '01', title: 'Why dangerous goods matter', focus: 'All operations', description: 'The accidents behind the rules and the decisions that are yours to make.' },
        { num: '02', label: '02', title: 'Classes and hazards', focus: 'All operations', description: 'The nine hazard classes, their labels, and what each can do on board.' },
        { num: '03', label: '03', title: 'Hidden DG and passenger items', focus: 'All operations', description: 'Lithium batteries, electronic devices and undeclared items in baggage and the cabin.' },
        { num: '04', label: '04', title: 'Documents and information', focus: 'Adapted to your operation', adaptive: 'acceptance', description: 'Spotting DG in cargo, mail and company material paperwork.' },
        { num: '05', label: '05', title: 'Acceptance, loading and refusal', focus: 'Adapted to your operation', adaptive: 'loading', description: 'What to refuse, how to refuse it, and how to back the decision.' },
        { num: '06', label: '06', title: 'Emergencies and reporting', focus: 'All operations', description: 'Emergency response codes, device fires, and reporting incidents and undeclared DG.' },
        { num: '07', label: '07', title: 'Role assessment', focus: 'All operations', description: 'Scenarios built around the decisions your role makes. 80% to pass.' }
      ]
    },
    dgrExplorer: {
      roles: [
        {
          code: '',
          title: 'Pilots',
          scenarios: [
            'Recognise hidden DG in cargo, baggage and the cabin',
            'Apply the rules for items passengers and crew may carry',
            'Handle a DG emergency in flight, including a device fire',
            'Report DG incidents and undeclared DG',
            'No-carry: refuse DG and apply your operator’s no-carry policy',
            'Carry: check the NOTOC against the load, act on discrepancies, and give DG information to air traffic services in an emergency',
            'Assessed on: a DG found in flight, a NOTOC that doesn’t match the load, and a decision to accept or refuse'
          ]
        },
        {
          code: '',
          title: 'Flight Dispatchers',
          scenarios: [
            'Identify DG in bookings, cargo, mail and company material',
            'Answer passenger questions on permitted items',
            'Report DG occurrences and undeclared DG',
            'No-carry: stop DG from being booked or loaded under a no-carry policy',
            'Carry: verify DG information in load and flight documents, prepare and send the NOTOC, and give DG information to air traffic and emergency services on request',
            'Cargo: apply cargo-aircraft-only and quantity limits in load planning',
            'Assessed on: DG in a booking or load document, preparing the information for the commander, and an emergency call'
          ]
        },
        {
          code: '',
          title: 'Cabin Crew',
          scenarios: [
            'Recognise hidden DG and suspicious items at boarding and in flight',
            'Brief passengers on restricted items',
            'Handle a lithium battery or device fire in the cabin',
            'Report DG incidents and undeclared DG',
            'Carry: know where DG is loaded and how it affects your emergency response',
            'Assessed on: a suspicious item at boarding, a device fire in the cabin, and briefing a passenger'
          ]
        }
      ],
      segments: [
        {
          id: 'nocarry-ba',
          title: 'No-Carry Business Aviation',
          descriptor: 'Recognising DG, refusing it and reporting it. No acceptance procedures you’ll never use.',
          acceptance: 'Spotting DG in cargo, mail and company material paperwork.',
          loading: 'What to refuse, how to refuse it, and how to back the decision.'
        },
        {
          id: 'carry-ba',
          title: 'Carry Business Aviation',
          descriptor: 'The documents, checks and information flow for an operator that carries DG.',
          acceptance: "Shipper's Declaration, NOTOC and the information the commander must receive.",
          loading: 'Your role in acceptance and loading checks, and when to stop a load.'
        },
        {
          id: 'airlines',
          title: 'Airline',
          descriptor: 'Scheduled passenger operations that carry DG.',
          acceptance: "Shipper's Declaration, NOTOC and the information the commander must receive.",
          loading: 'Your role in acceptance and loading checks, and when to stop a load.'
        },
        {
          id: 'cargo',
          title: 'Cargo',
          descriptor: "Freighter operations. Cargo operations don't carry cabin crew.",
          acceptance: "Shipper's Declaration, NOTOC and cargo-aircraft-only information.",
          loading: 'Acceptance and loading checks, segregation and quantity limits.'
        }
      ]
    },
    whoShouldAttend: {
      eyebrow: 'Audience',
      title: "Who it's for",
      intro: 'Every operator must train its staff, whether or not it carries DG.',
      points: ['Pilots', 'Flight dispatchers', 'Cabin crew'],
      outro: "Ground handling, acceptance and freight staff need a different course. Contact us and we'll tell you which one applies."
    },
    courseContent: {
      intro: 'For operators: one programme for pilots, dispatchers and cabin crew, adapted to your manuals and ready for audit.',
      modules: [
        'Content matched to your operations manual, DG policy and fleet',
        'One price per group, whatever the mix of roles',
        "Training records and certificates in one place for your authority's audits",
        'Expiry tracking and automatic recurrent reminders',
        'Initial and recurrent delivered under one agreement'
      ],
      note: ''
    },
    certification: {
      text: "Certificate valid 24 months. It names your role and operation type, so it matches your operator's training records. We remind you before recurrent is due.",
      points: ['Scenario-based assessment', '80% to pass']
    },
    isCorporate: true,
    eyebrow: 'By role and operation',
    ctaLabel: 'Request a proposal',
    trustStat: '4.7/5 from 458 post-training surveys · 70+ operators trained',
    rateCard: {
      eyebrow: 'Training Fee',
      value: 'Price per group, on request',
      note: 'One price per group, whatever the mix of roles. Initial and recurrent under one agreement.',
      secondaryCtaLabel: 'Contact Training Team',
      trustBadge: 'Rated 4.7/5 from 458 post-training surveys'
    },
    sidebarSpecs: [
      { label: 'Duration', value: '4 hours' },
      { label: 'Format', value: 'Self-paced online' },
      { label: 'Course type', value: 'Initial or recurrent' },
      { label: 'Assessment', value: 'Role scenarios, 80% to pass' },
      { label: 'Certificate', value: 'Valid 24 months' },
      { label: 'Start', value: 'Scheduled with your group' }
    ],
    trainingPhilosophy: {
      eyebrow: 'Assessment',
      title: "How you're assessed",
      intro: 'Scenario-based, built around the decisions your role makes. Initial is a full course for anyone new to the role or the operation type. Recurrent is shorter: it covers regulation changes, recent occurrences and a new assessment.',
      cards: [
        { title: '80% to pass', desc: 'Scenario-based, built around decisions your role makes.' },
        { title: 'Certificate valid 24 months', desc: "It names your role and operation type, so it matches your operator's training records. We remind you before recurrent is due." }
      ]
    },
    bottomBanner: {
      eyebrow: 'For Operators',
      title: 'One DG programme for your whole operation',
      desc: 'Pilots, dispatchers and cabin crew · Adapted to your manuals · Ready for audit',
      ctaLabel: 'Request a proposal'
    },
    seo: {
      metaTitle: 'Dangerous Goods Training by Role and Operation | IFOA',
      metaDescription: 'Competency-based dangerous goods training for pilots, flight dispatchers and cabin crew. Adapted to no-carry, carry, airline and cargo operations.'
    }

  },
  {
    slug: 'airline-crew-control-flight-rostering',
    authority: "EASA FTL & Fatigue Risk Management",
    format: "Online or On-site",
    careerPath: "Crew Controller, Crew Planner, Crew Control Supervisor, OCC Operations Specialist",
    intakeLabel: "Corporate Group Intakes",
    title: 'Crew Control Training',
    refCode: 'CC-FTL',
    category: 'crew',
    isCorporate: true,
    eyebrow: 'IFOA CORPORATE TRAINING',
    order: 45,
    summary:
      'Two days for the people who keep crews legal, rested and in position, from short-haul rotations to long-haul acclimatisation. Taught on EASA Part FTL, or built entirely around your own OM-A Chapter 7.',
    heroImage: { url: '/course-images/05_crew_control.webp', key: '', alt: 'Crew Control Training' },
    badges: ['EASA Part FTL', 'OM-A Chapter 7', 'Fatigue Risk Management', '2 Days', 'Online or at your base'],
    schedule: { mode: 'Hybrid', timeText: '2 days · Online or at your base' },
    duration: '2 Days',
    location: 'Online or at your base',
    price: { amount: null, currency: 'EUR', note: 'Price on request, based on group size, course version and delivery.' },
    rateCard: {
      eyebrow: 'Training Fee',
      value: 'Price on request',
      note: 'Based on group size, course version and delivery.',
      secondaryCtaLabel: 'Contact Training Team',
      trustBadge: 'Delivered by IFOA: trusted by 70+ operators worldwide'
    },
    sidebarSpecs: [
      { label: 'Duration', value: '2 days' },
      { label: 'Basis', value: 'EASA Part FTL or your OM-A Chapter 7' },
      { label: 'Format', value: 'Instructor-led' },
      { label: 'Delivery', value: 'Online or at your base' },
      { label: 'Modules', value: '6' },
      { label: 'Assessment', value: 'FDP and long-haul exercises, scenarios, test' },
      { label: 'Certificate', value: 'IFOA Certificate' }
    ],
    curriculum: {
      eyebrow: 'The Programme',
      title: 'Six modules over two days',
      subtitle: 'In the tailored version, every module and exercise follows your OM-A Chapter 7. Select a module to see what it covers.',
      layout: 'accordion',
      phases: [
        { num: '01', label: 'DAY 1', title: 'EASA FTL', focus: 'Day 1: The rules', topics: ['ORO.FTL and CS FTL.1: the legal framework', 'Flight duty periods, duty and rest requirements', 'Reporting times and time of day'] },
        { num: '02', label: 'DAY 1', title: 'Crew Legality', focus: 'Day 1: The rules', topics: ['Checking legality against duty and rest history', 'Cumulative duty and flight time limits', 'Standby, reserve and rest after disruption'] },
        { num: '03', label: 'DAY 1', title: 'Air Taxi FTL', focus: 'Day 1: The rules', topics: ['Which rules apply to air taxi operations', 'Key differences from CS FTL.1', 'Operators running both CAT and air taxi'] },
        { num: '04', label: 'DAY 2', title: 'Fatigue Risk', focus: 'Day 2: Applying them', topics: ['Fatigue hazards beyond legal compliance', 'Fatigue reporting, assessment and mitigation', 'FRM principles in crew planning'] },
        { num: '05', label: 'DAY 2', title: 'FTL Application', focus: 'Day 2: Applying them', topics: ['Worked FDP, duty and rest calculations', "Acclimatisation: determining a crew member's state across time zones", 'Long-haul exercises, from reporting time to rest on return', 'Extensions, unforeseen circumstances and disruption cases'] },
        { num: '06', label: 'DAY 2', title: 'Crew Control Operations', focus: 'Day 2: Applying them', topics: ['Disruption recovery and crew swaps', 'Reserve and standby management', 'Communicating with crew and shift handover'] }
      ]
    },
    whatYouWillLearn: {
      eyebrow: 'Operational Competencies',
      title: 'What your team will be able to do',
      intro: 'The check your team learns to run on every crewing decision. Legal is the minimum, not the answer.',
      points: [
        'Interpret EASA FTL requirements',
        'Assess crew legality against duty and rest history',
        'Apply the correct rules to air taxi operations',
        'Recognise fatigue hazards and apply FRM principles to crewing decisions',
        'Calculate FDP, duty and rest limitations accurately, including acclimatisation on long-haul rotations',
        'Restore a disrupted crewing plan legally and safely'
      ]
    },
    processSteps: ['Identify the operation', 'Apply the correct FTL rule', 'Check the limits', 'Consider fatigue risk'],
    trainingStandards: {
      eyebrow: 'Regulatory Framework',
      title: 'EASA FTL & Fatigue Risk Management',
      intro: 'Two versions: the standard course on ORO.FTL and CS FTL.1, with exercises on typical CAT rosters, or a version built around your approved FTL scheme and company procedures, where every exercise uses your own rosters.',
      cards: [
        { code: 'ORO.FTL', title: 'Flight and duty time limitations and rest requirements' },
        { code: 'CS FTL.1', title: 'Commercial air transport by aeroplane' },
        { code: 'Air taxi', title: 'National FTL rules under Article 8 of Regulation (EU) 965/2012' },
        { code: 'Fatigue risk management', title: 'ORO.FTL.120 and FRM principles' },
        { code: 'OM-A Chapter 7', title: 'Your approved FTL scheme, in the tailored version' }
      ],
      logos: []
    },
    whoShouldAttend: {
      eyebrow: 'Audience',
      title: "Who it's for",
      intro: 'For new crew controllers, and as a refresher for experienced staff on current rules and fatigue risk beyond legal limits.',
      points: ['Crew controllers', 'Crew planners and rostering staff', 'Crew control supervisors', 'OCC and operations staff'],
      outro: ''
    },
    bottomBanner: {
      eyebrow: 'IFOA Corporate Training',
      title: 'Ready to bring Crew Control training to your operation?',
      desc: '2 days · EASA Part FTL or your OM-A Chapter 7 · Online or at your base',
      ctaLabel: 'Request a proposal'
    },
    // Explicitly cleared: this course previously had entryRequirements and
    // certification set, and the seed script's upsert only overwrites fields
    // it mentions (see `existing.set(data)` below) - leaving them out here
    // would NOT have cleared the stale DB values. Neither section is part of
    // this corporate course's page.
    entryRequirements: { intro: '', points: [] },
    certification: { text: '', points: [] },
    ctaLabel: 'Request a proposal',
    trainingPhilosophy: {
      eyebrow: 'Assessment',
      title: 'How your team is assessed',
      intro: '',
      cards: [
        { title: 'FDP calculation exercises', desc: 'Calculating maximum FDP, duty and rest for real rosters, including acclimatisation, long-haul rotations, extensions and disruptions.' },
        { title: 'Operational scenarios', desc: 'Disruption cases where participants restore the crewing plan and justify each decision on legality and fatigue.' },
        { title: 'Written test', desc: 'A final test on FTL rules, legality and fatigue risk management.' }
      ]
    },
    delivery: {
      intro: 'Two versions, and two ways to take it.',
      items: [
        { label: 'Version', title: 'EASA Part FTL', description: 'The standard course on ORO.FTL and CS FTL.1. For mixed groups and operators new to EASA FTL.' },
        { label: 'Version', title: 'Tailored to your OM-A Chapter 7', description: 'Built around your approved FTL scheme and company procedures. For operators training their own crew control team.' },
        { label: 'Delivery', title: 'Online', description: 'Live instructor-led sessions for teams across several bases or time zones.' },
        { label: 'Delivery', title: 'At your base', description: 'We come to you. Exercises use your own rosters, operation types and disruption cases.' }
      ]
    },
    seo: {
      metaTitle: 'Crew Control Training: FTL, Fatigue and Operations | IFOA',
      metaDescription: 'A 2-day crew control course: EASA FTL, acclimatisation and long-haul exercises, crew legality, fatigue risk management and day-to-day crew control operations. Online or at your base.'
    }

  },
  {
    slug: 'train-the-trainer-icao-cbta-instructor',
    authority: 'Instructor Development Programme',
    format: 'Instructor-led',
    careerPath: 'Aviation Instructor, OCC Training Captain, Airline CBTA Assessor',
    intakeLabel: '',
    title: 'Train the Trainer',
    refCode: 'TTT-CBTA',
    category: 'train-the-trainer',
    isCorporate: true,
    eyebrow: 'IFOA Professional Development',
    ctaLabel: 'Ask for dates and price',
    featured: true,
    order: 40,
    summary:
      'A 4-day course for aviation professionals who teach. You learn how adults learn, design a course, and then teach twice in front of the group, with feedback each time.',
    // No heroImage: falls back to the "Train the Trainer" Services image
    // (same category - frontend/src/components/course/CourseCard.jsx).
    heroImage: null,
    badges: ['4 Days', '10 Modules', 'Two Teaching Practices', 'Classroom, Instructor-Led'],
    schedule: { mode: 'Onsite', timeText: 'Classroom, instructor-led' },
    duration: '4 Days',
    location: 'Open course or in-house',
    price: { amount: null, currency: 'EUR', note: 'Price on request. Ask us for dates and price.' },
    rateCard: {
      eyebrow: 'Training Fee',
      value: 'Price on request',
      note: 'Ask us for dates and price, or about training your own instructors in-house.',
      secondaryCtaLabel: 'Train your instructors in-house',
      trustBadge: 'Delivered by IFOA: trusted by 70+ operators worldwide'
    },
    sidebarSpecs: [
      { label: 'Duration', value: '4 days' },
      { label: 'Format', value: 'Classroom, instructor-led' },
      { label: 'Modules', value: '10' },
      { label: 'Assessment', value: '20-minute presentation' },
      { label: 'Certificate', value: 'IFOA Certificate of Completion' }
    ],
    curriculum: {
      eyebrow: 'The Programme',
      title: 'Ten modules over four days',
      subtitle: 'Select a module to see what it covers. Both teaching practices get structured feedback; the 20-minute session is your final assessment.',
      layout: 'accordion',
      phases: [
        { num: 'M1', label: 'DAY 1', title: 'Introduction', focus: 'Day 1: How adults learn', topics: ['Course aims and how the four days run', "The instructor's role in aviation training", 'Opens with a presentation by the course instructor'] },
        { num: 'M2', label: 'DAY 1', title: 'Adult Teaching and Learning', focus: 'Day 1: How adults learn', topics: ['Key differences between adult and child learning', "Knowles' six principles of adult learning", 'Building a learner-centred strategy'] },
        { num: 'M3', label: 'DAY 1', title: 'Cross-Cultural Awareness', focus: 'Day 1: How adults learn', topics: ["Hofstede's cultural dimensions", 'How culture affects questions, feedback and participation', 'Teaching multinational groups'] },
        { num: 'M4', label: 'DAY 1', title: 'Preparation of the Training Facility', focus: 'Day 1: How adults learn', topics: ['Room layout for the type of session', 'Equipment and materials checks', 'What to confirm before participants arrive'] },
        { num: 'M5', label: 'DAY 2', title: 'Designing a Course', focus: 'Day 2: Design and first practice', topics: ['Writing clear learning objectives', 'Structuring and sequencing content', 'Evaluating whether a course works'] },
        { num: 'M6', label: 'DAY 2', title: 'Learning Styles and Strategies', focus: 'Day 2: Design and first practice', topics: ['The main dimensions of learning styles', 'Perceptual preference and information processing', 'Choosing a teaching strategy for the group'] },
        { num: 'M7', label: 'DAY 2', title: 'Planning and Presentation', focus: 'Day 2: Design and first practice', topics: ['Writing a lesson plan', 'Opening, structuring and closing a session', 'Timing and pace', 'Practice: 5-minute presentations. Each participant teaches a short session and gets feedback from the group and instructor.'] },
        { num: 'M8', label: 'DAY 3', title: 'Advanced Presentation Skills', focus: 'Day 3: Delivery and feedback', topics: ['Voice, body language and use of space', 'Questioning techniques', 'Handling objections and difficult situations'] },
        { num: 'M9', label: 'DAY 3', title: 'Feedback', focus: 'Day 3: Delivery and feedback', topics: ['Structured feedback models', 'Giving feedback that changes behaviour', 'Receiving feedback', 'Preparation: 1 to 2 hours to prepare your final 20-minute presentation.'] },
        { num: 'M10', label: 'DAY 4', title: '20-Minute Presentations', focus: 'Day 4: Final assessment', topics: ['Each participant delivers a 20-minute session', 'Assessed by the instructor', 'Individual debrief and course close'] }
      ]
    },
    whatYouWillLearn: {
      eyebrow: 'Learning Outcomes',
      title: "What you'll be able to do",
      intro: '',
      points: [
        'Build a learner-centred strategy using adult learning principles',
        'Adapt your delivery to multinational and multicultural groups',
        'Prepare the training room, equipment and materials before a session',
        'Design a course with clear objectives, and evaluate it',
        'Plan and structure a lesson from opening to close',
        'Handle questions, objections and difficult classroom situations',
        'Give structured feedback, and take it'
      ]
    },
    delivery: {
      intro: 'Two ways to take it.',
      items: [
        { label: 'Open course', title: 'Open course', description: "Join a scheduled course with instructors from other operators. You'll teach in front of a mixed, international group. For individuals and small teams." },
        { label: 'In-house', title: 'In-house', description: 'We run the course at your base for your own instructors. Teaching practices use your own training topics. For operators building an instructor team.' }
      ]
    },
    trainingStandards: {
      eyebrow: 'Assessment',
      title: "How you're assessed",
      intro:
        'On Day 4 you deliver a 20-minute training session on a topic from your own field. The instructor assesses your preparation, structure, delivery and how you engage the group, then debriefs you.',
      cards: [
        { code: 'Practised before assessed', title: 'The 5-minute session on Day 2 is a practice run with feedback, so the final session is never your first attempt.' },
        { code: 'IFOA Certificate of Completion', title: 'Issued when you pass the final presentation.' }
      ],
      logos: []
    },
    whoShouldAttend: {
      eyebrow: 'Audience',
      title: "Who it's for",
      intro: 'No teaching experience needed: the course starts from the basics of how adults learn.',
      points: ['New and current instructors', 'Subject matter experts who teach', 'Training and OCC staff', 'Aviation professionals moving into training'],
      outro: ''
    },
    bottomBanner: {
      eyebrow: 'IFOA Professional Development',
      title: 'Develop your next generation of instructors',
      desc: '4 days · 10 modules · Two assessed teaching practices',
      ctaLabel: 'Ask for dates and price'
    },
    // Explicitly cleared - see the crew-control course above for why this
    // matters: the seed upsert only overwrites fields it mentions, so any
    // stale value from an earlier version of this course would otherwise
    // persist. Neither section is part of this course's page.
    courseContent: { intro: '', modules: [], note: '' },
    entryRequirements: { intro: '', points: [] },
    certification: { text: '', points: [] },
    processSteps: ['Day 1: Learn', 'Day 2: Teach 5 min', 'Day 3: Prepare', 'Day 4: Teach 20 min'],
    seo: {
      metaTitle: 'Train the Trainer: 4-Day Instructor Course | IFOA',
      metaDescription: 'A 4-day instructor course for aviation professionals. Adult learning, course design, presentation skills and feedback, with two assessed teaching practices.'
    }

  },
  {
    slug: 'human-factors-in-the-occ',
    authority: 'TEM-Based Human Factors Programme',
    format: 'Classroom / Blended',
    careerPath: 'Flight Dispatcher, Operations Controller, Crew Control / Scheduling, MCC',
    intakeLabel: 'Dates on request',
    title: 'Human Factors for the OCC',
    refCode: 'HF-OCC',
    category: 'human-factors',
    isCorporate: true,
    eyebrow: 'IFOA OCC Training',
    ctaLabel: 'Request a proposal',
    featured: true,
    order: 55,
    summary:
      'Not CRM for flight crew. Two days on fatigue, stress, decisions and teamwork as they happen on the OCC floor, including what changes when AI decision-support tools join the shift.',
    heroNote: 'Human Factors for the people who run the operation from the ground.',
    // No heroImage: falls back to the "Human Factors" Services image (same
    // category - frontend/src/components/course/CourseCard.jsx).
    heroImage: null,
    badges: ['OCC-Specific', '11 Modules', 'TEM-Based', 'Sinful Sixteen', '2 Days'],
    schedule: { mode: 'Onsite', timeText: 'Classroom, scenario-based' },
    duration: '2 Days',
    location: 'Your OCC or IFOA facility',
    price: { amount: null, currency: 'EUR', note: 'Price on request.' },
    rateCard: {
      eyebrow: 'Training Fee',
      value: 'Price on request',
      note: 'Tell us your team size, roles and preferred location.',
      secondaryCtaLabel: 'Contact Training Team',
      trustBadge: 'Delivered by IFOA: trusted by 70+ operators worldwide'
    },
    sidebarSpecs: [
      { label: 'Duration', value: '2 days' },
      { label: 'Format', value: 'Classroom, scenario-based' },
      { label: 'Delivery', value: 'At your OCC or an IFOA facility' },
      { label: 'Modules', value: '11' },
      { label: 'Assessment', value: 'Scenario and group assessment' },
      { label: 'Certificate', value: 'IFOA Certificate' }
    ],
    curriculum: {
      eyebrow: 'The Programme',
      title: 'Eleven modules over two days',
      subtitle: 'Each module is mapped to an ICAO Doc 10106 competency. Select a module to see what it covers.',
      layout: 'accordion',
      phases: [
        { num: '01', label: 'DAY 1', title: 'Hard Skills vs. Soft Skills', focus: 'All non-technical competencies', description: "Why technical competency alone doesn't make a strong OCC operator, and why judgement, communication and self-management usually decide how a shift goes." },
        { num: '02', label: 'DAY 1', title: 'The OCC Environment', focus: 'Situational awareness', description: '24/7 shift work, many stakeholders and constant change: the pressures that are specific to the operations floor.' },
        { num: '03', label: 'DAY 1', title: 'Stress and Performance', focus: 'Workload management', description: 'The stress-performance curve, and how to read your own position on it during an irregular-operations day.' },
        { num: '04', label: 'DAY 1', title: 'Fatigue', focus: 'Workload management', description: 'Acute tiredness versus cumulative fatigue, high-risk roster patterns, and countermeasures on shift.' },
        { num: '05', label: 'DAY 1', title: 'Resilience', focus: 'Leadership and teamwork', description: "Individual and team resilience through the OCC's cycle of disruption and recovery." },
        { num: '06', label: 'DAY 1', title: 'Decision Making', focus: 'Problem solving and decision-making', description: 'Structured decision-making under uncertainty and time pressure, including when a tool should advise and when a human must decide.' },
        { num: '07', label: 'DAY 2', title: 'Communication', focus: 'Communication', description: 'Closing the gaps between dispatch, crew control, ground handling, maintenance and management.' },
        { num: '08', label: 'DAY 2', title: 'Error Management Techniques', focus: 'Problem solving and decision-making', description: 'Catching, containing and recovering from error before it cascades across the operation, using TEM.' },
        { num: '09', label: 'DAY 2', title: 'Situational Awareness', focus: 'Situational awareness and information management', description: "Building and keeping the operational picture, including the risks your tools don't flag." },
        { num: '10', label: 'DAY 2', title: 'Emotional Intelligence', focus: 'Leadership and teamwork', description: "Managing your own reactions and reading your colleagues' under pressure." },
        { num: '11', label: 'DAY 2', title: 'AI-CDM in the OCC', focus: 'Problem solving and decision-making', description: "Working with AI decision-support tools: where they should advise, where they shouldn't decide, and how to stay the decision-maker rather than a rubber stamp. Draws on IFOA's doctoral research into AI and competency in operational control." }
      ]
    },
    whatYouWillLearn: {
      eyebrow: 'Learning Outcomes',
      title: 'What your team will be able to do',
      intro: '',
      points: [
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
    },
    delivery: {
      intro: 'How we deliver it.',
      items: [
        { label: 'Delivery', title: 'At your OCC', description: 'We come to you. Scenarios use your own disruptions, procedures and tools.' },
        { label: 'Delivery', title: 'At an IFOA facility', description: 'Your team trains away from the operation, with no calls from the floor.' },
        { label: 'Delivery', title: 'Recurrent refresher', description: "A shorter session to revisit the Sinful Sixteen with your team's recent events." }
      ]
    },
    trainingPhilosophy: {
      eyebrow: 'Our Approach',
      title: 'The Sinful Sixteen, and one model of risk throughout',
      intro:
        "The Sinful Sixteen is IFOA's own framework for human error in an OCC that works alongside AI. It takes the aviation Dirty Dozen, shows how each factor changes once AI tools join the shift, and adds four new factors, anchored by Automation Over-Reliance. Your team works through all sixteen, and every module is taught through Threat and Error Management, using situations from the OCC floor rather than the flight deck.",
      cards: [
        { title: 'Threats', desc: 'Disruptions, weather, rosters, tool outputs.' },
        { title: 'Errors', desc: 'What the team does or misses in response.' },
        { title: 'Undesired states', desc: 'Where the operation ends up if nobody catches it.' }
      ]
    },
    whoShouldAttend: {
      eyebrow: 'Who Should Attend',
      title: "Who it's for",
      intro: 'We recommend mixing roles: dispatch, crew control and MCC working through the same scenario is where most communication gaps show up.',
      points: ['Flight dispatchers', 'Operations controllers', 'Crew control and scheduling', 'Maintenance Control Centre (MCC)', 'OCC duty managers'],
      outro: ''
    },
    bottomBanner: {
      eyebrow: 'IFOA OCC Training',
      title: 'Give your whole OCC the Human Factors edge',
      desc: '2 days · 11 modules · TEM-based',
      ctaLabel: 'Request a proposal'
    },
    // Explicitly cleared - see the crew-control course above for why this
    // matters: the seed upsert only overwrites fields it mentions, so any
    // stale value from an earlier version of this course would otherwise
    // persist. Neither section is part of this course's page.
    courseContent: { intro: '', modules: [], note: '' },
    entryRequirements: { intro: '', points: [] },
    certification: { text: '', points: [] },
    trainingStandards: {
      eyebrow: 'Assessment & Standards',
      title: 'How your team is assessed',
      intro:
        'Scenario assessment: each participant works through OCC scenarios and is assessed on how they apply the course to real decisions. Group assessment: mixed-role teams solve a disruption together, assessed on communication, coordination and shared decisions.',
      cards: [
        { code: 'ICAO Doc 10106', title: 'Modules mapped to its non-technical competencies' },
        { code: 'ICAO Doc 9683', title: 'Human Factors Training Manual' }
      ],
      logos: []
    },
    seo: {
      metaTitle: 'Human Factors for the OCC: 2-Day Course | IFOA',
      metaDescription: 'Human Factors training built for operations control: fatigue, stress, decision-making and working with AI decision-support tools. Built on the Sinful Sixteen and TEM.'
    }

  },
  {
    slug: 'airline-occ-setup-operational-consulting',
    authority: 'EASA, FAA, ICAO and DGCA',
    format: 'On-site or remote',
    careerPath: 'Operators setting up, fixing or proving their operational control',
    intakeLabel: 'A call to scope the work',
    title: 'OCC Consulting',
    refCode: 'OCC-CONSULT',
    category: 'consulting',
    featured: true,
    order: 60,
    summary:
      'We help operators set up, fix and prove their operational control: the structure, the procedures, the training and the approvals. Under EASA, FAA, ICAO and national rules.',
    heroImage: null, // falls back to the "Consulting Services" Services image (same category)
    schedule: { mode: 'Hybrid', timeText: 'On-site or remote' },
    duration: 'Fixed scope or retainer',
    location: 'On-site or remote',
    price: { amount: null, currency: 'EUR', note: 'Price on request. The first step is a call to scope the work.' },
    whatYouWillLearn: {
      eyebrow: 'Why IFOA',
      title: 'Why operators work with us',
      intro: 'Start at any step. Most operators come to us for one and stay for the next.',
      points: [
        'Consultants who have worked in and managed operations control, not generalists',
        'One team for the advice and the training that follows it',
        'EASA, FAA, ICAO and DGCA experience under one roof',
        'Recommendations sized to your operation, not a template'
      ]
    },
    delivery: {
      intro: 'How we work.',
      items: [
        { label: 'Engagement', title: 'Fixed-scope project', description: 'A defined deliverable, timeline and price, agreed before we start. For audits, setups and manual projects.' },
        { label: 'Engagement', title: 'Retainer', description: 'Ongoing access to our team for questions, reviews and changes as your operation grows. For growing operators and new AOCs.' },
        { label: 'Delivery', title: 'On-site or remote', description: "We work at your OCC when it matters and remotely when it doesn't, to keep costs down." }
      ]
    },
    trainingStandards: {
      eyebrow: 'Frameworks',
      title: 'Under EASA, FAA, ICAO and national rules',
      intro: 'Advisory work is scoped against the rules your operation is audited on, and the documents we write are ready for your authority.',
      cards: [
        { code: 'EASA', title: 'Air Operations, Regulation (EU) 965/2012' },
        { code: 'FAA', title: '14 CFR operating rules' },
        { code: 'ICAO', title: 'Annexes and Doc 10106' },
        { code: 'DGCA', title: 'Civil Aviation Requirements (India)' }
      ],
      logos: []
    },
    curriculum: {
      eyebrow: 'What We Do',
      title: 'Six areas of OCC consulting',
      subtitle: 'Each available on its own or as part of a larger engagement.',
      layout: 'accordion',
      phases: [
        { num: '01', label: '01', title: 'OCC assessment', focus: 'Independent review and action plan', description: 'An independent review of how your operational control works in practice, with a prioritised action plan.', topics: ['Structure, roles and staffing', 'Procedures and handovers', 'Tools and information flow'] },
        { num: '02', label: '02', title: 'Operational control setup', focus: 'New AOC, new base or growing fleet', description: 'Designing your method of operational control for a new AOC, a new base or a growing fleet.', topics: ['OCC structure and roles', 'Shift patterns and handovers', 'Dispatch or flight-watch model'] },
        { num: '03', label: '03', title: 'Manuals and procedures', focus: 'The manual sections your OCC works from', description: 'Writing and reviewing the operations manual sections your OCC works from every day.', topics: ['Operational control and dispatch', 'Flight time limitations (OM-A Chapter 7)', 'Dangerous goods policy'] },
        { num: '04', label: '04', title: 'CBTA training programmes', focus: 'Based on ICAO Doc 10106', description: 'Building a competency-based training programme for your OCC staff, based on ICAO Doc 10106.', topics: ['Competency frameworks', 'Instructor and assessor standards', 'Training records'] },
        { num: '05', label: '05', title: 'Authority audits and approvals', focus: 'Before and after the audit', description: "Preparing for an authority audit or approval, and closing findings once it's done.", topics: ['Pre-audit review', 'Findings and corrective actions', 'Evidence and documentation'] },
        { num: '06', label: '06', title: 'AI and decision-support readiness', focus: 'Keeping human control', description: 'Introducing AI decision-support tools without losing human control of the operation.', topics: ['Tool evaluation', 'Human-in-the-loop procedures', 'Automation risk and training'] }
      ]
    },
    whoShouldAttend: {
      eyebrow: 'Clients',
      title: 'Who we work with',
      intro: 'We size the work to the operation: a small operator usually needs a focused review or one manual section, not a full programme.',
      points: ['Airlines', 'Cargo operators', 'Business aviation operators', 'New AOC applicants', 'OCC and flight operations managers', 'Accountable managers and nominated persons'],
      outro: 'Foreign operator flying to the United States and need an FAA agent for service? See our Agent for Service at agent.theifoa.com.'
    },
    courseContent: { intro: '', modules: [], note: '' },
    certification: { text: '', points: [] },
    registrationOpen: true,
    isCorporate: true,
    eyebrow: 'IFOA Consulting',
    ctaLabel: 'Request a proposal',
    heroNote: 'OCC consulting from people who have run one.',
    badges: ['EASA', 'FAA', 'ICAO', 'DGCA', 'On-site or Remote'],
    rateCard: {
      eyebrow: 'Consulting',
      value: 'Price on request',
      note: 'The first step is a call to scope the work. NDA on request.',
      secondaryCtaLabel: 'Contact our team',
      trustBadge: 'Trusted by 70+ operators worldwide'
    },
    sidebarSpecs: [
      { label: 'Engagement', value: 'Fixed scope or retainer' },
      { label: 'Delivery', value: 'On-site or remote' },
      { label: 'Frameworks', value: 'EASA, FAA, ICAO, DGCA' },
      { label: 'Confidentiality', value: 'NDA on request' },
      { label: 'First step', value: 'A call to scope the work' }
    ],
    processSteps: ['Assess: where your operation stands today', 'Design: structure, procedures and manuals', 'Implement: alongside your team, on the floor', 'Train: your people, delivered by IFOA'],
    trainingPhilosophy: {
      eyebrow: 'Deliverables',
      title: 'What you receive',
      intro: '',
      cards: [
        { title: 'A clear written report', desc: 'Findings ranked by risk and effort, so you know what to fix first.' },
        { title: 'Documents ready to submit', desc: 'Procedures and manual sections written for your authority, not drafts to rework.' },
        { title: 'A trained team', desc: 'If you want it, IFOA trains your staff on the new procedures.' }
      ]
    },
    bottomBanner: {
      eyebrow: 'IFOA Consulting',
      title: 'Tell us what you need help with',
      desc: 'Fixed scope or retainer · On-site or remote · NDA on request',
      ctaLabel: 'Request a proposal'
    },
    entryRequirements: { intro: '', points: [] },
    seo: {
      metaTitle: 'OCC and Flight Operations Consulting | IFOA',
      metaDescription: 'Consulting for operations control: OCC assessments, operational control setup, manuals, CBTA training programmes, authority approvals and AI readiness. EASA, FAA and ICAO.'
    }

  }
]

// Approved page copy (overview blocks + sidebar facts) per course - kept in
// its own file so the long-form copy doesn't bury the catalog data above.
const OVERVIEWS = require('./courseOverviews')
for (const course of courses) {
  const entry = OVERVIEWS[course.slug]
  if (!entry) continue
  const { enrollLabel, ...fields } = entry.fields || {}
  Object.assign(course, fields, { overview: entry.overview })
  if (enrollLabel) {
    const detail = (course.pageContent && course.pageContent.courseDetail) || {}
    course.pageContent = {
      ...(course.pageContent || {}),
      courseDetail: { ...detail, labels: { ...(detail.labels || {}), sidebarEnrollLabel: enrollLabel, applyOnlineLabel: enrollLabel } }
    }
  }
}

async function run() {
  await connectDB()

  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const only = onlyArg ? onlyArg.slice('--only='.length) : null
  const selected = only ? courses.filter((c) => c.slug === only) : courses
  if (only && !selected.length) throw new Error(`No course with slug "${only}" in this catalog`)

  for (const data of selected) {
    const existing = await Course.findOne({ slug: data.slug })
    if (existing) {
      existing.set({ ...data, status: 'published' })
      await existing.save()
      console.log(`Updated: ${existing.slug}`)
    } else {
      const created = await Course.create({ ...data, status: 'published' })
      console.log(`Created: ${created.slug}`)
    }
  }

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
