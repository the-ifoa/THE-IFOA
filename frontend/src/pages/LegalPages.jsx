import { Seo } from '@/components/common/Seo'

// Legal pages carried over word for word from the previous site
// (theifoa.com/impressum and /data-protection-policy, 28 February 2023).

function LegalLayout({ title, children }) {
  return (
    <div className="bg-white pt-32 pb-20">
      <article className="max-w-3xl mx-auto px-6 text-slate-700 text-sm sm:text-[15px] leading-relaxed space-y-5">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
        {children}
      </article>
    </div>
  )
}

const H2 = ({ children }) => <h2 className="pt-4 text-lg font-bold text-slate-950">{children}</h2>
const H3 = ({ children }) => <h3 className="pt-2 font-semibold text-slate-900">{children}</h3>
const List = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

const IMPRESSUM_ROWS = [
  ['Company', 'International Flight Operations Academy GmbH'],
  ['Address', 'Oberdorf 26, 4314 Zeiningen, Switzerland'],
  ['Phone', '+41 78 227 3103'],
  ['Email', 'info@theifoa.com'],
  ['Management', 'Vincent Incammicia & Kenneth Kronborg'],
  ['Commercial Register Number', 'CH-400.4.449.288-9'],
  ['VAT number', 'IDE: CHE-266.131.214'],
  ['Office', 'Zeiningen AG']
]

