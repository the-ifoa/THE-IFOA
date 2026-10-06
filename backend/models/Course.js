const mongoose = require('mongoose')
const slugify = require('slugify')

// An image stored in Cloudflare R2. `key` is kept so the object can be deleted
// when the course is updated or removed.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, default: '' },
    alt: { type: String, default: '' }
  },
  { _id: false }
)

// Small logo + caption block, used by "Course Delivery" (School / Format).
const deliveryItemSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: imageSchema, default: null }
  },
  { _id: false }
)

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    refCode: { type: String, default: '', trim: true }, // e.g. IPIN2501
    branch: { type: String, default: 'IFOA', trim: true }, // IFOA / IFOA India / IFOA USA ...
    category: {
      type: String,
      enum: ['dispatch', 'ground', 'dangerous-goods', 'train-the-trainer', 'crew', 'security', 'human-factors', 'consulting', 'other'],
      default: 'dispatch',
      index: true
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },

    summary: { type: String, default: '' },
    heroImage: { type: imageSchema, default: null },
    // Optional trust line under the hero (e.g. "500+ dispatchers trained
    // across 70+ operators"). Blank hides the row entirely.
    trustStat: { type: String, default: '' },
    // Optional highlighted callout box under the hero summary, for a single
    // sharp clarifying point (e.g. "This is not CRM for flying crew - it's
    // Human Factors built for the people who run the operation from the
    // ground"). Blank hides the box entirely.
    heroNote: { type: String, default: '' },
    // B2B/corporate courses (e.g. Crew Control) swap the sidebar and hero CTA
    // from "Enroll Now" / price to "Request a Corporate Quote" / rate card.
    isCorporate: { type: Boolean, default: false },
    // Small caps label shown above the H1 (e.g. "IFOA Corporate Training").
    eyebrow: { type: String, default: '' },
    // Flexible hero badge pills - replaces the fixed EASA/ICAO/CBTA badges
    // entirely when set, for courses whose regulatory framing doesn't fit
    // that fixed set (e.g. a corporate FTL course).
    badges: { type: [String], default: [] },
    // Overrides the isCorporate primary CTA label everywhere it appears
    // (hero + sidebar), e.g. "Request Pricing & Dates" instead of the
    // default "Request a Corporate Quote".
    ctaLabel: { type: String, default: '' },
    // Overrides the isCorporate sidebar rate-card text (eyebrow/value/note/
    // secondary button/trust line) for courses whose "no fixed price" story
    // differs from the default corporate-quote framing.
    rateCard: {
      eyebrow: { type: String, default: '' },
      value: { type: String, default: '' },
      note: { type: String, default: '' },
      secondaryCtaLabel: { type: String, default: '' },
      trustBadge: { type: String, default: '' }
    },

    // ---- Catalog card display ----
    authority: { type: String, default: '' }, // "EASA / FAA Part 65 Standards"
    format: { type: String, default: '' }, // "Hybrid Online + In-Person Simulator Sessions"
    careerPath: { type: String, default: '' }, // target roles on completion
    intakeLabel: { type: String, default: '' }, // "Rolling Monthly Admissions" when there is no fixed date

    // Per-course overrides for the Events & Courses catalog card. Any empty
    // field falls back to a sensible default at render time.
    card: {
      image: { type: imageSchema, default: null }, // card banner; falls back to heroImage
      badge: { type: String, default: '' }, // top-right pill; falls back to `authority`
      rating: { type: Number, default: null }, // e.g. 5
      reviewsLabel: { type: String, default: '' }, // e.g. "480+ Reviews"
      durationLabel: { type: String, default: '' }, // bottom pill; falls back to `duration`
      blurb: { type: String, default: '' } // card summary; falls back to `summary`
    },

    // ---- Fact cards (Duration / Start / Location / Price) ----
    schedule: {
      mode: { type: String, enum: ['Onsite', 'Online', 'Hybrid'], default: 'Onsite' },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      timeText: { type: String, default: '' }, // "MO - FRI 0900AM - 0500PM IST"
      timezone: { type: String, default: '' }
    },
    // Price overrides by training location (matched against the enrollment
    // form's "Where do you want to take the training?" answer).
    locationPrices: {
      type: [
        new mongoose.Schema(
          {
            location: { type: String, required: true },
            amount: { type: Number, required: true },
            currency: { type: String, default: 'EUR' },
            duration: { type: String, default: '' }, // e.g. '4 Weeks' when it differs by location
            note: { type: String, default: '' }
          },
          { _id: false }
        )
      ],
      default: []
    },
    duration: { type: String, default: '' }, // "4 Weeks"
    location: { type: String, default: '' }, // "New Delhi"
    price: {
      amount: { type: Number, default: null },
      currency: { type: String, default: 'EUR' },
      note: { type: String, default: '' } // "18% GST must be added to the price mentioned"
    },

    // ---- Body sections ----
    whatYouWillLearn: {
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      intro: { type: String, default: '' },
      points: { type: [String], default: [] }
    },
    // Optional 4-step flow shown under the outcomes grid (e.g. "Identify the
    // operation → Apply the correct rule → Check limits → Consider risk").
    processSteps: { type: [String], default: [] },
    delivery: {
      intro: { type: String, default: '' },
      items: { type: [deliveryItemSchema], default: [] }
    },
    trainingStandards: {
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      intro: { type: String, default: '' },
      logos: { type: [imageSchema], default: [] },
      // Flexible regulatory-reference grid (e.g. "ORO.FTL" / "CS FTL.1").
      // Falls back to the fixed EASA/DGCA/FAA + ICAO tiles when empty.
      cards: {
        type: [
          new mongoose.Schema({ code: { type: String, required: true }, title: { type: String, default: '' } }, { _id: false })
        ],
        default: []
      }
    },
    // Curriculum shown on the page. Falls back to the shared 5-phase default
    // (backend/utils/pageContent.js DEFAULTS.courseDetail.curriculum) when
    // not set - only courses needing a genuinely different structure (e.g.
    // FAA's 8 Appendix A areas) need to set this.
    curriculum: {
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      layout: { type: String, enum: ['carousel', 'accordion'], default: 'carousel' },
      phases: {
        type: [
          new mongoose.Schema(
            {
              num: { type: String, default: '' },
              label: { type: String, default: '' },
              title: { type: String, required: true },
              // Small caption under the title in accordion layout, e.g.
              // "Practical Assessment" - distinct from `description`, which
              // is a full paragraph shown when the accordion item is open.
              focus: { type: String, default: '' },
              description: { type: String, default: '' },
              topics: { type: [String], default: [] },
              // When set and dgrExplorer is present, this phase's description
              // is swapped for dgrExplorer.segments[active].acceptance/loading
              // as the visitor changes the operation segment below the hero.
              adaptive: { type: String, enum: ['', 'acceptance', 'loading'], default: '' }
            },
            { _id: false }
          )
        ],
        default: []
      }
    },
    // Role + operation segment explorer, shown above the curriculum on courses
    // where the same material genuinely differs by who you are and what you
    // fly (currently: Dangerous Goods - carry vs no-carry changes which
    // procedures apply at all, not just the depth of coverage). Empty on
    // every other course, which skips the section entirely.
    dgrExplorer: {
      roles: {
        type: [
          new mongoose.Schema(
            {
              code: { type: String, default: '' },
              title: { type: String, required: true },
              scenarios: { type: [String], default: [] }
            },
            { _id: false }
          )
        ],
        default: []
      },
      segments: {
        type: [
          new mongoose.Schema(
            {
              id: { type: String, required: true },
              title: { type: String, required: true },
              descriptor: { type: String, default: '' },
              acceptance: { type: String, default: '' },
              loading: { type: String, default: '' }
            },
            { _id: false }
          )
        ],
        default: []
      }
    },
    whoShouldAttend: {
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      intro: { type: String, default: '' },
      points: { type: [String], default: [] },
      outro: { type: String, default: '' }
    },
    // Distinct from whoShouldAttend: audience profile vs. actual admission
    // prerequisites (language, age, equipment, prior experience, etc).
    entryRequirements: {
      intro: { type: String, default: '' },
      points: { type: [String], default: [] }
    },
    courseContent: {
      intro: { type: String, default: '' },
      modules: { type: [String], default: [] },
      note: { type: String, default: '' }
    },
    certification: {
      text: { type: String, default: '' },
      points: { type: [String], default: [] }
    },
    // Third-party exam/examiner fees not included in tuition (e.g. FAA ADX
    // knowledge test, practical test) - shown separately from price.amount.
    additionalCosts: {
      intro: { type: String, default: '' },
      items: {
        type: [
          new mongoose.Schema({ label: { type: String, required: true }, amount: { type: String, required: true } }, { _id: false })
        ],
        default: []
      },
      note: { type: String, default: '' }
    },
    trainingPhilosophy: {
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      intro: { type: String, default: '' },
      cards: {
        type: [
          new mongoose.Schema({ title: { type: String, required: true }, desc: { type: String, default: '' } }, { _id: false })
        ],
        default: []
      }
    },

    // Replaces the fixed Duration/Intake/Location/Delivery/Standard/Certificate
    // sidebar rows entirely when set - for courses whose facts don't fit that
    // shape (e.g. corporate courses needing "Group Size", "On-site Location").
    sidebarSpecs: {
      type: [
        new mongoose.Schema({ label: { type: String, required: true }, value: { type: String, required: true } }, { _id: false })
      ],
      default: []
    },
    // Overrides the shared "Ready to Start Your Dispatch Career?" bottom CTA
    // banner text/label for this course specifically.
    bottomBanner: {
      eyebrow: { type: String, default: '' },
      title: { type: String, default: '' },
      desc: { type: String, default: '' },
      ctaLabel: { type: String, default: '' }
    },

    registrationOpen: { type: Boolean, default: true },
    seats: { type: Number, default: null },

    // Scheduled intakes offered for this course. An `intake` field in the
    // enrollment form lists these (active ones) as its options.
    intakes: {
      type: [
        new mongoose.Schema(
          {
            label: { type: String, required: true, trim: true },
            startDate: { type: Date, default: null },
            isActive: { type: Boolean, default: true },
            // Offered only when the applicant picks one of these training locations
            // (matched by name, e.g. "India"). Empty = offered everywhere.
            locations: { type: [String], default: [] }
          },
          { _id: false }
        )
      ],
      default: []
    },

    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' }
    },

    // Approved page copy as ordered content blocks (hero + body). When set,
    // the course page renders these instead of its fixed section template -
    // see frontend/src/components/course/CourseOverview.jsx for block types
    // and backend/scripts/courseOverviews.js for the shipped content.
    overview: { type: mongoose.Schema.Types.Mixed, default: null },

    // Per-course overrides for the shared "courseDetail"/"courseEnrollment"
    // chrome templates (backend/utils/pageContent.js SCHEMAS/DEFAULTS). Empty
    // by default, meaning the course shows the shipped defaults untouched;
    // an admin can customize either independently per course.
    pageContent: {
      courseDetail: { type: mongoose.Schema.Types.Mixed, default: {} },
      courseEnrollment: { type: mongoose.Schema.Types.Mixed, default: {} }
    }
  },
  { timestamps: true }
)

