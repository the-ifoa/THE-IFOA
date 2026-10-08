/**
 * Editable marketing-page content.
 *
 * Each page has:
 *   - a SCHEMA that drives the admin editor UI (groups -> fields / lists)
 *   - a DEFAULT content object, matching what the React pages ship with
 *
 * The public API merges stored overrides on top of DEFAULTS, so a page always
 * has a complete content object even before an admin has touched it.
 *
 * Field types: 'text' | 'textarea' | 'image' | 'stringList'
 *   image values are { url, key, alt } objects (same shape as ImageUploader).
 */

const PAGE_KEYS = ['home', 'services', 'about', 'contact', 'events', 'upcoming', 'foxtrotDelta', 'courseEnrollment', 'courseDetail']

const PAGE_LABELS = {
  home: 'Home',
  services: 'Services',
  about: 'About',
  contact: 'Contact',
  events: 'Flight Dispatch Courses',
  upcoming: 'Upcoming Courses',
  foxtrotDelta: 'Foxtrot Delta',
  courseEnrollment: 'Course Enrollment',
  courseDetail: 'Course Detail'
}

// --------------------------------------------------------------------------
// SCHEMAS
// --------------------------------------------------------------------------

const f = (k, label, type = 'text') => ({ k, label, type })

const SCHEMAS = {
  home: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title (line 1)'),
          f('titleHighlight', 'Title (highlighted line 2)'),
          f('subtitle', 'Subtitle', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('secondaryLabel', 'Secondary button label')
        ],
        lists: [
          {
            k: 'stats',
            label: 'Metric strip',
            itemLabel: 'Stat',
            fields: [f('value', 'Value'), f('label', 'Label')]
          }
        ]
      },
      {
        k: 'featuredCourses',
        label: 'Featured courses',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('viewAllLabel', 'View-all link label')
        ],
        lists: [
          {
            k: 'cards',
            label: 'Course cards',
            itemLabel: 'Course card',
            fields: [
              f('tag', 'Tag'),
              f('duration', 'Duration badge'),
              f('title', 'Title'),
              f('desc', 'Description', 'textarea'),
              f('ctaLabel', 'CTA button label')
            ]
          }
        ]
      },
      {
        k: 'regions',
        label: 'Where we train',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')],
        lists: [
          {
            k: 'cards',
            label: 'Regions',
            itemLabel: 'Region',
            fields: [
              f('name', 'Region name'),
              f('city', 'City'),
              f('image', 'Background image (flag)', 'image'),
              f('desc', 'Description', 'textarea'),
              f('link1Label', 'Link 1 label'),
              f('link1Slug', 'Link 1 course (slug)'),
              f('link2Label', 'Link 2 label'),
              f('link2Slug', 'Link 2 course (slug)'),
              f('link3Label', 'Link 3 label'),
              f('link3Slug', 'Link 3 course (slug)')
            ]
          }
        ]
      },
      {
        k: 'trustRating',
        label: 'Trust & rating banner',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('desc', 'Description', 'textarea'),
          f('learnMoreLabel', 'Learn-more link label'),
          f('ratingValue', 'Rating value'),
          f('ratingSuffix', 'Rating suffix'),
          f('reviewCountLabel', 'Review-count label'),
          f('badgeLabel', 'Badge label')
        ]
      },
      {
        k: 'pathways',
        label: 'Training pathways carousel',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('seeMoreLabel', 'See-more button label')],
        lists: [
          {
            k: 'cards',
            label: 'Pathway cards',
            itemLabel: 'Pathway card',
            fields: [
              f('category', 'Category'),
              f('title', 'Title'),
              f('desc', 'Description', 'textarea'),
              f('hours', 'Hours / format'),
              f('linkText', 'Link label'),
              f('courseSlug', 'Links to course (slug)'),
              f('url', 'Link (used when no course slug)')
            ]
          }
        ]
      },
      {
        k: 'network',
        label: 'Global airline network',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')]
      },
      {
        k: 'audience',
        label: 'Audience pathways',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')],
        lists: [
          {
            k: 'cards',
            label: 'Audience cards',
            itemLabel: 'Audience card',
            fields: [
              f('eyebrow', 'Eyebrow'),
              f('trackBadge', 'Track badge'),
              f('title', 'Title'),
              f('desc', 'Description', 'textarea'),
              f('bullet1', 'Feature bullet 1'),
              f('bullet2', 'Feature bullet 2'),
              f('ctaLabel', 'CTA button label')
            ]
          }
        ]
      },
      {
        k: 'testimonialsSection',
        label: 'Testimonials section',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('visualTabLabel', 'Tab label: visual showcase'),
          f('executiveTabLabel', 'Tab label: executive statements'),
          f('allTabLabel', 'Tab label: all feedback')
        ]
      },
      {
        k: 'framework',
        label: 'Training framework',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title')],
        lists: [
          {
            k: 'standards',
            label: 'Standards',
            itemLabel: 'Standard',
            fields: [f('title', 'Title'), f('logo', 'Logo (icao, faa, easa or dgca)'), f('desc', 'Description', 'textarea')]
          }
        ]
      },
      {
        k: 'beyond',
        label: 'Smart Talent & Foxtrot Delta',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')],
        lists: [
          {
            k: 'cards',
            label: 'Cards',
            itemLabel: 'Card',
            fields: [
              f('title', 'Title'),
              f('image', 'Image', 'image'),
              f('livePreview', 'Show the live site as the image (yes or no)'),
              f('desc', 'Description', 'textarea'),
              f('linkLabel', 'Link label'),
              f('url', 'Link URL')
            ]
          }
        ]
      },
      {
        k: 'finalCta',
        label: 'Final CTA',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('desc', 'Description', 'textarea'),
          f('findCourseLabel', 'Find-a-course button label'),
          f('ctaLabel', 'CTA button label')
        ]
      }
    ]
  },

  contact: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [f('title', 'Title'), f('subtitle', 'Subtitle', 'textarea'), f('image', 'Background image', 'image')]
      },
      {
        k: 'form',
        label: 'Contact form',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('submitLabel', 'Submit button label'),
          f('audienceLegend', 'Audience question label'),
          f('topics', 'Topic options (individuals)', 'stringList'),
          f('operatorTopics', 'Topic options (operators)', 'stringList'),
          f('locationLabel', 'Training location question'),
          f('locationOptions', 'Training location options', 'stringList')
        ],
        lists: [
          {
            k: 'audiences',
            label: 'Audience options (individual, then operator)',
            itemLabel: 'Audience',
            fields: [f('title', 'Title'), f('desc', 'Description')]
          }
        ]
      },
      {
        k: 'offices',
        label: 'Regional offices',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title')],
        lists: [
          {
            k: 'items',
            label: 'Offices',
            itemLabel: 'Office',
            fields: [
              f('region', 'Region'),
              f('country', 'Country'),
              f('address', 'Address', 'textarea'),
              f('phone', 'Phone'),
              f('email', 'Email'),
              f('email2', 'Second email (optional)')
            ]
          }
        ]
      },
      {
        k: 'direct',
        label: 'Direct lines',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('replyNote', 'Reply-time note'),
          f('coursesPrefix', 'Course-date note (before link)'),
          f('coursesLinkLabel', 'Course-date link label')
        ],
        lists: [
          {
            k: 'lines',
            label: 'Lines',
            itemLabel: 'Line',
            fields: [f('label', 'Label'), f('value', 'Shown value'), f('href', 'Link (mailto:, tel:, https://)')]
          }
        ]
      }
    ]
  },

  about: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [
          f('title', 'Title', 'textarea'),
          f('subtitle', 'Subtitle', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('secondaryLabel', 'Secondary button label'),
          f('image', 'Background image', 'image')
        ]
      },
      {
        k: 'executive',
        label: 'Executive claim',
        fields: [f('heading', 'Heading', 'textarea'), f('sub', 'Sub-line', 'textarea')]
      },
      {
        k: 'mission',
        label: 'Mission & values',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')],
        lists: [
          {
            k: 'values',
            label: 'Core values',
            itemLabel: 'Value',
            fields: [f('idx', 'Number'), f('title', 'Title'), f('desc', 'Description', 'textarea')]
          }
        ]
      },
      {
        k: 'footprint',
        label: 'Global footprint',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')],
        lists: [
          {
            k: 'regions',
            label: 'Regions',
            itemLabel: 'Region',
            fields: [
              f('name', 'Name'),
              f('location', 'Location'),
              f('facility', 'Facility'),
              f('desc', 'Description', 'textarea')
            ]
          }
        ]
      },
      {
        k: 'finalCta',
        label: 'Final CTA',
        fields: [
          f('title', 'Title'),
          f('desc', 'Description', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('secondaryLabel', 'Secondary button label')
        ]
      }
    ]
  },

  services: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [
          f('title', 'Title'),
          f('subtitle', 'Subtitle', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('whatsappLabel', 'WhatsApp button label'),
          f('image', 'Background image', 'image')
        ]
      },
      {
        k: 'pathways',
        label: 'Certification paths',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')],
        lists: [
          {
            k: 'cards',
            label: 'Path cards',
            itemLabel: 'Card',
            fields: [
              f('region', 'Region'),
              f('title', 'Title'),
              f('desc', 'Description', 'textarea'),
              f('badge1', 'Badge (left)'),
              f('badge2', 'Badge (right)'),
              f('action', 'Action label'),
              f('courseSlug', 'Apply goes to course (slug); empty = Contact')
            ]
          }
        ]
      },
      {
        k: 'cbta',
        label: 'CBTA approach',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea')
        ],
        lists: [
          {
            k: 'pillars',
            label: 'Pillars',
            itemLabel: 'Pillar',
            fields: [
              f('idx', 'Number'),
              f('title', 'Title'),
              f('subtitle', 'Subtitle'),
              f('desc', 'Description', 'textarea'),
              f('iconName', 'Icon name')
            ]
          }
        ]
      },
      {
        k: 'specialist',
        label: 'Specialist services',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('note', 'Note line'),
          f('searchPlaceholder', 'Search placeholder'),
          f('disciplineCtaLabel', 'Discipline card CTA label'),
          f('moreTitle', 'More-info title'),
          f('moreDesc', 'More-info description', 'textarea')
        ],
        lists: [
          {
            k: 'categories',
            label: 'Filter categories',
            itemLabel: 'Category',
            fields: [f('id', 'ID'), f('label', 'Label')]
          },
          {
            k: 'disciplines',
            label: 'Services',
            itemLabel: 'Service',
            fields: [
              f('id', 'Number'),
              f('title', 'Title'),
              f('subtitle', 'Subtitle'),
              f('desc', 'Description', 'textarea'),
              f('facts', 'Key facts (separate with |)'),
              f('audience', 'Audience'),
              f('forAudience', 'Filter: individuals, operators, or both'),
              f('category', 'Category ID'),
              f('tag', 'Tag'),
              f('iconName', 'Icon name'),
              f('image', 'Image', 'image'),
              f('courseSlug', 'Inquire button course slug', 'text'),
              f('courseChoices', 'Course choices (e.g. EASA / FAA dual link)', 'choiceList')
            ]
          }
        ]
      }
    ]
  },

  upcoming: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [f('title', 'Title'), f('subtitle', 'Subtitle', 'textarea')]
      },
      {
        k: 'board',
        label: 'Course table',
        fields: [
          f('colNext', 'Column: next start'),
          f('colCourse', 'Column: course'),
          f('colDuration', 'Column: duration'),
          f('colWhere', 'Column: where'),
          f('colFee', 'Column: fee'),
          f('detailsLabel', 'Course details link label'),
          f('note', 'Note under the table', 'textarea'),
          f('filterAllLabel', 'Country toggle: "all" label'),
          f('sortLabel', 'Sort label'),
          f('formatLabel', 'Format filter label'),
          f('emptyText', 'Text when no course matches')
        ],
        lists: [
          {
            k: 'locations',
            label: 'Countries (toggle at the top)',
            itemLabel: 'Country',
            fields: [f('name', 'Country name'), f('code', 'Flag: 2-letter country code (e.g. dk, us, in, ch)')]
          },
          {
            k: 'courses',
            label: 'Courses',
            itemLabel: 'Course',
            fields: [
              f('when', 'Next start (date or "Rolling")'),
              f('whenNote', 'Start note'),
              f('variantOf', 'Country version of another course (slug of the main course; empty for a main course)'),
              f('startDate', 'Start date for sorting (YYYY-MM-DD, empty if none)'),
              f('format', 'Format (Online, Hybrid or On-site)'),
              f('locations', 'Countries, comma separated (empty = all)'),
              f('title', 'Course title'),
              f('slug', 'Course page slug'),
              f('desc', 'Short description', 'textarea'),
              f('duration', 'Duration'),
              f('where', 'Where'),
              f('fee', 'Fee (leave empty to use the course price)'),
              f('ctaLabel', 'Button label'),
              f('ctaTo', 'Button link')
            ]
          }
        ]
      },
      {
        k: 'operators',
        label: 'Team training band',
        fields: [
          f('title', 'Title'),
          f('text', 'Text', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('secondaryLabel', 'Secondary button label')
        ]
      }
    ]
  },

  events: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [
          f('title', 'Title'),
          f('subtitle', 'Subtitle', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('secondaryLabel', 'Secondary button label'),
          f('image', 'Background image', 'image')
        ]
      },
      {
        k: 'programs',
        label: 'Open-enrollment courses',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('badge', 'Side badge'),
          f('emptyTitle', 'Empty-state title'),
          f('emptyDesc', 'Empty-state description', 'textarea'),
          f('imageDouble', 'Card image: Double Program', 'image'),
          f('imageInitial', 'Card image: Flight Dispatcher Initial', 'image'),
          f('imageFaa', 'Card image: FAA Aircraft Dispatcher', 'image')
        ]
      },
      {
        k: 'develop',
        label: 'What You Develop',
        fields: [f('eyebrow', 'Eyebrow'), f('title', 'Title'), f('intro', 'Intro', 'textarea')]
      },
      {
        k: 'curriculum',
        label: 'Curriculum overview',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('footnote', 'Footnote')
        ],
        lists: [
          {
            k: 'modules',
            label: 'Modules',
            itemLabel: 'Module',
            fields: [f('num', 'Number'), f('title', 'Title'), f('iconName', 'Icon name')],
            stringLists: [{ k: 'items', label: 'Topics' }]
          }
        ]
      },
      {
        k: 'theoryToAircraft',
        label: 'From Theory to the Aircraft',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('tags', 'Module tags', 'stringList'),
          f('image', 'Image', 'image')
        ]
      },
      {
        k: 'finalCta',
        label: 'Final CTA',
        fields: [
          f('title', 'Title'),
          f('desc', 'Description', 'textarea'),
          f('primaryLabel', 'Primary button label'),
          f('secondaryLabel', 'Secondary button label')
        ]
      }
    ]
  },

  foxtrotDelta: {
    groups: [
      {
        k: 'hero',
        label: 'Hero',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('subtitle', 'Subtitle', 'textarea'),
          f('description', 'Description', 'textarea'),
          f('exploreLabel', 'Explore bookshelf button label'),
          f('servicesLabel', 'Explore services button label')
        ]
      },
      {
        k: 'collection',
        label: 'Featured collection',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('intro', 'Intro', 'textarea'),
          f('viewAllLabel', 'View-all button label')
        ],
        lists: [
          {
            k: 'editions',
            label: 'Featured editions',
            itemLabel: 'Edition',
            fields: [
              f('id', 'Edition ID'),
              f('number', 'Issue number'),
              f('date', 'Date'),
              f('title', 'Title'),
              f('subtitle', 'Subtitle', 'textarea'),
              f('theme', 'Theme'),
              f('readLabel', 'Read button label')
            ],
            stringLists: [{ k: 'highlights', label: 'Highlights' }]
          }
        ]
      },
      {
        k: 'finalCta',
        label: 'Final CTA',
        fields: [
          f('title', 'Title'),
          f('desc', 'Description', 'textarea'),
          f('exploreLabel', 'Explore courses button label'),
          f('contactLabel', 'Contact button label')
        ]
      }
    ]
  },

  courseEnrollment: {
    groups: [
      {
        k: 'breadcrumb',
        label: 'Breadcrumb',
        fields: [f('eventsLabel', 'Events link label'), f('enrollLabel', 'Enrollment step label')]
      },
      {
        k: 'header',
        label: 'Header',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('intro', 'Intro copy', 'textarea'),
          f('backLabel', 'Back-to-course button label')
        ]
      },
      {
        k: 'sidebar',
        label: 'Course summary sidebar',
        fields: [
          f('badgeLabel', 'Official intake badge'),
          f('tuitionLabel', 'Tuition label'),
          f('durationLabel', 'Duration row label'),
          f('intakeLabel', 'Intake row label'),
          f('locationLabel', 'Location row label'),
          f('credentialLabel', 'Credential row label'),
          f('credentialValue', 'Credential value'),
          f('accreditationLabel', 'Accreditation strip label')
        ]
      },
      {
        k: 'form',
        label: 'Registration form',
        fields: [
          f('eyebrow', 'Form eyebrow'),
          f('instructions', 'Form instructions'),
          f('submitLabel', 'Submit button label')
        ]
      },
      {
        k: 'support',
        label: 'Admissions support box',
        fields: [
          f('title', 'Title'),
          f('desc', 'Description', 'textarea'),
          f('ctaLabel', 'WhatsApp CTA label')
        ]
      },
      {
        k: 'states',
        label: 'Loading & error states',
        fields: [
          f('loadingText', 'Loading text'),
          f('notFoundTitle', 'Not-found title'),
          f('notFoundCtaLabel', 'Not-found CTA label')
        ]
      }
    ]
  },

  courseDetail: {
    groups: [
      {
        k: 'labels',
        label: 'Static labels & buttons',
        fields: [
          f('backLabel', 'Utility bar back link label'),
          f('previewLabel', 'Preview-mode badge'),
          f('refFallback', 'Ref code fallback text'),
          f('easaBadge', 'Utility bar EASA badge'),
          f('dgcaBadge', 'Utility bar DGCA badge'),
          f('shareLabel', 'Share button label'),
          f('copiedLabel', 'Share-copied label'),
          f('eyebrowPrimary', 'Hero eyebrow (part 1)'),
          f('eyebrowSecondary', 'Hero eyebrow (part 2)'),
          f('easaComplianceBadge', 'Hero EASA compliance badge'),
          f('dgcaComplianceBadge', 'Hero DGCA compliance badge'),
          f('faaComplianceBadge', 'Hero FAA compliance badge'),
          f('cbtaBadge', 'Hero CBTA badge'),
          f('applyOnlineLabel', 'Apply Online button label'),
          f('viewModulesLabel', 'View Course Modules button label'),
          f('outcomesEyebrow', 'Outcomes card eyebrow'),
          f('outcomesTitle', 'Outcomes card title'),
          f('complianceEyebrow', 'Compliance card eyebrow'),
          f('complianceTitleEasa', 'Compliance card title (EASA)'),
          f('complianceTitleDgca', 'Compliance card title (DGCA)'),
          f('complianceTitleFaa', 'Compliance card title (FAA)'),
          f('complianceTag1Easa', 'Compliance tag 1 (EASA)'),
          f('complianceTag1Dgca', 'Compliance tag 1 (DGCA)'),
          f('complianceTag1Faa', 'Compliance tag 1 (FAA)'),
          f('complianceTag2', 'Compliance tag 2'),
          f('complianceTag3', 'Compliance tag 3'),
          f('glanceLabel', 'Program-at-a-glance eyebrow'),
          f('eligibilityEyebrow', 'Eligibility card eyebrow'),
          f('eligibilityTitle', 'Eligibility card title'),
          f('entryReqEyebrow', 'Entry requirements eyebrow'),
          f('entryReqTitle', 'Entry requirements title'),
          f('assessmentEyebrow', 'Assessment eyebrow'),
          f('assessmentTitle', 'Assessment title'),
          f('certEyebrow', 'Certification eyebrow'),
          f('certTitle', 'Certification title'),
          f('datesEyebrow', 'Upcoming courses eyebrow'),
          f('datesTitle', 'Upcoming courses title'),
          f('faqEyebrow', 'FAQ eyebrow'),
          f('faqTitle', 'FAQ title'),
          f('admissionsEyebrow', 'Admissions banner eyebrow'),
          f('admissionsTitle', 'Admissions banner title'),
          f('admissionsDesc', 'Admissions banner description', 'textarea'),
          f('admissionsApplyLabel', 'Admissions banner apply label'),
          f('admissionsWhatsappLabel', 'Admissions banner WhatsApp label'),
          f('sidebarAdmissionsOpenBadge', 'Sidebar admissions-open badge'),
          f('sidebarOverviewLabel', 'Sidebar overview label'),
          f('sidebarTuitionLabel', 'Sidebar tuition label'),
          f('sidebarTuitionNote', 'Sidebar tuition note'),
          f('sidebarEnrollLabel', 'Sidebar enroll button label'),
          f('sidebarWhatsappLabel', 'Sidebar WhatsApp button label'),
          f('sidebarDurationLabel', 'Sidebar duration row label'),
          f('sidebarIntakeLabel', 'Sidebar next-intake row label'),
          f('sidebarLocationLabel', 'Sidebar location row label'),
          f('sidebarDeliveryLabel', 'Sidebar delivery row label'),
          f('sidebarStandardLabel', 'Sidebar standard row label'),
          f('sidebarStandardValueEasa', 'Sidebar standard value (EASA)'),
          f('sidebarStandardValueDgca', 'Sidebar standard value (DGCA)'),
          f('sidebarStandardValueFaa', 'Sidebar standard value (FAA)'),
          f('sidebarCertificateLabel', 'Sidebar certificate row label'),
          f('sidebarCertificateValue', 'Sidebar certificate value'),
          f('sidebarSupportTitle', 'Sidebar support box title'),
          f('sidebarSupportDesc', 'Sidebar support box description', 'textarea')
        ]
      },
      {
        k: 'curriculum',
        label: 'Curriculum framework',
        fields: [
          f('eyebrow', 'Eyebrow'),
          f('title', 'Title'),
          f('subtitle', 'Subtitle')
        ],
        lists: [
          {
            k: 'phases',
            label: 'Curriculum phases',
            itemLabel: 'Phase',
            fields: [f('num', 'Number'), f('label', 'Phase label'), f('title', 'Title')],
            stringLists: [{ k: 'topics', label: 'Topics' }]
          }
        ]
      }
    ]
  }
}

