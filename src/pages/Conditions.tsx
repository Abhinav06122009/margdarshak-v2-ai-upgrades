import React from "react";
import logo from "public/logo.png";

const TermsAndConditions: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-12 text-gray-800 overflow-y-auto max-h-[90vh] font-sans leading-relaxed">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-gradient-primary">
          Terms and Conditions
        </h1>

        <p className="mb-8 text-center text-lg font-semibold text-gray-600">
          Effective Date: <time dateTime="2025-07-25">July 25, 2025</time>
        </p>

        <p className="mb-8 text-lg">
          Welcome to <strong>GYANVEEDU</strong>, operated by <strong>VSAV MANAGEMENTS</strong>. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
        </p>

        {[
          {
            id: 1,
            title: "Acceptance of Terms",
            content: (
              <p className="mb-8 text-lg">
                By using GYANVEEDU, you confirm that you accept these Terms and Conditions and that you agree to comply with them. If you do not agree, please do not use our services.
              </p>
            ),
          },
          {
            id: 2,
            title: "Use of Services",
            content: (
              <p className="mb-8 text-lg">
                You agree to use the website and services only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the site.
              </p>
            ),
          },
          {
            id: 3,
            title: "User Accounts",
            content: (
              <p className="mb-8 text-lg">
                Where registration is required, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
            ),
          },
          {
            id: 4,
            title: "Intellectual Property",
            content: (
              <p className="mb-8 text-lg">
                All content, trademarks, logos, graphics, and software on GYANVEEDU are the property of VSAV or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without prior written consent.
              </p>
            ),
          },
          {
            id: 5,
            title: "User-Generated Content",
            content: (
              <>
                <p className="mb-4 text-lg">
                  If you submit content to our services, you grant VSAV a worldwide, royalty-free license to use, modify, reproduce, and distribute such content in connection with providing our services.
                </p>
                <p className="mb-8 text-lg">
                  You agree not to submit content that is unlawful, defamatory, obscene, or otherwise objectionable.
                </p>
              </>
            ),
          },
          {
            id: 6,
            title: "Limitation of Liability",
            content: (
              <p className="mb-8 text-lg">
                To the fullest extent permitted by law, VSAV shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the website or services.
              </p>
            ),
          },
          {
            id: 7,
            title: "Disclaimer of Warranties",
            content: (
              <p className="mb-8 text-lg">
                The website and services are provided "as is" and "as available" without warranties of any kind, either express or implied. VSAV does not guarantee the accuracy, reliability, or availability of the services.
              </p>
            ),
          },
          {
            id: 8,
            title: "Privacy",
            content: (
              <p className="mb-8 text-lg">
                Your use of GYANVEEDU is also governed by our Privacy Policy, which explains how we collect and use your personal information.
              </p>
            ),
          },
          {
            id: 9,
            title: "Termination",
            content: (
              <p className="mb-8 text-lg">
                We reserve the right to suspend or terminate your access to the services at our sole discretion, without prior notice, for conduct that violates these Terms or is harmful to other users or the website.
              </p>
            ),
          },
          {
            id: 10,
            title: "Changes to Terms",
            content: (
              <p className="mb-8 text-lg">
                VSAV may update these Terms and Conditions from time to time. Updated terms will be posted on this page with a revised effective date. Continued use of the services constitutes acceptance of the changes.
              </p>
            ),
          },
          {
            id: 11,
            title: "Governing Law",
            content: (
              <p className="mb-8 text-lg">
                These Terms are governed by and construed in accordance with the laws of the jurisdiction in which VSAV operates, without regard to conflict of law principles.
              </p>
            ),
          },
          {
            id: 12,
            title: "Contact Us",
            content: (
              <>
                <p className="mb-4 text-lg">
                  If you have questions about these Terms and Conditions, please contact us:
                </p>
                <address className="not-italic mb-8 text-lg text-blue-700 font-medium">
                  VSAV MANAGEMENTS - GYANVEEDU
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:abhinavjha393@gmail.com"
                    className="text-blue-600 underline hover:text-blue-800"
                    aria-label="Contact VSAV Managements via email"
                  >
                    abhinavjha393@gmail.com
                  </a>
                </address>
              </>
            ),
          },
        ].map(({ id, title, content }) => (
          <section key={id} aria-labelledby={`section-${id}`} className="mb-8">
            <h2
              id={`section-${id}`}
              className="text-3xl font-bold mb-4 border-b-2 border-blue-600 pb-2"
            >
              {id}. {title}
            </h2>
            {content}
          </section>
        ))}

        {/* Warning Against Copying */}
        <section aria-labelledby="warning-copying" className="mb-12">
          <p
            id="warning-copying"
            className="mb-8 text-sm text-red-700 font-semibold text-center select-none"
          >
            ⚠️ Warning: Unauthorized copying, reproduction, distribution, or use of any content,
            code, text, images, or proprietary material belonging to <strong>GYANVEEDU</strong> and{" "}
            <strong>VSAV MANAGEMENTS</strong> is strictly prohibited and may result in legal action.
          </p>
        </section>

        {onBack && (
          <div className="flex justify-center mt-10">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="rounded-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none text-white font-semibold px-8 py-3 transition duration-300 shadow-md"
            >
              Back
            </button>
          </div>
        )}
 <footer className="mt-12 py-6 border-t border-black text-sm select-none flex items-center justify-center gap-4 text-white/70">
  <img
    src={logo}
    alt="VSAV GyanVedu Logo"
    className="w-15 h-14 object-contain mr-4 bg-white"
    draggable={false}
    style={{ minWidth: 48 }}
  />
  <div className="text-center text-black">
    Maintained by <span className="font-semibold text-emerald-400">VSAV Managements</span>
    <br />
    Developed &amp; Maintained by <span className="font-semibold text-emerald-400">Abhinav Jha</span>
    <br />
    © 2025 Vsav Managements. All Rights Reserved
  </div>
</footer>
      </div>
    </div>
  );
};

export default TermsAndConditions;