courseSchema.index({ title: 'text', summary: 'text' })

// Slug from title, kept unique by appending a counter.
// Mongoose 9 does not pass `next` to async hooks - resolve/throw instead.
courseSchema.pre('validate', async function generateSlug() {
  // Existing course, slug already set, and this save didn't touch the slug
  // field itself - keep it as-is even if the title changed. Auto-regenerating
  // a live course's slug on every title edit would silently break bookmarks,
  // inbound links, and search rankings.
  if (!this.isNew && this.slug && !this.isModified('slug')) return
  if (this.slug && this.isModified('slug')) {
    this.slug = slugify(this.slug, { lower: true, strict: true })
    return
  }

  const base = slugify(this.title || 'course', { lower: true, strict: true })
  let candidate = base
  let n = 1
  // eslint-disable-next-line no-await-in-loop
  while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
    n += 1
    candidate = `${base}-${n}`
  }
  this.slug = candidate
})

// Every R2 key referenced anywhere on the document, so the controller can
// clean up objects that are no longer used.
courseSchema.methods.imageKeys = function imageKeys() {
  const keys = []
  if (this.heroImage?.key) keys.push(this.heroImage.key)
  if (this.card?.image?.key) keys.push(this.card.image.key)
  for (const item of this.delivery?.items || []) {
    if (item.image?.key) keys.push(item.image.key)
  }
  for (const logo of this.trainingStandards?.logos || []) {
    if (logo.key) keys.push(logo.key)
  }
  return keys
}

module.exports = mongoose.model('Course', courseSchema)