// --------------------------------------------------------------------------
// DEFAULTS  (mirror of the content currently hard-coded in the React pages)
// --------------------------------------------------------------------------

const DEFAULTS = {
  home: {
    hero: {
      eyebrow: 'International Flight Operations Academy',
      title: 'Training for',
      titleHighlight: 'Real-World Operations',
      subtitle:
        'IFOA prepares Flight Dispatchers and OCC teams to anticipate change, make sound decisions, and keep operations moving, because real operations don’t simply follow an exam syllabus.',
      primaryLabel: 'Find a course',
      secondaryLabel: 'For operators',
      stats: [
        { value: '500+', label: 'PROFESSIONALS TRAINED A YEAR' },
        { value: '70+', label: 'OPERATORS TRAINED' },
        { value: 'FAA', label: 'PART 65 APPROVED SCHOOL' },
        { value: '4.7/5', label: 'FROM 458 POST-TRAINING SURVEYS' }
      ]
    },
    featuredCourses: {
      eyebrow: 'OPEN-ENROLLMENT COURSES',
      title: 'Flight dispatcher courses',
      intro: 'For individuals. Apply online, then start on a published date or on rolling admissions.',
      badgeLabel: 'Europe, USA and India'
    },
    regions: {
      eyebrow: 'Where We Train',
      title: 'Flight dispatcher training in Europe, the USA and India',
      intro: 'Train where you plan to work, under the rules you’ll dispatch by.',
      cards: [
        {
          name: 'Europe',
          city: 'Sønderborg, Denmark',
          desc: 'Three courses: Flight Dispatcher Initial (ICAO Doc 10106, with EASA operations, 200 hours, 5 weeks), FAA Aircraft Dispatcher (Part 65 approved course, 200 hours, 6 weeks) and the Double Program: FAA & EASA (280 hours, 7 weeks).',
          link1Label: 'Flight Dispatcher Initial',
          link1Slug: 'flight-dispatcher-initial-certification',
          link2Label: 'FAA Aircraft Dispatcher',
          link2Slug: 'aircraft-dispatcher-training-faa-part-65',
          link3Label: 'Double Program: FAA & EASA',
          link3Slug: 'flight-dispatcher-double-programme'
        },
        {
          name: 'USA',
          city: 'Daytona Beach, Florida',
          desc: 'FAA Aircraft Dispatcher: the Part 65 approved course that prepares you for the FAA license.',
          link1Label: 'FAA Aircraft Dispatcher',
          link1Slug: 'aircraft-dispatcher-training-faa-part-65',
          link2Label: '',
          link2Slug: ''
        },
        {
          name: 'India',
          city: 'New Delhi, India',
          desc: 'Three courses: Flight Dispatcher Initial (ICAO Doc 10106, 4 weeks, online preparation then on-site), FAA Aircraft Dispatcher (Part 65 approved course, 200 hours, 5 weeks, plus an exam week taken within 6 months) and the Double Program: FAA & EASA (280 hours, 7 weeks).',
          link1Label: 'Flight Dispatcher Initial',
          link1Slug: 'flight-dispatcher-initial-training-india',
          link2Label: 'FAA Aircraft Dispatcher',
          link2Slug: 'aircraft-dispatcher-training-faa-part-65',
          link3Label: 'Double Program: FAA & EASA',
          link3Slug: 'flight-dispatcher-double-programme'
        }
      ]
    },

    trustRating: {
      eyebrow: 'Verified Post-Training Feedback',
      title: 'Rated by the people we trained',
      desc: 'Average rating from 458 post-training surveys from 70+ operators. 98% would recommend IFOA.',
      learnMoreLabel: 'Learn more',
      ratingValue: '4.7',
      ratingSuffix: '/5',
      reviewCountLabel: '(458 post-training surveys)',
      badgeLabel: '98% would recommend IFOA'
    },
    pathways: {
      eyebrow: 'For airlines and OCCs',
      title: 'Delivered at your base or online, built around your manuals, fleet and procedures.',
      seeMoreLabel: 'See More',
      cards: [
        {
          category: 'Initial, Recurrent, Advanced',
          title: 'Flight Dispatch for your team',
          desc: 'Tailored initial, recurrent and advanced training, built around your manuals, fleet and regulator.',
          hours: 'Operator Team Training\nOnline or at your base',
          linkText: 'See operator courses',
        url: '/services?for=operators'
        },
        {
          category: 'EASA Part FTL',
          title: 'Crew Control',
          desc: 'EASA Part FTL or your OM-A Chapter 7, with acclimatization and long-haul exercises.',
          hours: '2 Days Intensive Workshop\nOnline or at your base',
          linkText: 'View course',
          courseSlug: 'airline-crew-control-flight-rostering'
        },
        {
          category: 'Dangerous Goods',
          title: 'Dangerous Goods for your crews',
          desc: 'Pilots, dispatchers and cabin crew, adapted to your operation type and DG policy, with expiry tracking.',
          hours: 'No-carry, carry, airline, cargo\nSelf-paced online, live virtual or in-house',
          linkText: 'View course',
          courseSlug: 'dangerous-goods-regulations-cbta-initial'
        },
        {
          category: 'Train the Trainer',
          title: 'Train your instructors',
          desc: 'Train the Trainer in-house, with teaching practice on your own training topics.',
          hours: '4 Days Instructor Course\nDelivered at your base',
          linkText: 'View course',
          courseSlug: 'train-the-trainer-icao-cbta-instructor'
        },
        {
          category: 'Human Factors',
          title: 'Human Factors for the OCC',
          desc: 'Not CRM for flight crew. Fatigue, stress, decisions and working alongside AI tools.',
          hours: '2 Days TEM & Decision Making\nAt your OCC or an IFOA facility',
          linkText: 'View course',
          courseSlug: 'human-factors-in-the-occ'
        },
        {
          category: 'FAA & EASA',
          title: 'Double Program: FAA & EASA',
          desc: 'The FAA Part 65 approved course plus ICAO and EASA operations in one program. The FAA license is issued by the FAA.',
          hours: '280 Hours (7 Weeks) · Hybrid\nDenmark, India · $5,500 USD',
          linkText: 'View course',
          courseSlug: 'flight-dispatcher-double-programme'
        },
        {
          category: 'FAA Part 65',
          title: 'FAA Aircraft Dispatcher',
          desc: 'Prepares you for the FAA Aircraft Dispatcher license. Part 65 approved.',
          hours: '200 Hours (6 Weeks) · Hybrid\nDenmark, USA, India · $4,500 USD',
          linkText: 'View course',
          courseSlug: 'aircraft-dispatcher-training-faa-part-65'
        },
        {
          category: 'ICAO Doc 10106',
          title: 'Flight Dispatcher Initial',
          desc: 'ICAO Doc 10106, with EASA operations.',
          hours: '200 Hours (5 Weeks) · Hybrid\nDenmark · €3,500 (India: 4 Weeks, €1,000 + GST)',
          linkText: 'View course',
          courseSlug: 'flight-dispatcher-initial-certification'
        }
      ]
    },
    network: {
      eyebrow: 'Global Airline Network',
      title: 'Some of the 70+ operators whose staff we’ve trained',
      intro: 'Flight dispatcher training in Europe, the USA and India. Train where you plan to work, under the rules you’ll dispatch by.'
    },
    audience: {
      eyebrow: 'Two Different Needs',
      title: 'Built for careers. Built for operations.',
      intro: '',
      cards: [
        {
          eyebrow: 'For Individuals',
          trackBadge: 'Career Pathway',
          title: 'I want to become a dispatcher',
          desc:
            'FAA Part 65 approved and ICAO-based courses in Europe, the USA and India, with published fees and start dates.',
          bullet1: 'Scenario-based training',
          bullet2: 'FAA Part 65 & ICAO, in Europe, the USA and India',
          ctaLabel: 'See dispatcher courses'
        },
        {
          eyebrow: 'For Airlines',
          trackBadge: 'Airlines & OCC',
          title: 'I train an OCC team',
          desc:
            'Flight dispatch, crew control, dangerous goods, train the trainer and human factors, built around your operation.',
          bullet1: 'Customized operations training',
          bullet2: 'Online or at your base, built around your manuals',
          ctaLabel: 'See operator training'
        }
      ]
    },
    testimonialsSection: {
      eyebrow: 'Verified Industry Feedback',
      title: 'Stories from Those Who Know Us Best',
      intro:
        'Operational expertise, not generic aviation education. Real-world feedback from flight dispatchers, OCC managers, and airline training leaders.',
      visualTabLabel: 'Airline Showcase',
      executiveTabLabel: 'Executive Statements',
      allTabLabel: 'All Feedback'
    },
    framework: {
      eyebrow: 'Training Framework',
      title: 'Built on the standards operators are audited against',
      standards: [
        { title: 'ICAO Doc 10106', logo: 'icao', desc: 'Competency-based training for flight operations officers and dispatchers' },
        { title: 'FAA 14 CFR Part 65', logo: 'faa', desc: 'IFOA is an FAA-approved aircraft dispatcher school' },
        { title: 'EASA Air Operations', logo: 'easa', desc: 'Regulation (EU) 965/2012, taught across our European courses' }
      ]
    },
    beyond: {
      eyebrow: 'Explore IFOA',
      title: 'Careers, insights and opportunities',
      intro: 'Find your next role and stay connected with the people shaping flight dispatch.',
      cards: [
        {
          title: 'Smart Talent',
          desc: 'Our aviation recruitment platform, connecting dispatchers and OCC professionals with operators.',
          linkLabel: 'Visit Smart Talent',
          livePreview: 'yes',
          url: 'https://talent.theifoa.com/'
        },
        {
          title: 'Foxtrot Delta',
          desc: 'Our magazine on flight dispatch and operations control.',
          linkLabel: 'Read Foxtrot Delta',
          url: '/foxtrot-delta'
        }
      ]
    },
    finalCta: {
      eyebrow: 'OPERATIONAL EXCELLENCE',
      title: 'Train for the operation, not only for the exam.',
      desc: 'Find a course, or talk to us about training for your team.',
      findCourseLabel: 'Find a course',
      ctaLabel: 'Talk to us about your team'
    }
  },

  contact: {
    hero: {
      title: 'Talk to us',
      subtitle: "Tell us who you are and what you need. We'll pass it to the right person.",
      image: null
    },
    form: {
      eyebrow: 'SEND A MESSAGE',
      title: 'Start the conversation',
      submitLabel: 'Send message',
      audienceLegend: 'I am',
      audiences: [
        { title: 'An individual', desc: 'Becoming a dispatcher, or joining a course' },
        { title: 'An operator', desc: 'Training or consulting for my team' }
      ],
      topics: [
        'FAA Aircraft Dispatcher',
        'Flight Dispatcher Initial',
        'Double Program: FAA & EASA',
        'Train the Trainer',
        'Which course is right for me?',
        'Something else'
      ],
      operatorTopics: [
        'Flight Dispatch: tailored initial, recurrent or advanced',
        'Crew Control',
        'Dangerous Goods for our crews',
        'Train the Trainer in-house',
        'Human Factors for the OCC',
        'OCC consulting',
        'Something else'
      ],
      flightDispatchPathways: ['ICAO & EASA', 'FAA Part 65'],
      locationLabel: 'Where do you want to train?',
      locationOptions: [
        'Denmark (Sønderborg)',
        'United States (Daytona Beach)',
        'India (New Delhi)',
        'Online',
        'At our base (for operators)',
        'Not sure yet'
      ]
    },
    offices: {
      eyebrow: 'OFFICES',
      title: 'Our offices',
      items: [
        {
          region: 'Headquarters',
          country: 'Switzerland',
          address: 'Oberdorf 26, 4314 Zeiningen, Aargau, Switzerland',
          phone: '+41 78 227 3103',
          email: 'info@theifoa.com'
        },
        {
          region: 'Americas',
          country: 'United States',
          address: '1616 Concierge Blvd, Suite 100, Daytona Beach, FL 32117, USA',
          phone: '+1 508 838 5880',
          email: 'info@theifoa.com'
        },
        {
          region: 'Asia',
          country: 'India',
          address: 'Innov8 Old Fort, 2nd Floor, Saket District Centre, New Delhi 110017, India',
          phone: '+91 98101 44034',
          email: 'info@theifoa.com',
          email2: 'info-india@theifoa.com'
        }
      ]
    },
    direct: {
      eyebrow: 'DIRECT LINES',
      title: 'Direct lines',
      lines: [
        { label: 'Email', value: 'info@theifoa.com', href: 'mailto:info@theifoa.com' },
        { label: 'WhatsApp', value: '+41 78 227 3103', href: 'https://wa.me/41782273103' }
      ],
      replyNote: 'We reply to every inquiry within two working days.',
      coursesPrefix: 'Looking for a course date? See',
      coursesLinkLabel: 'upcoming courses'
    }
  },

  about: {
    hero: {
      title: 'The Global Flight Dispatch Standard',
      subtitle:
        'Five years in, we became the standard other schools get measured against.',
      primaryLabel: 'Request a proposal',
      secondaryLabel: 'Explore Courses',
      image: null
    },
    executive: {
      heading:
        'In just five years, we became the leading aviation training company in Europe for the education and development of flight dispatchers.',
      sub: 'A position earned through relentless commitment to quality, industry relevance, and real-world results.'
    },
    mission: {
      eyebrow: 'OUR MISSION',
      title: 'Prepared, not just certified',
      intro:
        'Our mission is simple: your team operates at the highest level of safety and efficiency, trained through courses that are effective and affordable, with never a trade-off between the two.',
      values: [
        {
          idx: '01',
          title: 'World-class, accessible',
          desc: 'We take pride in delivering world-class services at accessible prices: excellence and value for every customer we serve.'
        },
        {
          idx: '02',
          title: 'Built on trust',
          desc: "We hold the same uncompromising standard whether or not anyone's watching."
        },
        {
          idx: '03',
          title: 'Driving innovation',
          desc: 'We anchor our culture in continuous improvement, enhancing the training experience and the value we deliver, year over year.'
        }
      ]
    },
    footprint: {
      eyebrow: 'GLOBAL FOOTPRINT',
      title: 'Operational wherever airlines fly',
      intro:
        'Three regional hubs, plus our European training site in Sønderborg, Denmark, supporting carriers, students and dispatch teams across 3 continents.',
      regions: [
        {
          name: 'Europe HQ',
          location: 'Zeiningen, Switzerland',
          facility: 'IFOA',
          desc: 'European headquarters. European courses are taught in Sønderborg, Denmark, at Air Alsie, to ORO.GEN.110 (Regulation (EU) 965/2012).'
        },
        {
          name: 'North America',
          location: 'Daytona Beach, FL',
          facility: 'IFOA USA',
          desc: 'FAA Part 65 approved Aircraft Dispatcher school and Agent for Service.'
        },
        {
          name: 'India & Asia-Pacific',
          location: 'New Delhi, India',
          facility: 'IFOA INDIA',
          desc: 'South Asian school delivering the FAA Part 65 approved course and Flight Dispatcher Initial, built on ICAO Doc 10106, on-site in New Delhi.'
        }
      ]
    },
    finalCta: {
      title: 'Want to see how this plays out for your team?',
      desc: 'Talk to us about your fleet, your ops manual, and where your OCC needs to be stronger.',
      primaryLabel: 'Request a proposal',
      secondaryLabel: 'Browse Training Courses'
    }
  },

  services: {
    hero: {
      title: 'Built on competency, not just compliance.',
      subtitle:
        "Every IFOA course and service in one place. Filter by who it's for, compare length, delivery and price, then open the one you need.",
      primaryLabel: 'Contact Us',
      whatsappLabel: 'WhatsApp Us',
      image: null
    },
    pathways: {
      eyebrow: 'START HERE',
      title: 'Choose your course',
      intro:
        'Dispatcher courses for individuals, and tailored flight dispatch training for operators. Compare length, delivery and price.',
      cards: [
        {
          region: 'Denmark',
          title: 'Flight Dispatcher Initial',
          courseSlug: 'flight-dispatcher-initial-certification',
          desc: 'ICAO Doc 10106, with EASA operations.',
          badge1: '200 HRS · 5 WKS',
          badge2: '€3,500',
          action: 'Apply'
        },
        {
          region: 'Denmark · USA · India',
          title: 'FAA Aircraft Dispatcher',
          courseSlug: 'aircraft-dispatcher-training-faa-part-65',
          desc: 'FAA Part 65 approved. Prepares you for the FAA Aircraft Dispatcher license.',
          badge1: '200 HRS · 6 WKS',
          badge2: '$4,500 USD',
          action: 'Apply'
        },
        {
          region: 'Denmark · India',
          title: 'Double Program: FAA & EASA',
          courseSlug: 'flight-dispatcher-double-programme',
          desc: 'FAA Part 65 plus ICAO and EASA operations in one program.',
          badge1: '280 HRS · 7 WKS',
          badge2: '$5,500 USD',
          action: 'Apply'
        },
        {
          region: 'Operators',
          title: 'Tailored Dispatch Training',
          desc: 'Initial, recurrent and advanced training built around your operation.',
          badge1: 'ON REQUEST',
          badge2: 'TAILORED',
          action: 'Request a proposal'
        }
      ]
    },
    cbta: {
      eyebrow: 'Competency-Based Training & Assessment (CBTA)',
      title: 'How we train',
      intro:
        "Competency-Based Training and Assessment isn't just a regulatory buzzword, it is the engineering foundation of every curriculum we design, ensuring flight dispatchers are prepared for 3am critical decisions.",
      pillars: [
        {
          idx: '01',
          title: 'Real OCC situations',
          subtitle: 'REAL-WORLD OCC CONTEXT',
          desc: 'Every course is built on scenarios from the operation, not textbook examples.',
          iconName: 'flight-route'
        },
        {
          idx: '02',
          title: 'Taught by practitioners',
          subtitle: 'ACTIVE INDUSTRY PRACTITIONERS',
          desc: 'Instructors who work, or have worked, in operations control.',
          iconName: 'instructor-board'
        },
        {
          idx: '03',
          title: 'Your format',
          subtitle: 'ONSITE, VIRTUAL & HYBRID',
          desc: 'On-site, online or hybrid, depending on the course and your team.',
          iconName: 'occ-console'
        },
        {
          idx: '04',
          title: 'Assessed on performance',
          subtitle: 'COMPETENCY-FOCUSED ASSESSMENT',
          desc: 'You show what you can do, not only what you remember.',
          iconName: 'official-certificate'
        }
      ]
    },
    specialist: {
      eyebrow: 'All Courses and Services',
      title: 'Every IFOA course and service in one place',
      intro:
        "Filter by who it's for, compare length, delivery and price, then open the one you need.",
      note: '',
      searchPlaceholder: 'Search courses and services...',
      disciplineCtaLabel: 'Inquire',
      moreTitle: 'Not sure which course fits?',
      moreDesc:
        "Tell us your role or your team, and we'll point you to the right one.",
      categories: [
        { id: 'all', label: 'All Services (6)' },
        { id: 'flight-ops', label: 'Flight Operations & OCC' },
        { id: 'train-trainer', label: 'Train the Trainer' },
        { id: 'consulting', label: 'Consulting' }
      ],
      disciplines: [
        {
          id: '01',
          title: 'Flight Dispatch',
          subtitle: 'Own the operation from the ground.',
          desc: 'FAA Part 65 approved courses and ICAO Doc 10106 courses with EASA operations for individuals, plus tailored initial, recurrent and advanced training for operators.',
          audience: 'Individuals & Operators',
          forAudience: 'individuals operators',
          category: 'flight-ops',
          tag: 'Flight Operations',
          iconName: 'dispatcher-headset',
          image: null,
          courseChoices: [
            { label: 'ICAO & EASA', courseSlug: 'flight-dispatcher-initial-certification' },
            { label: 'FAA Part 65', courseSlug: 'aircraft-dispatcher-training-faa-part-65' }
          ]
        },
        {
          id: '02',
          title: 'Double Program: FAA & EASA',
          subtitle: 'One FAA license, trained for both rule sets.',
          desc: 'The FAA Part 65 approved course plus ICAO and EASA operations, taught as one program. ADX preparation is self-study.',
          facts: '280 hours | 7 weeks | Hybrid',
          audience: 'Individuals',
          forAudience: 'individuals',
          category: 'flight-ops',
          tag: 'FAA & EASA',
          iconName: 'dispatcher-headset',
          image: null,
          courseSlug: 'flight-dispatcher-double-programme'
        },
        {
          id: '02',
          title: 'Dangerous Goods',
          subtitle: 'Know the risks. Move with confidence.',
          desc: 'For pilots, dispatchers and cabin crew, adapted to no-carry business aviation, carry business aviation, airline and cargo operations.',
          facts: 'Initial and recurrent | Self-paced online | Live virtual | In-house',
          audience: 'Pilots, Dispatchers & Cabin Crew',
          forAudience: 'operators',
          category: 'flight-ops',
          tag: 'DGR Compliance',
          iconName: 'dgr-flame',
          image: null,
          courseSlug: 'dangerous-goods-regulations-cbta-initial'
        },
        {
          id: '03',
          title: 'Train the Trainer',
          subtitle: 'Turn expertise into exceptional training.',
          desc: 'For aviation professionals who teach. Ten modules and two assessed teaching practices.',
          facts: '4 days | Open course | In-house',
          audience: 'Aviation Professionals Who Teach',
          forAudience: 'operators',
          category: 'train-trainer',
          tag: 'Instructional Pedagogy',
          iconName: 'instructor-board',
          image: null,
          courseSlug: 'train-the-trainer-icao-cbta-instructor'
        },
        {
          id: '04',
          title: 'Human Factors for the OCC',
          subtitle: 'Performance under pressure starts with people.',
          desc: 'Not CRM for flight crew. Fatigue, stress, decisions and working alongside AI tools.',
          facts: '2 days | At your OCC | IFOA facility',
          audience: 'OCC & Flight Operations Personnel',
          forAudience: 'operators',
          category: 'flight-ops',
          tag: 'Human Factors for OCC',
          iconName: 'human-brain-crm',
          image: null,
          courseSlug: 'human-factors-in-the-occ'
        },
        {
          id: '05',
          title: 'Crew Control',
          subtitle: 'Keep the operation moving.',
          desc: 'EASA Part FTL or your OM-A Chapter 7, fatigue risk and crew control operations, with long-haul exercises.',
          facts: '2 days | Online | At your base',
          audience: 'Crew Schedulers & Controllers',
          forAudience: 'operators',
          category: 'flight-ops',
          tag: 'Crew Scheduling',
          iconName: 'crew-roster',
          image: null,
          courseSlug: 'airline-crew-control-flight-rostering'
        },
        {
          id: '06',
          title: 'OCC Consulting',
          linkText: 'View service',
          subtitle: 'Turn operational challenges into better performance.',
          desc: 'Assessments, operational control setup, manuals, CBTA programs, audit support and AI readiness.',
          facts: 'Fixed scope or retainer | On-site or remote',
          audience: 'Airlines & Aviation Organizations',
          forAudience: 'operators',
          category: 'consulting',
          tag: 'Aviation Advisory',
          iconName: 'airline-audit',
          image: null,
          courseSlug: 'airline-occ-setup-operational-consulting'
        }
      ]
    }
  },

  upcoming: {
    "hero": {
      "title": "Upcoming courses",
      "subtitle": "Courses you can book yourself, with their next start date. Training a whole team? We schedule it around your operation instead."
    },
    "board": {
      "colNext": "Next start",
      "colCourse": "Course",
      "colDuration": "Duration",
      "colWhere": "Location",
      "colFee": "Fee",
      "detailsLabel": "Course details",
      "note": "Dates can change. Your place is confirmed once your application is accepted and payment is received, as set out in the application form.",
      "locations": [
        {
          "name": "Denmark",
          "code": "dk"
        },
        {
          "name": "USA",
          "code": "us"
        },
        {
          "name": "India",
          "code": "in"
        }
      ],
      "courses": [
        {
          "when": "4 Jan 2027",
          "whenNote": "Seats open",
          "startDate": "2027-01-04",
          "format": "Hybrid",
          "locations": "Denmark",
          "title": "Flight Dispatcher Initial",
          "slug": "flight-dispatcher-initial-certification",
          "variantOf": "",
          "desc": "ICAO Doc 10106, with EASA operations.",
          "duration": "5 weeks",
          "where": "2 weeks online, 3 weeks in Sønderborg, Denmark",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/flight-dispatcher-initial-certification/enroll"
        },
        {
          "when": "Rolling",
          "whenNote": "Starts at 10 registrations",
          "startDate": "",
          "format": "Hybrid",
          "locations": "India",
          "title": "Flight Dispatcher Initial (India)",
          "slug": "flight-dispatcher-initial-training-india",
          "variantOf": "flight-dispatcher-initial-certification",
          "desc": "ICAO Doc 10106, taught in New Delhi after online preparation.",
          "duration": "4 weeks",
          "where": "Online preparation, then New Delhi, India",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/flight-dispatcher-initial-certification/enroll?location=india"
        },
        {
          "when": "Rolling",
          "whenNote": "India batches from 8 Feb 2027",
          "startDate": "",
          "format": "Hybrid",
          "locations": "Denmark, USA, India",
          "title": "FAA Aircraft Dispatcher",
          "slug": "aircraft-dispatcher-training-faa-part-65",
          "variantOf": "",
          "desc": "FAA Part 65 approved. Prepares you for the FAA Aircraft Dispatcher license.",
          "duration": "6 weeks (India: 5 weeks, plus an exam week taken within 6 months), plus ADX self-study",
          "where": "Online preparation, then Sønderborg, Florida or New Delhi",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/aircraft-dispatcher-training-faa-part-65/enroll"
        },
        {
          "when": "To be confirmed",
          "whenNote": "Contact us for dates",
          "startDate": "",
          "format": "Hybrid",
          "locations": "Denmark, India",
          "title": "Double Program: FAA & EASA",
          "slug": "flight-dispatcher-double-programme",
          "variantOf": "",
          "desc": "The FAA Part 65 approved course plus ICAO and EASA operations. One FAA license, trained for both rule sets.",
          "duration": "7 weeks, plus ADX self-study",
          "where": "Hybrid, Denmark · India",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/flight-dispatcher-double-programme/enroll"
        },
        {
          "when": "Rolling",
          "whenNote": "Rolling admissions",
          "startDate": "",
          "format": "Hybrid",
          "locations": "Denmark",
          "title": "FAA Aircraft Dispatcher (Denmark)",
          "slug": "aircraft-dispatcher-training-faa-part-65",
          "variantOf": "aircraft-dispatcher-training-faa-part-65",
          "desc": "",
          "duration": "6 weeks, plus ADX self-study",
          "where": "Online preparation, then Sønderborg, Denmark",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/aircraft-dispatcher-training-faa-part-65/enroll?location=denmark"
        },
        {
          "when": "Rolling",
          "whenNote": "Rolling admissions",
          "startDate": "",
          "format": "Hybrid",
          "locations": "USA",
          "title": "FAA Aircraft Dispatcher (USA)",
          "slug": "aircraft-dispatcher-training-faa-part-65",
          "variantOf": "aircraft-dispatcher-training-faa-part-65",
          "desc": "",
          "duration": "6 weeks, plus ADX self-study",
          "where": "Online preparation, then Florida, USA",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/aircraft-dispatcher-training-faa-part-65/enroll?location=usa"
        },
        {
          "when": "Rolling",
          "whenNote": "Batches from 8 Feb 2027",
          "startDate": "",
          "format": "Hybrid",
          "locations": "India",
          "title": "FAA Aircraft Dispatcher (India)",
          "slug": "aircraft-dispatcher-training-faa-part-65",
          "variantOf": "aircraft-dispatcher-training-faa-part-65",
          "desc": "",
          "duration": "5 weeks, plus an exam week taken within 6 months, plus ADX self-study",
          "where": "Online preparation, then New Delhi, India",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/aircraft-dispatcher-training-faa-part-65/enroll?location=india"
        },
        {
          "when": "To be confirmed",
          "whenNote": "Contact us for dates",
          "startDate": "",
          "format": "Hybrid",
          "locations": "Denmark",
          "title": "Double Program: FAA & EASA (Denmark)",
          "slug": "flight-dispatcher-double-programme",
          "variantOf": "flight-dispatcher-double-programme",
          "desc": "",
          "duration": "7 weeks, plus ADX self-study",
          "where": "Hybrid, Sønderborg, Denmark",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/flight-dispatcher-double-programme/enroll?location=denmark"
        },
        {
          "when": "To be confirmed",
          "whenNote": "Contact us for dates",
          "startDate": "",
          "format": "Hybrid",
          "locations": "India",
          "title": "Double Program: FAA & EASA (India)",
          "slug": "flight-dispatcher-double-programme",
          "variantOf": "flight-dispatcher-double-programme",
          "desc": "",
          "duration": "7 weeks, plus ADX self-study",
          "where": "Hybrid, New Delhi, India",
          "fee": "",
          "ctaLabel": "Apply",
          "ctaTo": "/courses/flight-dispatcher-double-programme/enroll?location=india"
        },
        {
          "when": "Next date",
          "whenNote": "To be announced",
          "startDate": "",
          "format": "On-site",
          "locations": "",
          "title": "Train the Trainer",
          "slug": "train-the-trainer-icao-cbta-instructor",
          "variantOf": "",
          "desc": "For aviation professionals who teach. You teach twice, with feedback each time.",
          "duration": "4 days",
          "where": "Open course, or in-house at your base",
          "fee": "On request",
          "ctaLabel": "Request a proposal",
          "ctaTo": "/contact?course=train-the-trainer-icao-cbta-instructor"
        }
      ],
      "filterAllLabel": "All countries",
      "sortLabel": "Sort by",
      "formatLabel": "Format",
      "emptyText": "No upcoming course matches this selection."
    },
    "operators": {
      "title": "Training your whole team?",
      "text": "Operators don't wait for a public date. We schedule flight dispatch, crew control, dangerous goods, train the trainer and human factors training around your operation, online or at your base.",
      "primaryLabel": "Talk to us about your team",
      "secondaryLabel": "See operator courses"
    }
  },

  events: {
    hero: {
      title: 'Open-enrollment cohorts, worldwide.',
      subtitle:
        'Dispatcher courses you can apply for directly, on published dates or rolling admissions, alongside the custom fleet training we build for airlines and operators.',
      primaryLabel: 'View Open Courses',
      secondaryLabel: 'Ask us on WhatsApp',
      image: null
    },
    programs: {
      eyebrow: 'Open-Enrollment Courses',
      title: 'Your Next Step in Aviation Starts Here',
      intro:
        'Explore our range of open-enrollment courses, developed to build practical knowledge, professional skills, and operational capability across aviation. Find your course and join an upcoming intake.',
      badge: 'Rolling Global Intakes',
      emptyTitle: 'No open intakes right now',
      emptyDesc:
        'New cohorts are published here as admissions open. Leave your email below to be notified.'
    },
    develop: {
      eyebrow: 'What You Develop',
      title: 'Knowledge is only useful when you can apply it operationally.',
      intro:
        'The program develops the technical knowledge, situational awareness and operational judgment required to support safe and efficient flight operations.'
    },
    curriculum: {
      eyebrow: 'Curriculum Overview',
      title: 'What the Flight Dispatch program covers',
      intro: 'Organized around operational capability, not a flat list of disconnected subjects.',
      footnote: '',
      modules: [
        {
          num: '01',
          title: 'The Operating Environment',
          iconName: 'airspace',
          items: ['Air law and regulations', 'ICAO and EASA framework', 'Air traffic management', 'Aeronautical communications']
        },
        {
          num: '02',
          title: 'Know the Aircraft',
          iconName: 'altimeter',
          items: ['Aircraft systems for dispatchers', 'Mass and balance', 'Aircraft performance', 'MEL and CDL']
        },
        {
          num: '03',
          title: 'Plan the Flight',
          iconName: 'flight-route',
          items: ['Aviation meteorology', 'Navigation and route planning', 'Fuel planning and alternates', 'NOTAMs and flight plan filing']
        },
        {
          num: '04',
          title: 'Control the Operation',
          iconName: 'dispatcher-headset',
          items: ['Flight following and monitoring', 'Operational control', 'Communicating with crew and stakeholders', 'Managing disruptions']
        },
        {
          num: '05',
          title: 'Make the Decision',
          iconName: 'situational-awareness',
          items: ['Decision-making under uncertainty', 'Threat and error management', 'Human factors in dispatch', 'Scenario exercises']
        }
      ]
    },
    theoryToAircraft: {
      eyebrow: 'FROM THEORY TO THE AIRCRAFT',
      title: 'Know the aircraft. Understand the operation.',
      intro:
        'Take aircraft knowledge beyond the classroom. Our training connects aircraft systems, performance, limitations, mass and balance, and flight planning to the operational decisions professionals make every day.',
      tags: ['AIRCRAFT SYSTEMS', 'PERFORMANCE', 'MASS & BALANCE', 'FLIGHT PLANNING', 'LIMITATIONS']
    },
    finalCta: {
      title: 'Want fleet-wide training instead of an open cohort?',
      desc: "Airlines and operators don't wait for a public calendar date: we schedule custom training around your ops.",
      primaryLabel: 'Talk to Us About Your Team',
      secondaryLabel: 'Browse Training Courses'
    }
  },

  foxtrotDelta: {
    hero: {
      eyebrow: 'The Voice of Operational Control',
      title: 'Foxtrot Delta Magazine',
      subtitle: 'Meet the Operational Control Teams that make the Magic happen!',
      description:
        'The aviation industry’s first and only publication dedicated exclusively to flight dispatchers, crew controllers, and OCC personnel worldwide, spotlighting the essential roles, daily challenges, and forward-thinking innovations that shape modern aviation.',
      exploreLabel: 'Explore Digital Bookshelf',
      servicesLabel: 'Explore Our Services'
    },
    collection: {
      eyebrow: 'The Collection',
      title: 'Featured Foxtrot Delta Issues',
      intro:
        'Highlights from our landmark publications covering OCC leadership, technological breakthroughs, and flight safety science.',
      viewAllLabel: 'View All on Bookshelf',
      editions: [
        {
          id: 'special-edition',
          number: 'Special Edition',
          date: 'May 2023',
          title: 'Aviation Sustainability',
          subtitle: 'Can Aviation Kick Its Contrail Habit? & Net Zero for Business Aviation',
          theme: 'Sustainability & Ecology',
          readLabel: 'Read Issue',
          highlights: ['SATAVIA Contrail Science', 'AZZERA Net Zero Pathways', 'Eco-Climb Profiles']
        },
        {
          id: 'issue-02',
          number: 'Issue N°2',
          date: 'February 2023',
          title: 'Jetfly OCC & Fleet Pioneers',
          subtitle: 'Managing the World’s Largest Pilatus Fleet with High-Precision Dispatch',
          theme: 'Fleet Operations',
          readLabel: 'Read Issue',
          highlights: ['Jetfly 60+ PC-12/PC-24 OCC', 'SITA EWAS Predictive Analytics', 'SATAVIA Meteorology']
        },
        {
          id: 'issue-01',
          number: 'Issue N°1',
          date: 'November 2022',
          title: 'The Indian Ocean Pearl',
          subtitle: 'Air Mauritius OCC Operations & Threat-Informed Risk Planning',
          theme: 'Oceanic Operations',
          readLabel: 'Read Issue',
          highlights: ['Air Mauritius Isolated Hub', 'Osprey:Sentinel Threat Intel', 'Honeywell Forge Efficiency']
        }
      ]
    },
    finalCta: {
      title: 'Ready to enhance your operational competencies?',
      desc:
        'Book the most suitable training course to acquire essential decision-making skills, regulatory compliance, and peak operational performance.',
      exploreLabel: 'Explore Training Courses',
      contactLabel: 'Contact Us'
    }
  },

  courseEnrollment: {
    breadcrumb: {
      eventsLabel: 'Courses',
      enrollLabel: 'Online Enrollment'
    },
    header: {
      eyebrow: 'Application form',
      intro:
        'Complete the form below. We check your application against the entry requirements, then send you a place offer with payment and joining details.',
      backLabel: 'Back'
    },
    sidebar: {
      badgeLabel: 'Official Intake',
      tuitionLabel: 'Course Tuition',
      durationLabel: 'Duration',
      intakeLabel: 'Intake',
      locationLabel: 'Location',
      credentialLabel: 'Credential',
      credentialValue: 'IFOA Certificate',
      accreditationLabel: 'Regulatory Framework'
    },
    form: {
      eyebrow: 'Candidate Registration Form',
      instructions: 'Please complete all required fields marked with an asterisk',
      submitLabel: 'Submit Application Now'
    },
    support: {
      title: 'Need Admissions Assistance?',
      desc: 'Have questions regarding eligibility, visa letters, or payment schedules?',
      ctaLabel: 'Chat with Admissions on WhatsApp'
    },
    states: {
      loadingText: 'Loading Official Application Portal…',
      notFoundTitle: 'Application Portal Not Found',
      notFoundCtaLabel: 'View All Open Courses'
    }
  },

  courseDetail: {
    labels: {
      backLabel: 'All Intakes & Events',
      previewLabel: 'Preview Mode',
      refFallback: 'IFOA Training',
      easaBadge: 'EASA Compliant',
      dgcaBadge: 'DGCA & ICAO Aligned',
      shareLabel: 'Share',
      copiedLabel: 'Copied',
      eyebrowPrimary: 'Professional Aviation Training',
      eyebrowSecondary: 'Flight Dispatch Curriculum',
      easaComplianceBadge: 'EASA ORO.GEN.110 Aligned',
      dgcaComplianceBadge: 'DGCA & ICAO Aligned Training',
      faaComplianceBadge: 'FAA Part 65 Aligned',
      cbtaBadge: 'Competency-Based Training',
      applyOnlineLabel: 'View Course',
      viewModulesLabel: 'View Course Modules',
      outcomesEyebrow: 'Competency Outcomes',
      outcomesTitle: 'Built for Operational Control',
      complianceEyebrow: 'Regulatory & Training Framework',
      complianceTitleEasa: 'EASA & ICAO Training Framework',
      complianceTitleDgca: 'DGCA & ICAO Training Framework',
      complianceTitleFaa: 'FAA & ICAO Training Framework',
      complianceTag1Easa: 'EASA ORO.GEN.110',
      complianceTag1Dgca: 'DGCA CAR',
      complianceTag1Faa: 'FAA 14 CFR Part 65',
      complianceTag2: 'ICAO Doc 10106',
      complianceTag3: 'CBTA Framework',
      glanceLabel: 'Program at a Glance',
      eligibilityEyebrow: 'Eligibility Profile',
      eligibilityTitle: 'Who Should Attend?',
      entryReqEyebrow: 'Admissions',
      entryReqTitle: 'Entry Requirements',
      assessmentEyebrow: 'Evaluation',
      assessmentTitle: 'Assessment',
      certEyebrow: 'On Completion',
      certTitle: 'Certification',
      datesEyebrow: 'Schedule',
      datesTitle: 'Upcoming Courses',
      faqEyebrow: 'Questions',
      faqTitle: 'Frequently Asked Questions',
      admissionsEyebrow: 'Admissions Portal',
      admissionsTitle: 'Ready to Start Your Dispatch Career?',
      admissionsDesc: 'Reserve your seat for the upcoming training or connect directly with our team.',
      admissionsApplyLabel: 'Apply Online ↗',
      admissionsWhatsappLabel: 'WhatsApp Chat',
      sidebarAdmissionsOpenBadge: 'Admissions Open',
      sidebarOverviewLabel: 'Program Overview',
      sidebarTuitionLabel: 'Training Fee',
      sidebarTuitionNote: '+ 18% GST / Track · Inclusive of official materials',
      sidebarEnrollLabel: 'Enroll Now - Apply Online ↗',
      sidebarWhatsappLabel: 'Inquire on WhatsApp',
      sidebarDurationLabel: 'Duration',
      sidebarIntakeLabel: 'Next Course',
      sidebarLocationLabel: 'Training Location',
      sidebarDeliveryLabel: 'Format',
      sidebarStandardLabel: 'Standard',
      sidebarStandardValueEasa: 'EASA-Compliant',
      sidebarStandardValueDgca: 'DGCA / EASA Aligned',
      sidebarStandardValueFaa: 'FAA Part 65',
      sidebarCertificateLabel: 'Certificate',
      sidebarCertificateValue: 'IFOA Certificate of Completion',
      sidebarSupportTitle: 'Admissions Support',
      sidebarSupportDesc: 'Questions about eligibility or group bookings?'
    },
    curriculum: {
      eyebrow: 'Curriculum Framework',
      title: 'What the Flight Dispatch Program Covers',
      subtitle: 'Structured around the core competencies required for international airline dispatch.',
      phases: [
        {
          num: '01',
          label: 'PHASE 01',
          title: 'The Operating Environment',
          description: 'Establish foundational regulatory frameworks, airspace structure, and air traffic communication systems.',
          topics: [
            'Air Law & Civil Regulations',
            'ICAO / EASA Alignment',
            'Air Traffic Management (ATM)',
            'Aeronautical Communications'
          ]
        },
        {
          num: '02',
          label: 'PHASE 02',
          title: 'Know the Aircraft',
          description: 'Understand modern commercial aircraft systems, performance envelopes, limitations, and flight mechanics.',
          topics: [
            'Aircraft Systems & Avionics',
            'Flight Instrumentation',
            'Principles of Flight & Aerodynamics',
            'Aircraft Performance & Limits'
          ]
        },
        {
          num: '03',
          label: 'PHASE 03',
          title: 'Plan the Flight',
          description: 'Master meteorological analysis, route construction, fuel calculations, and operational flight dispatch releases.',
          topics: [
            'Aviation Navigation & Routes',
            'Synoptic Aeronautical Meteorology',
            'Mass & Balance Calculations',
            'Operational Flight Planning (OFP)'
          ]
        },
        {
          num: '04',
          label: 'PHASE 04',
          title: 'Control the Operation',
          description: 'Execute live flight following, manage real-time deviations, and coordinate airline operational control.',
          topics: [
            'Live OCC Flight Monitoring',
            'Standard Operational Procedures',
            'Crew & Dispatch Human Factors',
            'OCC Operational Coordination'
          ]
        },
        {
          num: '05',
          label: 'PHASE 05',
          title: 'Make the Decision',
          description: 'Apply tactical problem-solving during in-flight emergencies, weather diversions, and high-tempo simulator scenarios.',
          topics: [
            'Tactical Situational Awareness',
            'Risk Assessment & Mitigation',
            'Collaborative Decision Making (CDM)',
            'Complex Scenario Simulator Drills'
          ]
        }
      ]
    }
  }
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

// Deep-merge stored overrides on top of defaults. Arrays are replaced wholesale
// (the admin fully owns list contents once saved).
function mergeContent(base, override) {
  if (!isPlainObject(override)) return override === undefined ? base : override
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const key of Object.keys(override)) {
    const b = isPlainObject(out) ? out[key] : undefined
    const o = override[key]
    out[key] = isPlainObject(b) && isPlainObject(o) ? mergeContent(b, o) : o
  }
  return out
}