export function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <Seo
        path="/impressum"
        title="Impressum | IFOA"
        description="Legal notice for International Flight Operations Academy GmbH, Oberdorf 26, 4314 Zeiningen, Switzerland."
      />
      <dl className="divide-y divide-slate-100 border-y border-slate-100">
        {IMPRESSUM_ROWS.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3">
            <dt className="text-slate-500">{label}</dt>
            <dd className="sm:col-span-2 font-semibold text-slate-900">
              {label === 'Email' ? (
                <a href={`mailto:${value}`} className="underline underline-offset-2 hover:text-[#16a952]">
                  {value}
                </a>
              ) : label === 'Phone' ? (
                <a href="tel:+41782273103" className="hover:text-[#16a952]">
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </LegalLayout>
  )
}

export function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Data protection policy">
      <Seo
        path="/privacy-policy"
        title="Data Protection Policy | IFOA"
        description="How International Flight Operations Academy GmbH collects, uses and protects the personal data of course applicants, students and website visitors, under the Swiss FADP and the GDPR."
      />
      <p>
        This policy explains how International Flight Operations Academy GmbH (&quot;IFOA&quot;, &quot;we&quot; or
        &quot;us&quot;) collects, uses and protects personal data when you visit our website, use our chat assistant,
        contact us, apply for a course or take part in our training and consulting services.
      </p>
      <p>
        It follows the Swiss Federal Act on Data Protection (FADP, in force since 1 September 2023) and, for people in the
        European Union and the European Economic Area, the General Data Protection Regulation (Regulation (EU) 2016/679,
        article 13).
      </p>
      <p>IFOA does not take decisions about you based solely on automated processing.</p>

      <H2>1. Who is responsible</H2>
      <p>
        The controller is International Flight Operations Academy GmbH, Oberdorf 26, 4314 Zeiningen, Switzerland. IFOA also
        trains through IFOA USA (Daytona Beach, Florida) and IFOA India (New Delhi); they act on our instructions and under
        this policy.
      </p>
      <p>
        For any data protection question or request, contact Vincent Incammicia at{' '}
        <a href="mailto:vincent@theifoa.com" className="underline underline-offset-2">
          vincent@theifoa.com
        </a>{' '}
        or on +41 78 227 3103.
      </p>

      <H2>2. Why we process your data, and on what basis</H2>
      <H3>a. To handle your inquiry or application, and to provide training and consulting</H3>
      <p>
        We use your data to answer your messages, assess your application against the entry requirements, confirm your
        seat, invoice and collect payment, run the course and exams, keep training records and issue your IFOA Certificate
        of Completion. For FAA courses, we also use it to prepare you for the FAA knowledge and practical tests.
      </p>
      <p>
        Giving us this data is needed to enter into and perform a contract with you. Without it we cannot process your
        application or deliver the course. Basis: performance of a contract (and steps taken at your request before one).
      </p>
      <H3>b. To improve our services and keep you informed</H3>
      <p>
        We analyze how our website and courses are used so we can improve them, and we may send you news about similar
        courses by email. You can opt out at any time with the &quot;unsubscribe&quot; link in our emails or by writing to
        us. Basis: our legitimate interest in better services (and your consent where the law requires it).
      </p>
      <H3>c. To meet legal duties</H3>
      <p>
        We keep some records because the law requires it, for example accounting and tax records, and we answer lawful
        requests from authorities. Basis: legal obligation.
      </p>

      <H2>3. What data we collect</H2>
      <List
        items={[
          'Contact details: name, email address, phone number, postal address and country;',
          'Application details: date of birth, nationality, education and work background, English level, the course, location and intake you choose;',
          'Identity documents: copies of your passport or government photo ID, which we ask you to send us with your signed application;',
          'Training records: attendance, assessment and exam results, and certificates issued;',
          'Payment details: invoice and bank-transfer references. We do not collect or store card numbers;',
          'Messages you send us through our contact form, email, WhatsApp, phone or chat assistant;',
          'Usage data: technical information about how you use our website, such as pages visited, device and browser.'
        ]}
      />
      <p>
        We do not ask for special categories of personal data (such as health or religion) unless you volunteer it, for
        example to request an adjustment for a course.
      </p>

      <H2>4. Who receives your data</H2>
      <p>
        Our employees process your data, and only those who need it for their task have access. We also share it, where
        needed, with:
      </p>
      <List
        items={[
          'Our training sites and partners that host or deliver your course (for example Air Alsie in Sønderborg, and IFOA USA and IFOA India), and instructors and examiners working for IFOA;',
          'FAA-designated examiners and testing centers, when you take the FAA knowledge or practical test, and only what the test requires;',
          'Banks and payment providers, to receive your payment and prevent fraud;',
          'Cloud storage, email and website hosting providers, and web analytics tools;',
          'The provider of our chat assistant, which processes the messages you type into it to generate answers. Please do not enter sensitive personal data in the chat;',
          'Authorities and advisors (lawyers, auditors, accountants), when the law requires it or to protect our rights.'
        ]}
      />
      <p>We do not sell your personal data.</p>

      <H2>5. Transfers outside Switzerland and the EEA</H2>
      <p>
        Because we train in Denmark, the United States and India, and use international providers, your data can be
        transferred to or accessed from countries outside Switzerland and the EEA, including the United States and India.
        Where such a country does not offer an adequate level of data protection recognized by Switzerland or the EU, we
        rely on safeguards such as the standard contractual clauses approved by the European Commission and recognized by
        the Swiss Federal Data Protection and Information Commissioner (FDPIC), or on the transfer being necessary to
        perform your contract.
      </p>

      <H2>6. How long we keep your data</H2>
      <p>
        We keep data only as long as needed for the purposes above. Inquiries that do not lead to a contract are deleted
        after a reasonable period. Application, payment and training records are kept for as long as needed to run the
        contract, to answer questions about your certificate, and to meet legal retention periods (for example ten years
        for accounting records under Swiss law). After that we delete or anonymize them.
      </p>

      <H2>7. Security</H2>
      <p>
        We protect your data with technical and organizational measures, including access limited to staff who need it,
        secure storage and encrypted connections to our website. Staff receive data protection training. No system is
        completely secure, so please also protect your own devices and email.
      </p>

      <H2>8. Your rights</H2>
      <p>Under the FADP and, where it applies, the GDPR, you can:</p>
      <List
        items={[
          'ask for access to the personal data we hold about you (FADP art. 25; GDPR art. 15);',
          'ask us to correct inaccurate data (FADP art. 32; GDPR art. 16);',
          'ask us to delete your data, when we no longer need it or you withdraw your consent (FADP art. 32; GDPR art. 17);',
          'ask us to restrict processing in the cases the law provides for (GDPR art. 18);',
          'object to processing based on our legitimate interest, and to direct marketing at any time (FADP art. 30; GDPR art. 21);',
          'receive the data you gave us in a common electronic format, or have it passed to another controller (FADP art. 28; GDPR art. 20);',
          'withdraw a consent you gave, at any time, without affecting what we did before.'
        ]}
      />
      <p>
        To use any of these rights, write to{' '}
        <a href="mailto:vincent@theifoa.com" className="underline underline-offset-2">
          vincent@theifoa.com
        </a>
        . We may ask you to prove your identity first, and we reply within 30 days.
      </p>
      <p>
        You can also complain to a data protection authority: in Switzerland the Federal Data Protection and Information
        Commissioner (FDPIC, www.edoeb.admin.ch), or, if you live in the EU or EEA, the authority of your country.
      </p>

      <H2>9. Changes to this policy</H2>
      <p>We may update this policy. The current version is always on this page, with the date of the last update below.</p>
      <p className="pt-2 text-slate-500">Zeiningen, last updated 6 October 2026</p>
    </LegalLayout>
  )
}
