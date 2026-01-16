import React from "react";
import logo from "public/logo.png";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "definitions-and-interpretation",
    title: "Definitions and Interpretation",
    content: (
      <>
        <p className="mb-5">
          For purposes of this Privacy Policy (“Policy”), “Personal Data” connotes any datum relating to an
          identified or identifiable natural person; “Processing” subsumes any operation performed upon Personal
          Data, whether or not by automated means; “Controller” signifies the juridical person determining
          purposes and means of Processing; “Processor” denotes any person so engaged on the Controller’s behalf;
          and “Services” shall comprise all websites, applications, APIs, modules, integrations, and adjunct
          interfaces provided herein. Headings are facilitative and shall not circumscribe construction; terms
          shall be construed <em>noscitur a sociis</em>, and singular shall comprehend plural <em>mutatis mutandis</em>.
        </p>
        <p className="mb-5">
          Unless repugnant to context, references to statutes include successor enactments; references to
          “include,” “inter alia,” or “e.g.” are illustrative, not exhaustive; and references to “herein,”
          “hereof,” or “hereunder” pertain to this instrument in <em>toto</em>. Any conflict between localized
          renditions shall be resolved by reference to the prevailing English version, save where peremptory
          local law ordains otherwise.
        </p>
      </>
    ),
  },
  {
    id: 2,
    slug: "scope-and-applicability",
    title: "Scope, Territorial Reach, and Applicability",
    content: (
      <>
        <p className="mb-5">
          This Policy governs Processing appertaining to the Services irrespective of locus of access and is
          intended to discharge transparency obligations cognizable under GDPR/UK GDPR, CCPA/CPRA, India’s DPDP,
          Brazil’s LGPD, and cognate regimes. Where mandatory local derogations subsist, construction shall be
          harmonized <em>in pari materia</em> with such imperatives without derogating from the protective core
          enunciated herein.
        </p>
        <p className="mb-5">
          By engaging the Services, the user acknowledges notice of this Policy’s ambit and consents, where
          necessary and appropriate, to Processing in accordance with the juridical bases adumbrated below, without
          prejudice to statutory rights or remedies at law.
        </p>
      </>
    ),
  },
  {
    id: 3,
    slug: "controller-and-coordinates",
    title: "Identity of Controller and Contact Coordinates",
    content: (
      <p className="mb-5">
        The Controller responsible for the Processing delineated herein is <strong>VSAV GYANTAPA</strong>,
        operating <strong>MARGDARSHAK</strong>. Communications, representations, or requests contemplated by this
        Policy may be directed to the contact coordinates enumerated in the terminal Section titled “Contact and
        Data Protection Officer.”
      </p>
    ),
  },
  {
    id: 4,
    slug: "categories-of-data",
    title: "Categories of Personal Data",
    content: (
      <>
        <p className="mb-5">
          Subject to contextual vectors and user-configured preferences, the following non-exhaustive categories
          may be Processed:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>
            <strong>Identifying Coordinates:</strong> Names, email addresses, account identifiers, authentication
            artifacts, and profile attributes.
          </li>
          <li>
            <strong>Telemetry and Diagnostics:</strong> IP addresses, device fingerprints, user-agent strings,
            locale and time-zone, referrers, session identifiers, event logs, and pseudonymous identifiers
            materializing during ordinary engagement.
          </li>
          <li>
            <strong>Preference and Interaction Signals:</strong> Saved settings, feature toggles, notification
            dispositions, and UI interaction traces where instrumentation is enabled.
          </li>
          <li>
            <strong>Support and Operational Records:</strong> Correspondence metadata, attachments, and remedial
            artifacts exchanged with support or operations.
          </li>
        </ul>
        <p className="mb-5">
          Save as expressly stipulated, special categories of data (e.g., health, biometric templates, precise
          geolocation) are not knowingly solicited; if contemplated, Processing shall proceed only with explicit
          consent or another heightened lawful basis, girded by stringent safeguards.
        </p>
      </>
    ),
  },
  {
    id: 5,
    slug: "sources-and-modalities",
    title: "Sources and Modalities of Collection",
    content: (
      <p className="mb-5">
        Personal Data may be furnished directly by data subjects (<em>ab initio</em>), accrued automatically via
        cookies and cognate tracking primitives, or permissibly received from third parties under appropriate
        covenants and with suitable assurances, each circumscribed by the declared purposes and proportionality
        strictures herein articulated.
      </p>
    ),
  },
  {
    id: 6,
    slug: "purposes-of-processing",
    title: "Purposes of Processing",
    content: (
      <>
        <p className="mb-5">Processing operations are undertaken for the following, among other, purposes:</p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Provision, maintenance, and iterative enhancement of Service operability and performance.</li>
          <li>Personalization, relevance optimization, and UI/UX refinement predicated on lawful contextual signals.</li>
          <li>Transactional messaging, account notices, security advisories, and support correspondences.</li>
          <li>Fraud interdiction, abuse mitigation, anomaly detection, and compliance monitoring.</li>
          <li>Regulatory adherence, lawful disclosures, and preservation of vital interests.</li>
        </ul>
      </>
    ),
  },
  {
    id: 7,
    slug: "lawful-bases",
    title: "Juridical Bases for Processing (GDPR/UK GDPR)",
    content: (
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>
          <strong>Consent:</strong> Explicit, granular, informed, and unambiguous consent, revocable <em>ad
          libitum</em> without prejudice to prior lawful Processing.
        </li>
        <li>
          <strong>Contractual Necessity:</strong> Processing indispensable to enter into or perform contractual
          undertakings.
        </li>
        <li>
          <strong>Legal Obligation:</strong> Processing mandated to discharge statutory or regulatory prescriptions.
        </li>
        <li>
          <strong>Legitimate Interests:</strong> Compelling interests (e.g., security, continuity) not overridden by
          data subject rights, demonstrable via a balancing assessment and layered safeguards.
        </li>
      </ul>
    ),
  },
  {
    id: 8,
    slug: "cookies-and-trackers",
    title: "Cookies, Storage, and Tracking Technologies",
    content: (
      <p className="mb-5">
        Cookies, local/session storage, pixels, SDKs, and analogous beacons may be deployed to sustain sessions,
        preserve preferences, instrument analytics, and facilitate diagnostics. Browser-level controls—and, where
        supported, universal opt-out signals—may be honored to a technically feasible extent, albeit with potential
        attenuation of non-essential functionalities.
      </p>
    ),
  },
  {
    id: 9,
    slug: "disclosures-and-processors",
    title: "Disclosures to Processors and Third Parties",
    content: (
      <>
        <p className="mb-5">
          Personal Data may be disclosed to vetted processors furnishing hosting, storage, analytics, security,
          communications, and operational support under binding data protection covenants (confidentiality, purpose
          limitation, subprocessing controls, auditability, and destruction-on-termination clauses).
        </p>
        <p className="mb-5">
          No sale or rental of Personal Data for pecuniary consideration is undertaken. Limited disclosures may
          ensue to comply with law, enforce agreements, or protect vital interests, as circumscribed by necessity
          and proportionality.
        </p>
      </>
    ),
  },
  {
    id: 10,
    slug: "cross-border-transfers",
    title: "Cross‑Border Transfers and Appropriate Safeguards",
    content: (
      <p className="mb-5">
        Where Personal Data is exported extra‑territorially, appropriate safeguards (e.g., Standard Contractual
        Clauses, supplemental technical/organizational measures, and transfer impact assessments) are implemented
        to preserve a level of protection commensurate with the originating regime’s desiderata.
      </p>
    ),
  },
  {
    id: 11,
    slug: "security-controls",
    title: "Security: Technical and Organizational Measures",
    content: (
      <p className="mb-5">
        A layered control surface is maintained, encompassing encryption in transit and at rest; key management
        hygiene; least‑privilege access; role segregation; hardened configurations; vulnerability remediation
        cadences; audit logging; anomaly detection; business continuity; and incident response playbooks calibrated
        to contemporary risk morphologies.
      </p>
    ),
  },
  {
    id: 12,
    slug: "retention-and-disposition",
    title: "Data Retention, Minimization, and Disposition",
    content: (
      <p className="mb-5">
        Personal Data is retained strictly for durations requisite to the disclosed purposes or legal mandates and
        thereafter subjected to defensible disposition (erasure, anonymization, or archival), pursuant to documented
        schedules harmonized with minimization and proportionality precepts.
      </p>
    ),
  },
  {
    id: 13,
    slug: "rights-of-data-subjects",
    title: "Data Subject Rights and Request Protocols",
    content: (
      <p className="mb-5">
        Subject to applicable law and identity verification, data subjects may exercise rights of access,
        rectification, erasure, restriction, portability, and objection (including objection to Processing for
        direct marketing), and may revoke consent <em>ex nunc</em>. Complaints may be lodged with a competent
        supervisory authority without derogating from other remedies.
      </p>
    ),
  },
  {
    id: 14,
    slug: "california-privacy",
    title: "California Privacy Disclosures (CCPA/CPRA)",
    content: (
      <p className="mb-5">
        California residents may exercise rights to know, access, correct, delete, and opt out of “sale” or
        “sharing” of Personal Information, with additional constraints respecting Sensitive Personal Information.
        No discriminatory treatment shall be meted out for the exercise of such rights within CPRA’s contemplation.
      </p>
    ),
  },
  {
    id: 15,
    slug: "other-jurisdictions",
    title: "Other Jurisdictional Provisions (DPDP, LGPD, et al.)",
    content: (
      <p className="mb-5">
        Where the Indian Digital Personal Data Protection Act (DPDP), Brazil’s LGPD, or analogous regimes govern,
        transparency, lawful bases, localization, and grievance redressal shall be effected consonant with such
        prescriptions, with harmonized construction alongside this Policy.
      </p>
    ),
  },
  {
    id: 16,
    slug: "profiling-automation",
    title: "Profiling and Automated Decision-Making",
    content: (
      <p className="mb-5">
        Non-determinative profiling may be employed to tailor content or cadence. Absent a distinct lawful basis
        and transparency regimen, data subjects shall not be subjected to decisions producing legal or similarly
        significant effects solely by automated means; provision for human intervention shall subsist where required.
      </p>
    ),
  },
  {
    id: 17,
    slug: "children",
    title: "Children’s Data and Age-Gating",
    content: (
      <p className="mb-5">
        The Services are not deliberately directed to minors below the applicable age of digital consent; upon
        cognizance of underage Processing, prompt remediation and erasure shall be undertaken, subject to lawful
        retention exceptions.
      </p>
    ),
  },
  {
    id: 18,
    slug: "records-and-dpia",
    title: "Records of Processing and DPIA",
    content: (
      <p className="mb-5">
        Records of Processing Activities are maintained commensurate with regulatory expectations; Data Protection
        Impact Assessments shall be conducted where Processing is likely to engender high risk to the rights and
        freedoms of natural persons.
      </p>
    ),
  },
  {
    id: 19,
    slug: "incidents-breach",
    title: "Incident Response and Breach Notification",
    content: (
      <p className="mb-5">
        Upon a Personal Data breach, incident response protocols shall be actuated, including containment,
        remediation, and notification of supervisory authorities and affected data subjects in accordance with
        applicable thresholds and statutory timelines.
      </p>
    ),
  },
  {
    id: 20,
    slug: "subprocessors",
    title: "Subprocessors and Supply Chain Governance",
    content: (
      <p className="mb-5">
        Engagement of subprocessors shall be governed by written instruments imposing data protection obligations
        no less protective than those herein, including oversight, due diligence, audit, and destruction-on-termination
        covenants, each calibrated to proportionality.
      </p>
    ),
  },
  {
    id: 21,
    slug: "third-party-links",
    title: "Third‑Party Resources and External Hyperlinks",
    content: (
      <p className="mb-5">
        References to third‑party resources are furnished for convenience; no direction or control is exercised over
        such properties, and responsibility for their privacy postures is disclaimed. Independent appraisal of their
        notices is strongly counseled prior to engagement.
      </p>
    ),
  },
  {
    id: 22,
    slug: "modifications-and-notice",
    title: "Versioning, Material Modifications, and Notice",
    content: (
      <p className="mb-5">
        This Policy may be amended to reflect operational, legal, or technological evolutions. Material alterations
        shall be conspicuously noticed with an updated Effective Date; where exigent, renewed consent or acknowledgment
        may be solicited <em>ex ante</em> or <em>ex post</em>.
      </p>
    ),
  },
  {
    id: 23,
    slug: "governing-law",
    title: "Governing Law, Venue, and Dispute Resolution",
    content: (
      <p className="mb-5">
        Except where peremptorily overridden by mandatory local law, this Policy is governed by the laws applicable to
        the Controller’s principal establishment, <em>sans</em> conflict-of-laws principles; venue and jurisdiction
        shall lie as provided in the Terms governing the Services.
      </p>
    ),
  },
  {
    id: 24,
    slug: "severability-nonwaiver",
    title: "Severability, Assignment, and Non‑Waiver",
    content: (
      <p className="mb-5">
        If any clause herein is adjudged ultra vires or unenforceable, the remainder shall be given effect to the
        maximum extent consonant with the parties’ manifest intent. No waiver shall be inferred from any forbearance,
        nor shall assignment be presumed absent express stipulation.
      </p>
    ),
  },
  {
    id: 25,
    slug: "language-and-prevailing",
    title: "Language, Localization, and Prevailing Version",
    content: (
      <p className="mb-5">
        Translations may be provided <em>ad utilitatem</em>; in case of divergence, the English version shall prevail
        to the fullest extent permissible. Localized annexures may be issued to reflect jurisdiction‑specific
        imperatives and shall be read harmoniously herewith.
      </p>
    ),
  },
  {
    id: 26,
    slug: "notice-unauthorized-use",
    title: "Notice Against Unauthorized Reproduction",
    content: (
      <p className="mb-5">
        ⚠️ Any unauthorized reproduction, adaptation, dissemination, reverse engineering, or derivative exploitation
        of content, code, text, imagery, or proprietary materials belonging to <strong>MARGDARSHAK</strong> and
        <strong> VSAV GYANTAPA</strong> is strictly proscribed and may precipitate civil and/or criminal liability.
      </p>
    ),
  },
  {
    id: 27,
    slug: "contact-and-dpo",
    title: "Contact and Data Protection Officer",
    content: (
      <>
        <p className="mb-5">
          For inquiries, invocations of rights, or concerns respecting this Policy or the enterprise’s data protection
          program, contact the privacy function or the designated Data Protection Officer:
        </p>
        <address className="not-italic text-blue-700 font-medium">
          VSAV GYANTAPA — MARGDARSHAK
          <br />
          Email:{" "}
          <a
            href="mailto:SUPPORT@MARGDARSHAK.TECH"
            className="text-blue-600 underline hover:text-blue-800"
            aria-label="Contact VSAV GYANTAPA via email"
          >
            SUPPORT@MARGDARSHAK.TECH
          </a>
        </address>
      </>
    ),
  },
];

