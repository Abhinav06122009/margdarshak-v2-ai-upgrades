import React from "react";
import { ArrowLeft, Twitter, Linkedin, Github } from "lucide-react";
import logo from "@/components/logo/logo.png";

const TermsAndConditions = ({ onBack }: { onBack?: () => void }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden particle-bg">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500 to-purple-700 rounded-full opacity-30 filter blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full opacity-30 filter blur-3xl animate-float delay-2000" />
      </div>

      <main className="relative w-full max-w-4xl bg-black/50 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-12 text-white/90 overflow-y-auto max-h-[90vh] font-sans leading-relaxed">
        {onBack && (
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 focus:ring-4 focus:ring-blue-500/50 outline-none text-white transition duration-300 shadow-md"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        )}

        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            Terms and Conditions
          </h1>
          <p className="text-lg font-semibold text-white/70">
            Effective Date: <time dateTime="2025-07-25">July 25, 2025</time>
          </p>
        </header>

        <article className="space-y-8 text-lg text-white/80">
          <p>
            Welcome to <strong>GYANVEEDU</strong>, operated by <strong>VSAV MANAGEMENTS</strong>. By accessing or using our website and services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
          </p>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">1. Acceptance of Terms</h2>
            <p>By using GYANVEEDU, you confirm that you accept these Terms and Conditions and that you agree to comply with them. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">2. Use of Services</h2>
            <p>You agree to use the website and services only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the site.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">3. User Accounts</h2>
            <p>Where registration is required, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">4. Intellectual Property</h2>
            <p>All content, trademarks, logos, graphics, and software on GYANVEEDU are the property of VSAV or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">5. User-Generated Content</h2>
            <p className="mb-4">If you submit content to our services, you grant VSAV a worldwide, royalty-free license to use, modify, reproduce, and distribute such content in connection with providing our services.</p>
            <p>You agree not to submit content that is unlawful, defamatory, obscene, or otherwise objectionable.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, VSAV shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of or inability to use the website or services.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">7. Disclaimer of Warranties</h2>
            <p>The website and services are provided "as is" and "as available" without warranties of any kind, either express or implied. VSAV does not guarantee the accuracy, reliability, or availability of the services.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">8. Privacy</h2>
            <p>Your use of GYANVEEDU is also governed by our Privacy Policy, which explains how we collect and use your personal information.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the services at our sole discretion, without prior notice, for conduct that violates these Terms or is harmful to other users or the website.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">10. Changes to Terms</h2>
            <p>VSAV may update these Terms and Conditions from time to time. Updated terms will be posted on this page with a revised effective date. Continued use of the services constitutes acceptance of the changes.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">11. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the jurisdiction in which VSAV operates, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 border-b-2 border-blue-500 pb-2 text-white">12. Contact Us</h2>
            <p className="mb-4">If you have questions about these Terms and Conditions, please contact us:</p>
            <address className="not-italic text-blue-400 font-medium">
              VSAV MANAGEMENTS - MARGDARSHAK<br />
              Email: <a href="mailto:abhinavjha393@gmail.com" className="underline hover:text-blue-300">abhinavjha393@gmail.com</a>
            </address>
          </section>

          <div className="mt-12 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center select-none">
            <p className="text-sm text-red-400 font-semibold">
              ⚠️ Warning: Unauthorized copying, reproduction, distribution, or use of any content,
              code, text, images, or proprietary material belonging to <strong>GYANVEEDU</strong> and{" "}
              <strong>VSAV MANAGEMENTS</strong> is strictly prohibited and may result in legal action.
            </p>
          </div>
        </article>

        <footer className="mt-12 pt-8 border-t border-white/20 text-sm text-white/70">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <p>&copy; 2025 <span className="font-semibold text-emerald-400">VSAV MANAGEMENTS</span>. All Rights Reserved.</p>
              <p>Developed by <span className="font-semibold text-emerald-400">Abhinav Jha</span></p>
            </div>
            <div className="flex space-x-6">
              <SocialLink href="#" label="Twitter"><TwitterIcon /></SocialLink>
              <SocialLink href="#" label="LinkedIn"><LinkedinIcon /></SocialLink>
              <SocialLink href="#" label="GitHub"><GithubIcon /></SocialLink>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};


const SocialLink = ({ href, children, label }: { href: string; children: React.ReactNode; label: string }) => (
  <a href={href} aria-label={label} className="hover:text-white transition-colors">
    {children}
  </a>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

export default TermsAndConditions;