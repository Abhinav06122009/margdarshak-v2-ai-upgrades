// Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-3">Sklep</h3>
          <h2> copyright claimed</h2>
        </div>
      </div>
      <div className="text-center pt-8 border-t border-gray-700 mt-8">
        <p>&copy; {new Date().getFullYear()} Domestico.pl Wszelkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
};

export default Footer;