import { Document, Page, View, Text, Image, StyleSheet, Svg, Polyline } from '@react-pdf/renderer';
import logoSrc from '../assets/shared/brand/ifoa-logo.png';
import watermarkSrc from '../assets/shared/brand/ifoa-watermark.png';
import signatureSrc from '../assets/shared/brand/ifoa-signature.png';
import { isFieldVisible, termsForLocation } from '../components/formEngine/formSchema.js';

const NAVY = '#000021';
const HEADER_BAR = '#464667';
const GREEN = '#0a9b52';
const BORDER = '#999999';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    paddingBottom: 40,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#222222',
  },
  watermark: {
    position: 'absolute',
    top: '38%',
    left: '18%',
    width: 340,
    opacity: 0.5,
  },
  mastheadTop: {
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: '#222222',
    paddingBottom: 5,
    marginBottom: 8,
  },
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 3, color: '#111111' },
  subtitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#222222', marginBottom: 5 },
  promo: { fontSize: 9.5, color: '#333333' },
  promoStrong: { fontFamily: 'Helvetica-Bold', color: NAVY },
  logo: { width: 110 },
  sectionHeaderTable: { marginBottom: 0 },
  sectionHeader: {
    backgroundColor: HEADER_BAR,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    padding: '7 10',
    textTransform: 'uppercase',
  },
  fieldsTable: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  cell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: '4 7',
  },
  cellLabel: { fontSize: 7.5, fontFamily: 'Helvetica-BoldOblique', color: '#333333', marginBottom: 1 },
  cellValue: { fontSize: 9.5, color: '#000000' },
  staticBlock: { fontSize: 8, lineHeight: 1.4, color: '#222222' },
  opRow: { flexDirection: 'row', flexWrap: 'wrap' },
  opCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: '4 6',
    fontSize: 8.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  consentRow: { padding: '5 7', fontSize: 8.8, flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  box: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: '#333333',
  },
  boxChecked: {
    borderColor: GREEN,
  },
  addressLabelCell: {
    width: 98,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: '4 6',
    justifyContent: 'center',
  },
  addressLabelText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    lineHeight: 1.3,
  },
  addressColumn: { flex: 1 },
  signatureTable: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  signatureHeaderCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: '6 8',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
  },
  signatureBodyCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: '10 12',
    alignItems: 'center',
    minHeight: 90,
  },
  signatureDate: { fontSize: 8.5, fontStyle: 'italic', color: '#333333', marginBottom: 8 },
  signatureName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#111111' },
  signatureTitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#111111', marginBottom: 4 },
  signatureImage: { width: 110, marginTop: 2 },
  signaturePlaceholder: { fontSize: 8.5, fontStyle: 'italic', color: '#666666', marginBottom: 18 },

  // Program / price block (Course Request)
  programRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  programName: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  programPrice: { fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 8 },

  // Bank details block (Payment Information)
  bankHeader: { textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 9.5, padding: '5 0' },
  bankRow: { flexDirection: 'row' },
  bankCol: { flex: 1, padding: '8 10', alignItems: 'center' },
  bankColLeft: { borderRightWidth: 0.5, borderRightColor: BORDER },
  bankName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 4 },
  bankLine: { fontSize: 9, textAlign: 'center', lineHeight: 1.4 },
  bankColLeftText: { alignItems: 'flex-start', width: '100%' },
  bankDetailsHeading: { fontSize: 9, marginBottom: 4 },
  bankBold: { fontFamily: 'Helvetica-Bold' },
  bankNote: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#c00000', marginTop: 8 },

  // Terms & Conditions block
  termsItem: { flexDirection: 'row', fontSize: 8.2, lineHeight: 1.4, marginBottom: 5 },
  termsItemNumber: { width: 14 },
  termsItemBody: { flex: 1 },
  termsSubItem: { flexDirection: 'row', fontSize: 8.2, lineHeight: 1.4, marginLeft: 14 },
  termsSubItemLetter: { width: 16 },
  termsSubItemBody: { flex: 1 },
  privacyBlock: { fontSize: 8.2, lineHeight: 1.4, marginTop: 6 },
});

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatValue = (field, value) => {
  if (field.type === 'date') return formatDate(value) || 'N/A';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
  if (value === undefined || value === null || value === '') return 'N/A';
  return String(value);
};

