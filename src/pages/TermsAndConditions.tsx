import React from "react";
import logo from "@/components/logo/logo.png";

type Section = { id: number; slug: string; title: string; content: React.ReactNode };

const sections: Section[] = [
  {
    id: 1,
    slug: "acceptance-and-construction",
    title: "Acceptance of Terms and Construction",
    content: (
      <>
        <p className="mb-4 text-lg">
          By accessing or utilizing the services, interfaces, modules, and adjunct integrations provided by
          <strong> MARGDARSHAK</strong>, operated by <strong>VSAV GYANTAPA</strong> (collectively, the “Services”),
          an individual or juridical person (“User”) signifies unconditional assent to these Terms and Conditions
          (“Terms”) and agrees to be bound thereby in their entirety; non‑assent mandates abstention from any
          engagement with the Services. 
        </p>
        <p className="mb-4 text-lg">
          Captions are facilitative and shall not circumscribe interpretation; references to “including,” “inter alia,” or “e.g.” are illustrative, not exhaustive; and singular shall comprehend plural <em>mutatis mutandis</em>. 
        </p>
        <p className="text-lg">
          To the extent of any conflict between localized renditions, the English version shall prevail to the fullest extent permissible by law, save where peremptory local statutes ordain otherwise. 
        </p>
      </>
    ),
  },
  {
    id: 2,
    slug: "eligibility-and-accounts",
    title: "Eligibility, Registration, and Accounts",
    content: (
      <>
        <p className="mb-4 text-lg">
          Where registration is requisite, the User represents and warrants the provision of accurate, current, and complete information and undertakes to preserve credential confidentiality; all actions undertaken via a User’s account shall be imputed to that account’s holder. 
        </p>
        <p className="text-lg">
          The Services are not deliberately directed to minors below the applicable age of digital consent; any cognizance of underage participation shall precipitate remedial measures, including suspension or erasure, subject to lawful retention exceptions. 
        </p>
      </>
    ),
  },
  {
    id: 3,
    slug: "authorized-use-and-conduct",
    title: "Authorized Use and Proscribed Conduct",
    content: (
      <>
        <p className="mb-4 text-lg">
          The User shall employ the Services solely for lawful purposes, in conformity with applicable statutes, regulations, and these Terms, and shall refrain from any conduct that infringes intellectual property, privacy, or other proprietary rights, disrupts Service integrity, facilitates malware or exploits, or otherwise derogates from acceptable use. 
        </p>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li className="text-lg">No reverse engineering, decompilation, scraping, or data exfiltration beyond permitted interfaces.</li>
          <li>No dissemination of unlawful, defamatory, obscene, infringing, or otherwise objectionable material.</li>
          <li>No evasion of rate limits, authentication gates, or technical and organizational controls.</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    slug: "intellectual-property",
    title: "Intellectual Property and License",
    content: (
      <>
        <p className="mb-4 text-lg">
          The Services and their constituent content, compilations, software, interfaces, graphics, trademarks, and logos (the “Materials”) are owned by VSAV or its licensors and are protected by intellectual property laws. 
        </p>
        <p className="text-lg">
          Subject to full compliance with these Terms, VSAV grants a limited, revocable, non‑exclusive, non‑transferable, non‑sublicensable license to access and use the Services for personal, noncommercial purposes; no other rights are granted by implication, estoppel, or otherwise. 
        </p>
      </>
    ),
  },
  {
    id: 5,
    slug: "user-generated-content",
    title: "User‑Generated Content and License Grant",
    content: (
      <>
        <p className="mb-4 text-lg">
          Where the User submits, uploads, or transmits content to or through the Services (“UGC”), the User represents entitlement to grant, and hereby grants, to VSAV a worldwide, royalty‑free, transferable, sublicensable license to host, reproduce, display, perform, adapt, modify, and distribute such UGC as necessary to operate, improve, and promote the Services, subject to applicable law. 
        </p>
        <p className="text-lg">
          No UGC shall be unlawful, defamatory, obscene, infringing, or violative of privacy or publicity rights; VSAV reserves discretion to remove or disable access to UGC that contravenes these strictures. 
        </p>
      </>
    ),
  },
  {
    id: 6,
    slug: "modifications-availability",
    title: "Modifications, Interruptions, and Availability",
    content: (
      <>
        <p className="mb-4 text-lg">
          VSAV may, at any time and without liability, modify, suspend, or discontinue any aspect of the Services, including features, content, or availability windows, for maintenance, security hardening, capacity planning, or other operational exigencies. 
        </p>
        <p className="text-lg">
          The User acknowledges the possibility of outages, latency, or hardware/software interferences, and agrees that VSAV shall not be liable for any consequential or incidental detriments attributable to such interruptions. 
        </p>
      </>
    ),
  },
  {
    id: 7,
    slug: "warranties-disclaimer",
    title: "Disclaimer of Warranties",
    content: (
      <>
        <p className="mb-4 text-lg">
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON‑INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW. 
        </p>
        <p className="text-lg">
          VSAV DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR‑FREE, OR FREE OF HARMFUL COMPONENTS, OR THAT DEFECTS WILL BE CORRECTED. 
        </p>
      </>
    ),
  },
  {
    id: 8,
    slug: "limitation-liability",
    title: "Limitation of Liability",
    content: (
      <>
        <p className="mb-4 text-lg">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, VSAV SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, GOODWILL, DATA, OR BUSINESS INTERRUPTION, ARISING FROM OR RELATING TO THE SERVICES OR THESE TERMS, EVEN IF FORESEEABLE OR IF ADVISED OF THE POSSIBILITY. 
        </p>
        <p className="text-lg">
          IN JURISDICTIONS WHERE LIMITATIONS OF LIABILITY OR EXCLUSIONS OF CERTAIN DAMAGES ARE RESTRICTED, LIABILITY SHALL BE LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW. 
        </p>
      </>
    ),
  },
  {
    id: 9,
    slug: "arbitration-disputes",
    title: "Arbitration, Class Action Waiver, and Dispute Resolution",
    content: (
      <>
        <p className="mb-4 text-lg">
          To expedite and control the cost of disputes, any claim, controversy, or dispute arising out of or relating to the Services or these Terms (“Dispute”) shall be resolved by binding arbitration on an individual basis, rather than in court, except that either party may pursue a claim in small‑claims court of competent jurisdiction if eligible. 
        </p>
        <p className="mb-4 text-lg">
          The arbitration shall be administered by a recognized arbitral forum under its applicable rules, with a single neutral arbitrator; the seat and language of arbitration shall be reasonably designated, and the award shall be final and enforceable in any court of competent jurisdiction. 
        </p>
        <p className="text-lg">
          Class actions, class arbitrations, private attorney general actions, and representative proceedings are waived to the fullest extent permitted by law; the parties consent to individualized relief only. 
        </p>
      </>
    ),
  },
  {
    id: 10,
    slug: "privacy-incorporation",
    title: "Privacy Incorporation by Reference",
    content: (
      <p className="text-lg">
        The Privacy Policy governing the collection, Processing, and safeguarding of personal information is hereby incorporated by reference; continued use of the Services constitutes acknowledgment of, and adherence to, such policy. 
      </p>
    ),
  },
  {
    id: 11,
    slug: "termination-and-suspension",
    title: "Termination and Suspension",
    content: (
      <>
        <p className="mb-4 text-lg">
          VSAV may suspend or terminate access, in whole or part, with or without prior notice, for any conduct that violates these Terms, impairs Service integrity, or otherwise presents risk; upon termination, all licenses and rights granted herein shall immediately cease. 
        </p>
        <p className="text-lg">
          Sections which by their nature should survive termination shall so survive, including, inter alia, intellectual property, disclaimers, limitations of liability, arbitration, and governing law. 
        </p>
      </>
    ),
  },
  {
    id: 12,
    slug: "changes-to-terms",
    title: "Changes to These Terms",
    content: (
      <>
        <p className="mb-4 text-lg">
          VSAV may amend these Terms from time to time; updated terms shall be posted with an amended effective date. 
        </p>
        <p className="text-lg">
          Continued use of the Services following such changes shall constitute acceptance thereof; where required by law, renewed consent or explicit acknowledgment may be solicited. 
        </p>
      </>
    ),
  },
  {
    id: 13,
    slug: "governing-law-venue",
    title: "Governing Law and Venue",
    content: (
      <p className="text-lg">
        Except where mandatorily overridden by peremptory local law, these Terms shall be governed by the laws applicable to VSAV’s principal establishment, without regard to conflict‑of‑laws principles; venue and jurisdiction shall lie as stipulated in the arbitration and dispute resolution provisions or, absent arbitration, in courts of competent jurisdiction. 
      </p>
    ),
  },
  {
    id: 14,
    slug: "contact",
    title: "Contact",
    content: (
      <>
        <p className="mb-4 text-lg">
          Queries regarding these Terms may be addressed to: 
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
            SUPPORT@MARGDARSHAN.TECH
          </a>
        </address>
      </>
    ),
  },
];

const TermsAndConditions: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
          <div className="relative rounded-3xl border border-emerald-300/40 bg-white/70 backdrop-blur-xl shadow-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-emerald-400/30" />
            <div className="flex flex-col md:flex-row items-center gap-6 px-8 py-10">
              <img
                src={logo}
                alt="MARGDARSHAK Student Planner Logo"
                className="w-16 h-16 rounded bg-white shadow"
                draggable={false}
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Terms and Conditions
                </h1>
                <p className="mt-3 text-slate-600">
                  A comprehensive instrument governing eligibility, licenses, conduct, disclaimers, liability, and dispute resolution for the MARGDARSHAK student management system.
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
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
              <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-50 to-white shadow-lg p-5">
                <p className="text-sm text-slate-700">
                  For clarifications on arbitration, liability limitations, or warranty disclaimers, consult the relevant sections below.
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl p-6 mb-8">
              <p className="text-lg text-slate-800">
                These Terms constitute a binding accord between VSAV and the User concerning the Services and shall be construed to maximize legal efficacy in consonance with applicable law and equitable principles.
              </p>
            </div>

            {sections.map((s) => (
              <article
                key={s.slug}
                id={`section-${s.slug}`}
                aria-labelledby={`heading-${s.slug}`}
                className="group relative mb-8 rounded-2xl border border-slate-200 bg-white/90 shadow-xl transition hover:shadow-2xl"
              >
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-500 opacity-80" />
                <header className="px-6 pt-6">
                  <h3 id={`heading-${s.slug}`} className="text-2xl font-bold tracking-tight text-slate-900">
                    {s.id}. {s.title}
                  </h3>
                </header>
                <div className="px-6 py-5 text-slate-800 leading-relaxed">{s.content}</div>
              </article>
            ))}
            <article
              aria-labelledby="warning-copying"
              className="group relative mt-10 mb-4 rounded-2xl border border-rose-300/50 bg-white/90 shadow-xl"
            >
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-rose-400 via-amber-400 to-rose-500 opacity-80" />
              <div className="px-6 py-5">
                <p id="warning-copying" className="text-sm text-rose-700 font-semibold text-center select-none">
                  ⚠️ Warning: Unauthorized copying, reproduction, distribution, or derivative exploitation of any content,
                  code, text, imagery, or proprietary material belonging to <strong>MARGDARSHAK</strong> and <strong>VSAV GYANTAPA</strong>
                  is strictly proscribed and may precipitate civil and/or criminal liability.
                </p>
              </div>
            </article>
            {onBack && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={onBack}
                  aria-label="Go back"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 focus:outline-none text-white font-semibold px-8 py-3 transition duration-300 shadow-md"
                >
                  Back
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="MARGDARSHAK Student Planner Logo"
              className="w-14 h-14 object-contain bg-white rounded"
              draggable={false}
              style={{ minWidth: 48 }}
            />
            <div className="text-slate-800 text-sm">
              Maintained by <span className="font-semibold text-emerald-600">VSAV GYANTAPA</span>
              <br />
              Developed &amp; Maintained by <span className="font-semibold text-emerald-600">VSAV GYANTAPA</span>
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

export default TermsAndConditions;