const PrivacyPolicy: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
          <div className="relative rounded-3xl border border-emerald-300/40 bg-white/70 backdrop-blur-xl shadow-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-emerald-400/30" />
            <div className="flex flex-col md:flex-row items-center gap-6 px-8 py-10">
              <img
                src={logo}
                alt="MARGDARSHAK Logo"
                className="w-16 h-16 rounded bg-white shadow"
                draggable={false}
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Privacy Policy
                </h1>
                <p className="mt-3 text-slate-600">
                  A comprehensive articulation of data protection posture, obligations, and prerogatives governing
                  the Processing of Personal Data <em>in toto</em>.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Effective Date: <time dateTime="2025-07-25">July 25, 2025</time> • Version: 2.0
                </p>
              </div>
              {onBack && (
                <button
                  onClick={onBack}
                  aria-label="Go back"
                  className="rounded-full px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-300 transition"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky TOC */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Table of Contents</h2>
                <ol className="text-sm space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {sections.map((s) => (
                    <li key={s.id} className="group">
                      <a
                        href={`#section-${s.slug}`}
                        className="inline-flex items-start gap-2 text-slate-700 hover:text-emerald-700"
                      >
                        <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/70 group-hover:bg-emerald-500" />
                        <span>
                          {s.id}. {s.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
              {/* Callout */}
              <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-50 to-white shadow-lg p-5">
                <p className="text-sm text-slate-700">
                  Queries respecting rights, consent withdrawal, or jurisdictional clarifications may be directed to
                  the privacy desk enumerated below.
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-8">
            {/* Preamble */}
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl p-6 mb-8">
              <p className="text-lg text-slate-800">
                This Policy is promulgated by <strong>VSAV GYANTAPA</strong>, acting through and for{" "}
                <strong>MARGDARSHAK</strong> (“we,” “us,” “our”), to delineate the purposes, modalities, and juridical
                foundations pursuant to which Personal Data is Processed in relation to access to and utilization of
                the Services. The provisions herein shall be construed harmoniously with applicable data protection
                prescriptions and interpreted to maximize efficacy without derogating from mandatory local law.
              </p>
            </div>

            {/* Sections */}
            {sections.map((s) => (
              <article
                key={s.slug}
                id={`section-${s.slug}`}
                aria-labelledby={`heading-${s.slug}`}
                className="group relative mb-8 rounded-2xl border border-slate-200 bg-white/90 shadow-xl transition hover:shadow-2xl"
              >
                {/* Gradient left accent */}
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-500 opacity-80" />
                <header className="px-6 pt-6">
                  <h3
                    id={`heading-${s.slug}`}
                    className="text-2xl font-bold tracking-tight text-slate-900"
                  >
                    {s.id}. {s.title}
                  </h3>
                </header>
                <div className="px-6 py-5 text-slate-800 leading-relaxed">{s.content}</div>
              </article>
            ))}

            {/* Footer block */}
            <div className="mt-10 rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-white to-emerald-50 shadow-xl p-6">
              <p className="text-sm text-slate-600">
                This Policy shall be read in concert with the Terms governing the Services. In the event of any
                irreconcilable inconsistency, the more protective provision shall prevail <em>pro tanto</em>, save as
                otherwise compelled by peremptory local law.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="MARGDARSHAK Logo"
              className="w-14 h-14 object-contain bg-white rounded"
              draggable={false}
              style={{ minWidth: 48 }}
            />
            <div className="text-slate-800 text-sm">
              Maintained by <span className="font-semibold text-emerald-600">VSAV GYANTAPA</span>
              <br />
              Developed &amp; Maintained by{" "}
              <span className="font-semibold text-emerald-600">VSAV GYANTAPA</span>
              <br />
              © 2025 VSAV GYANTAPA. All Rights Reserved
            </div>
          </div>
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50 transition"
            aria-label="Back to top"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
