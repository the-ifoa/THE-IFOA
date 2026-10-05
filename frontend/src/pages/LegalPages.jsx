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
        description="How International Flight Operations Academy GmbH collects, processes and protects your personal data under the GDPR."
      />
      <p>
        This document aims to explain how Flight Operations Academy GmbH (hereafter also referred to as &quot;we&quot; or
        &quot;us&quot;) collects, processes, and protects personal data that you provide when communicating with us through
        any media, including but not limited to Flight Operations Academy GmbH&apos;s online the service request form, chat,
        phone, emails, and texts.
      </p>
      <p>
        This information must be provided by the General Data Protection Regulation (article 13; Regulation (EU) 2016/679
        of the European Parliament and the Council of 27 April 2016).
      </p>
      <p>Please note that Flight Operations Academy GmbH does not carry out any automated decisions-making.</p>

      <H2>1. Identity and contact details of the controller</H2>
      <p>
        The data controller is International Flight Operations Academy GmbH, with a registered office at Oberdorf 26, 4314
        Zeiningen, Switzerland.
      </p>
      <p>
        For any data protection concerns, don&apos;t hesitate to contact Vincent Incammicia at the address{' '}
        <a href="mailto:vincent@theifoa.com" className="underline underline-offset-2">
          vincent@theifoa.com
        </a>{' '}
        or call +41 78 227 3103
      </p>

      <H2>2. Purposes and legal basis for the processing</H2>
      <p>International Flight Operations Academy GmbH collects personal data for the following purposes:</p>
      <H3>a. To provide our services to you.</H3>
      <p>
        This is the main reason why we need to collect personal data. We need information about you to answer service
        requests (made with our online form, by phone, or WhatsApp), do service proposals, draft and conclude service level
        agreements, send invoices, and organize and follow up services.
      </p>
      <p>
        In this regard, the collection of personal data is a contractual requirement and not a statutory one. It is a
        condition to enter any contract with Flight Operations Academy GmbH. If you fail to provide the required data, it
        can be impossible to agree, and International Flight Operations Academy GmbH will be unable to provide the requested
        services.
      </p>
      <p>
        For this purpose, the legitimate ground for personal data collection is the necessity to process personal data to
        enter into a contract with us.
      </p>
      <H3>b. To improve your customer experience</H3>
      <p>
        We process your data to improve our services. This includes tailoring our services to your needs and preferences,
        facilitating the use of our website by analyzing the browsing history of its users, and sending promotional content
        by post, email, WhatsApp, or online advertisements.
      </p>
      <p>
        Suppose you have requested or used our services and provided personal data to International Flight Operations
        Academy GmbH in this context.
      </p>
      <p>We may use your contact details to send you marketing emails about similar services unless you have opted out.</p>
      <p>
        You can opt out anytime by clicking &quot;unsubscribe&quot; in promotional emails or contacting us at the address
        above.
      </p>
      <p>
        For this purpose, the legitimate ground for personal data collection is International Flight Operations Academy
        GmbH&apos;s legitimate interest in offering better services.
      </p>
      <H3>c. To comply with the law</H3>
      <p>
        In some cases, we are legally required to collect some personal data. This is the case when banks conduct
        anti-fraud checks or in the event of a formal request by a government entity.
      </p>
      <p>For this purpose, the legal ground for personal data collection is compliance with a legal obligation.</p>

      <H2>3. Type of information collected</H2>
      <p>Collected personal data includes:</p>
      <List
        items={[
          'Contact details, such as name and surname, phone number, email address, and physical address;',
          'Personal details, such as family members, personal preferences, and pets;',
          'Travel information, such as passport details, aircraft, departure location, destination, and time of your flights;',
          'Bank details when a credit card is used to book or pay for our services;',
          "Usage Data includes information history of your use of Flight Operations Academy GmbH's services and website."
        ]}
      />

      <H2>4. Recipients of the personal data</H2>
      <p>The employees of International Flight Operations Academy GmbH process collected data.</p>
      <p>The number of employees accessing your data is limited to those needing assistance for the intended activity.</p>
      <p>In addition, under the circumstances listed below, we will share your data with the following people:</p>
      <List
        items={[
          'When a service agreement is concluded with you: People whose intervention is mandatory to perform the contract (i.e., operators, terminal airport staff…);',
          'When we need to store your data: Cloud storage providers;',
          'When we communicate by email with you: Email services providers;',
          "When you use our website: Analytic tools and the web site's IT developers;",
          'Upon payment, when we are asked to provide information against fraud: Banks;',
          'When you book or pay with a credit card: E-payment interface provider and payment service providers;',
          'When you use our chat: Chat service provider.'
        ]}
      />

      <H2>5. Personal data transfer to a third country</H2>
      <p>
        Depending on the service you ask for, your data may be transferred to a country outside of the EU (a third
        country).
      </p>
      <p>
        This can be the case if you wish to travel to or from such a third country, if you stay in such a third country
        when data is transferred to or from International Flight Operations Academy GmbH or if the provider or partners
        chosen is based in a third country.
      </p>
      <p>
        In all of the above situations, the transfer is based on the need to process personal data to enter into a
        contract with you.
      </p>

      <H2>6. Storage period of the personal data</H2>
      <p>
        Personal data are stored as long as necessary to fulfill the purposes set out here above. This means that data will
        generally be stored for the time needed for the performance of the contract and possible future agreements with
        Flight Operations Academy GmbH. Some personal data will be stored longer to comply with legal obligations, such as
        tax purposes.
      </p>

      <H2>7. Confidentiality and safety measures</H2>
      <p>
        The information is securely stored systematically, ensuring that nobody outside International Flight Operations
        Academy GmbH can access it.
      </p>
      <p>Each new employee receives training in data protection to know how to handle our customers&apos; data.</p>

      <H2>8. Your rights</H2>
      <p>Under the General Data Protection Regulation, you have the following rights:</p>
      <H3>a. Right to request access to personal data (art. 15 of the Regulation)</H3>
      <p>
        This right allows you to ask Flight Operations Academy GmbH if you want to know and see what personal data we store
        about you.
      </p>
      <H3>b. Right to request rectification of personal data (art. 16 of the Regulation)</H3>
      <p>
        If some personal data we hold about you needs to be corrected, you can ask Flight Operations Academy GmbH to rectify
        it.
      </p>
      <H3>
        c. Right to request the erasure of personal data, also referred to as the &quot;right to be forgotten&quot; (art. 17
        of the Regulation)
      </H3>
      <p>
        This right allows you to ask us to suppress personal data under specific circumstances; for example, the personal
        data are no longer necessary concerning the purposes for which they were collected, when processing is based on
        consent, and you withdraw your consent, or when your data have been unlawfully processed.
      </p>
      <H3>d. Right to restrict the processing of personal data (art. 18 of the Regulation)</H3>
      <p>
        You can ask Flight Operations Academy GmbH to restrict the processing of your personal under specific
        circumstances. It is the case when you exercise the right of rectification – you can ask for a restriction of the
        processing while we verify the accuracy of the concerned data. You can also exercise this right when the processing
        is unlawful instead of asking for erasure (see right no. 3 above). Restriction of processing can as well be
        requested when we no longer need the personal data for processing, but you require them for legal claims.
      </p>
      <H3>e. Right to object to the processing of personal data (art. 21 of the Regulation)</H3>
      <p>
        When your data is used to improve our services or direct marketing, you can object to the processing. Concerning
        promotional emails, you can opt out by clicking on &quot;unsubscribe&quot; in the emails or by contacting us at the
        address displayed here under.
      </p>
      <H3>f. Right to data portability (art. 20 of the Regulation)</H3>
      <p>
        This right enables you to receive the personal data concerning yourself, which you have provided to Flight
        Operations Academy GmbH, in an easily readable format and transmit those data to another data controller.
      </p>
      <H3>g. Right to complain with a supervisory authority.</H3>
      <p>This right enables you to address a complaint to the competent supervisory authority of the member state.</p>
      <p>
        If you want to exercise any of rights (a)-(g) listed above, or if you have any inquiry about data protection,
        please send your request to Vincent Incammicia at the following email address:{' '}
        <a href="mailto:vincent@theifoa.com" className="underline underline-offset-2">
          vincent@theifoa.com
        </a>
      </p>
      <p className="pt-2 text-slate-500">Zeiningen, 28 February 2023</p>
    </LegalLayout>
  )
}