function isValidPage(page) {
  return PAGE_KEYS.includes(page)
}

// Strip an admin-submitted content blob down to exactly the shape SCHEMAS[page]
// declares (known groups -> known fields / lists / stringLists only). This is
// the server-side enforcement that the admin editor can change copy but not
// inject arbitrary keys the frontend might later read as layout/structure.
function sanitizeField(type, value) {
  if (type === 'stringList') {
    return Array.isArray(value) ? value.filter((s) => typeof s === 'string') : []
  }
  if (type === 'choiceList') {
    // Array of { label, courseSlug } - e.g. the Flight Dispatch discipline
    // card's EASA / FAA Part 65 dual links.
    if (!Array.isArray(value)) return []
    return value
      .filter((v) => isPlainObject(v) && typeof v.label === 'string' && typeof v.courseSlug === 'string')
      .map((v) => ({ label: v.label, courseSlug: v.courseSlug }))
  }
  if (type === 'image') {
    if (!value || typeof value !== 'object') return null
    const { url, key, alt } = value
    return {
      url: typeof url === 'string' ? url : null,
      key: typeof key === 'string' ? key : null,
      alt: typeof alt === 'string' ? alt : ''
    }
  }
  // text / textarea
  return typeof value === 'string' ? value : value == null ? value : String(value)
}

