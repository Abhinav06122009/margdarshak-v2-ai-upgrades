// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-TRANSPARENT text-gray-400 py-4 text-center text-sm">
      <div className="max-w-7xl mx-auto px-4">
        &copy; {new Date().getFullYear()} VSAV MANAGEMENTS.ALL RIGHT RESERVED.
        <br /> {/* Add a line break here */}
        DEVELOPED AND MAINTAINED BY ABHINAV JHA
      </div>
    </footer>
  );
};

export default Footer;