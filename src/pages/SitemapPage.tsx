import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, FileText, Lock, Layout, BookOpen, Calculator as CalcIcon, Briefcase, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const SitemapPage = () => {
  const links = [
    {
      category: "Main Pages",
      icon: Layout,
      items: [
        { name: "Home", path: "/" },
        { name: "Login / Signup", path: "/auth" },
        { name: "Features Overview", path: "/features" }
      ]
    },
    {
      category: "Tools & Resources",
      icon: CalcIcon,
      items: [
        { name: "Scientific Calculator", path: "/calculator" },
        { name: "Resource Library", path: "/resources" }
      ]
    },
    {
      category: "Content & Blog",
      icon: BookOpen,
      items: [
        { name: "Student Blog", path: "/blog" },
        { name: "Study Techniques", path: "/blog/scientific-study-techniques-2025" },
        { name: "Exam Stress", path: "/blog/manage-exam-stress-guide" }
      ]
    },
    {
      category: "Legal & Support",
      icon: FileText,
      items: [
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms & Conditions", path: "/terms" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans p-6">
      <Link to="/"><Button variant="ghost" className="mb-8"><ArrowLeft className="w-4 h-4 mr-2" /> Home</Button></Link>
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Site Overview</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {links.map((section, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <section.icon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{section.category}</h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i}>
                    {item.path.startsWith('/#') ? (
                      <a href={item.path} className="text-gray-400 hover:text-white hover:pl-2 transition-all block">{item.name}</a>
                    ) : (
                      <Link to={item.path} className="text-gray-400 hover:text-white hover:pl-2 transition-all block">{item.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
