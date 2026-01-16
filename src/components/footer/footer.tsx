import React from 'react';
import { ShieldCheck } from 'lucide-react';

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="fill-current w-full h-full">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="fill-current w-full h-full">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
  </svg>
);

const LinkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="fill-current w-full h-full">
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H3.042v7.225h1.901zm-1.012-8.122c.675 0 1.092-.447 1.092-1.006-.011-.573-.417-1.006-1.08-1.006-.662 0-1.091.433-1.091 1.006 0 .559.417 1.006 1.079 1.006h.001zM13.11 13.414V9.401c0-2.15-1.146-3.15-2.678-3.15-1.235 0-1.787.683-2.096 1.166V6.169H6.435c.025.536 0 7.245 0 7.245h1.901V9.375c0-.216.015-.432.079-.586.173-.432.568-.879 1.233-.879.869 0 1.216.662 1.216 1.634v3.87h1.901z"/>
  </svg>
);

const SocialButton = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
  <a 
    href={href} 
    className="group flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 flex justify-center items-center max-w-[60px]"
    target="_blank"
    rel="noreferrer"
    aria-label="Social Link"
  >
    <div className="w-5 h-5 fill-current text-gray-500 group-hover:text-white transition-colors">
      {icon}
    </div>
  </a>
);

const Footer = () => {
  return (
    <footer className="mt-20 pt-10 border-t border-white/5 text-center pb-8 w-full">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Social Media Links */}
        <div className="flex justify-center items-center gap-6 mb-8 max-w-md mx-auto">
           <SocialButton href="https://x.com/gyantappas" icon={<TwitterLogo />} />
           <SocialButton href="https://www.facebook.com/profile.php?id=61584618795158" icon={<FacebookLogo />} />
           <SocialButton href="https://www.linkedin.com/in/vsav-gyantapa-33893a399/" icon={<LinkedinLogo />} />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
            Margdarshak
          </h4>
          
          <p className="text-xs text-gray-500 font-medium">
            © VSAV GYANTAPA {new Date().getFullYear()}
          </p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500/70 text-[10px] mt-4 font-mono hover:bg-emerald-500/10 transition-colors cursor-default">
             <ShieldCheck size={12} />
             <span>End-to-End Encrypted Environment</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;