function Checkbox({ checked }) {
  // react-pdf's built-in Helvetica font has no glyph for a Unicode checkmark
  // (U+2713) - it silently renders blank. Draw the tick as a vector path
  // instead, so it doesn't depend on font glyph coverage at all.
  return (
    <View style={[styles.box, checked ? styles.boxChecked : null]}>
      {checked && (
        <Svg width="9" height="9" viewBox="0 0 9 9">
          <Polyline points="1.5,4.8 3.5,7 7.5,2" fill="none" stroke={GREEN} strokeWidth={1.4} />
        </Svg>
      )}
    </View>
  );
}

function FieldCell({ label, value, wide }) {
  return (
    <View style={[styles.cell, wide ? { flex: 2 } : null]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

// Sections whose street/zipCode/stateProvince/country cluster gets the
// original paper form's "Physical Address" spanning label - matches the
// source PDF exactly for Student/Company Information, which is the only
// place that label appears (Billing Address has no separate label since the
// whole section already is the address).
const ADDRESS_GROUP_SECTIONS = ['student-info', 'company-info'];
const ADDRESS_FIELD_IDS = ['street', 'zipCode', 'stateProvince', 'country'];

function AddressGroupRow({ fields, sectionAnswers }) {
  const val = (field) => formatValue(field, sectionAnswers?.[field.id]);
  return (
    <View style={styles.row} wrap={false}>
      <View style={styles.addressLabelCell}>
        <Text style={styles.addressLabelText}>Physical Address</Text>
      </View>
      <View style={styles.addressColumn}>
        <View style={styles.row}>
          <FieldCell label={fields.street.label} value={val(fields.street)} />
          <FieldCell label={fields.zipCode.label} value={val(fields.zipCode)} />
        </View>
        <View style={styles.row}>
          <FieldCell label={fields.stateProvince.label} value={val(fields.stateProvince)} />
          <FieldCell label={fields.country.label} value={val(fields.country)} />
        </View>
      </View>
    </View>
  );
}

// --- Structured renderers for the three "special" static-text blocks that
// have real typographic structure in the original paper form (bold labels,
// centered price, two-column bank layout, indented sub-list). These parse
// the schema's plain-text content rather than needing a separate hardcoded
// copy, so admin edits to the wording (via Form Builder) still show up - // only the original's layout/emphasis is reproduced structurally.

function ProgramInfoBlock({ content }) {
  const match = content.match(/^(.*?),\s*([\d.,]+\s*[A-Z]{2,4})\s*$/);
  const name = match ? match[1].trim() : content;
  const price = match ? match[2].trim() : null;
  return (
    <>
      <View style={styles.programRow}>
        <Checkbox checked />
        <Text style={styles.programName}>{name}</Text>
      </View>
      {price && <Text style={styles.programPrice}>{price}</Text>}
    </>
  );
}

function parseBankDetails(content) {
  const lines = content.split('\n').map((l) => l.trim());
  const nonEmpty = (start, end) => lines.slice(start, end).filter(Boolean);
  const bankIdx = lines.findIndex((l) => l.toLowerCase() === 'bank details:');
  const ibanIdx = lines.findIndex((l) => l.toUpperCase().startsWith('IBAN'));
  const bicIdx = lines.findIndex((l) => l.toUpperCase().startsWith('BIC'));
  const noteIdx = lines.findIndex((l) => l.toUpperCase().startsWith('IMPORTANT'));
  if (bankIdx === -1 || ibanIdx === -1) return null;

  return {
    beneficiaryLines: nonEmpty(0, bankIdx),
    bankLines: nonEmpty(bankIdx + 1, ibanIdx),
    iban: lines[ibanIdx],
    bic: bicIdx !== -1 ? lines[bicIdx] : '',
    note: noteIdx !== -1 ? lines[noteIdx] : '',
  };
}

function BankDetailsBlock({ content }) {
  const parsed = parseBankDetails(content);
  if (!parsed) return <Text style={styles.staticBlock}>{content}</Text>;
  const { beneficiaryLines, bankLines, iban, bic, note } = parsed;

  return (
    <View>
      <Text style={styles.bankHeader}>Bank Transfer</Text>
      <View style={styles.bankRow}>
        <View style={[styles.bankCol, styles.bankColLeft]}>
          <Text style={styles.bankName}>{beneficiaryLines[0]}</Text>
          {beneficiaryLines.slice(1).map((line, i) => (
            <Text key={i} style={styles.bankLine}>{line}</Text>
          ))}
        </View>
        <View style={[styles.bankCol, styles.bankColLeftText]}>
          <Text style={styles.bankDetailsHeading}>Bank Details:</Text>
          {bankLines.map((line, i) => (
            <Text key={i} style={[styles.bankLine, { textAlign: 'left' }]}>{line}</Text>
          ))}
          <Text style={[styles.bankLine, styles.bankBold, { textAlign: 'left', marginTop: 4 }]}>{iban}</Text>
          {bic && <Text style={[styles.bankLine, styles.bankBold, { textAlign: 'left' }]}>{bic}</Text>}
        </View>
      </View>
      {note && <Text style={styles.bankNote}>{note}</Text>}
    </View>
  );
}

function parseTermsContent(content) {
  const lines = content.split('\n');
  const items = [];
  let privacy = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const privacyMatch = line.match(/^Privacy notice:\s*(.*)$/i);
    if (privacyMatch) {
      privacy = privacyMatch[1];
      continue;
    }

    const itemMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (!itemMatch) continue;
    const [, number, text] = itemMatch;

    // Detect a "Header: a) ... b) ... c) ..." shaped item and split it into
    // a bold lead-in plus an indented sub-list, matching the source form.
    const subMatch = text.match(/^(.*?):\s*(a\).+)$/s);
    if (subMatch) {
      const subItems = subMatch[2]
        .split(/(?=[a-z]\))/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const m = s.match(/^([a-z])\)\s*(.*)$/s);
          return m ? { letter: m[1], text: m[2] } : { letter: '', text: s };
        });
      items.push({ number, header: `${subMatch[1]}:`, subItems });
    } else {
      items.push({ number, text });
    }
  }

  return { items, privacy };
}