function sanitizeListItem(list, item) {
  if (!isPlainObject(item)) return null
  const out = {}
  for (const field of list.fields || []) {
    if (item[field.k] !== undefined) out[field.k] = sanitizeField(field.type, item[field.k])
  }
  for (const sl of list.stringLists || []) {
    if (item[sl.k] !== undefined) out[sl.k] = sanitizeField('stringList', item[sl.k])
  }
  return out
}

function sanitizeGroup(group, value) {
  if (!isPlainObject(value)) return {}
  const out = {}
  for (const field of group.fields || []) {
    if (value[field.k] !== undefined) out[field.k] = sanitizeField(field.type, value[field.k])
  }
  for (const list of group.lists || []) {
    if (Array.isArray(value[list.k])) {
      out[list.k] = value[list.k].map((item) => sanitizeListItem(list, item)).filter(Boolean)
    }
  }
  return out
}

function sanitizeContent(page, data) {
  const schema = SCHEMAS[page]
  if (!schema || !isPlainObject(data)) return {}
  const out = {}
  for (const group of schema.groups || []) {
    if (data[group.k] !== undefined) out[group.k] = sanitizeGroup(group, data[group.k])
  }
  return out
}

module.exports = {
  PAGE_KEYS,
  PAGE_LABELS,
  SCHEMAS,
  DEFAULTS,
  mergeContent,
  sanitizeContent,
  isValidPage
}