function TermsBlock({ content }) {
  const { items, privacy } = parseTermsContent(content);
  if (items.length === 0) return <Text style={styles.staticBlock}>{content}</Text>;

  return (
    <View>
      {items.map((item) => (
        <View key={item.number}>
          <View style={styles.termsItem}>
            <Text style={styles.termsItemNumber}>{item.number}.</Text>
            <Text style={styles.termsItemBody}>
              {item.header ? <Text style={styles.bankBold}>{item.header}</Text> : item.text}
            </Text>
          </View>
          {item.subItems &&
            item.subItems.map((sub) => (
              <View key={sub.letter} style={styles.termsSubItem}>
                <Text style={styles.termsSubItemLetter}>{sub.letter})</Text>
                <Text style={styles.termsSubItemBody}>{sub.text}</Text>
              </View>
            ))}
        </View>
      ))}
      {privacy && (
        <Text style={styles.privacyBlock}>
          <Text style={styles.bankBold}>Privacy notice: </Text>
          {privacy}
        </Text>
      )}
    </View>
  );
}

function renderSectionBody(section, sectionAnswers, location = '') {
  const fields = [...section.fields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((field) => isFieldVisible(field, sectionAnswers));
  const rows = [];
  let pending = null;

  const flushPending = () => {
    if (pending) {
      rows.push(
        <View style={styles.row} wrap={false} key={`row-${rows.length}`}>
          <FieldCell label={pending.label} value={pending.value} wide />
        </View>
      );
      pending = null;
    }
  };

  const hasAddressGroup =
    ADDRESS_GROUP_SECTIONS.includes(section.id) && ADDRESS_FIELD_IDS.every((id) => fields.some((f) => f.id === id));
  const consumedIds = new Set();

  fields.forEach((field, idx) => {
    if (consumedIds.has(field.id)) return;

    if (hasAddressGroup && field.id === 'street') {
      flushPending();
      const grouped = Object.fromEntries(ADDRESS_FIELD_IDS.map((id) => [id, fields.find((f) => f.id === id)]));
      ADDRESS_FIELD_IDS.forEach((id) => consumedIds.add(id));
      rows.push(<AddressGroupRow key={`address-${idx}`} fields={grouped} sectionAnswers={sectionAnswers} />);
      return;
    }

    const value = sectionAnswers?.[field.id];

    if (field.type === 'staticText') {
      flushPending();
      const isStructured = field.id === 'programInfo' || field.id === 'bankDetails' || field.id === 'termsText';
      rows.push(
        <View style={styles.row} wrap={false} key={`static-${idx}`}>
          <View style={[styles.cell, { flex: 2 }]}>
            {field.label && !isStructured ? <Text style={styles.cellLabel}>{field.label}</Text> : null}
            {field.id === 'programInfo' ? (
              <ProgramInfoBlock content={field.content} />
            ) : field.id === 'bankDetails' ? (
              <BankDetailsBlock content={field.content} />
            ) : field.id === 'termsText' ? (
              <TermsBlock content={termsForLocation(field.content, location)} />
            ) : (
              <Text style={styles.staticBlock}>{field.content}</Text>
            )}
          </View>
        </View>
      );
      return;
    }

    if (field.type === 'checkbox') {
      flushPending();
      rows.push(
        <View style={styles.row} wrap={false} key={`checkbox-${idx}`}>
          <View style={[styles.cell, { flex: 2 }]}>
            <View style={styles.consentRow}>
              <Checkbox checked={value === true} />
              <Text style={{ flex: 1 }}>{field.label}</Text>
            </View>
          </View>
        </View>
      );
      return;
    }

    if (field.type === 'checkboxGroup') {
      flushPending();
      const options = field.options || [];
      rows.push(
        <View style={styles.opRow} wrap={false} key={`group-${idx}`}>
          {options.map((opt) => (
            <View style={styles.opCell} key={opt}>
              <Checkbox checked={Array.isArray(value) && value.includes(opt)} />
              <Text>{opt}</Text>
            </View>
          ))}
        </View>
      );
      return;
    }

    // plain value field - pair two per row
    const formatted = formatValue(field, value);
    if (pending) {
      rows.push(
        <View style={styles.row} wrap={false} key={`row-${rows.length}`}>
          <FieldCell label={pending.label} value={pending.value} />
          <FieldCell label={field.label} value={formatted} />
        </View>
      );
      pending = null;
    } else {
      pending = { label: field.label, value: formatted };
    }
  });

  flushPending();
  return rows;
}

export function EnrollmentPdfDocument({ submission }) {
  const { formSchemaSnapshot, answers, intake, submittedAt } = submission;
  const sections = [...(formSchemaSnapshot || [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((section) => !(section.fields.length === 1 && section.fields[0].type === 'intake'));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={watermarkSrc} style={styles.watermark} fixed />

        <Text style={styles.mastheadTop}>INTERNATIONAL FLIGHT OPERATIONS ACADEMY</Text>

        <View style={styles.masthead}>
          <View>
            <Text style={styles.title}>ENROLLMENT FORM</Text>
            <Text style={styles.subtitle}>{submission.courseTitle || 'IFOA Training Program'}</Text>
            <Text style={styles.promo}>
              Intake: <Text style={styles.promoStrong}>{intake}</Text>
              {'  |  Submitted: '}
              {formatDate(submittedAt) || ''}
            </Text>
          </View>
          <Image src={logoSrc} style={styles.logo} />
        </View>

        {sections.map((section) => {
          const sectionAnswers = answers?.[section.id] || {};
          return (
            <View key={section.id} wrap={false}>
              <View style={styles.sectionHeader}>
                <Text>{section.title}</Text>
              </View>
              <View style={styles.fieldsTable}>{renderSectionBody(section, sectionAnswers, answers?.intake?.trainingCountry)}</View>
            </View>
          );
        })}

        <View style={styles.signatureTable} wrap={false}>
          <View style={styles.row}>
            <View style={styles.signatureHeaderCell}>
              <Text>For International Flight Operations Academy</Text>
            </View>
            <View style={styles.signatureHeaderCell}>
              <Text>The STUDENT</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.signatureBodyCell}>
              <Text style={styles.signatureDate}>{formatDate(submittedAt) || ''}</Text>
              <Text style={styles.signatureName}>Vincent Incammicia</Text>
              <Text style={styles.signatureTitle}>CEO</Text>
              <Image src={signatureSrc} style={styles.signatureImage} />
            </View>
            <View style={styles.signatureBodyCell}>
              <Text style={styles.signaturePlaceholder}>(Date)</Text>
              <Text style={styles.signaturePlaceholder}>(Name)</Text>
              <Text style={styles.signaturePlaceholder}>(Signature)</Text>
            </View>
          </View>
        </View>

        <Text
          fixed
          render={({ pageNumber, totalPages }) =>
            `IFOA Training Enrollment Form  -  Page ${pageNumber} of ${totalPages}`
          }
          style={{ position: 'absolute', bottom: 16, left: 28, fontSize: 7.5, color: '#555555' }}
        />
        <Text
          fixed
          style={{ position: 'absolute', bottom: 16, right: 28, fontSize: 7.5, color: '#555555' }}
        >
          info@theifoa.com | +41 78 227 3103
        </Text>
      </Page>
    </Document>
  );
}

export default EnrollmentPdfDocument;
