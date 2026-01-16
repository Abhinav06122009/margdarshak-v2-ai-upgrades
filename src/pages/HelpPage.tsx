import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  FileText,
  Clock,
  Shield
} from 'lucide-react';
import logo from "@/components/logo/logo.png";

// FAQ Data
const FAQS = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login page and click on 'Forgot Password'. Enter your registered email address, and we will send you a link to reset your password securely."
  },
  {
    question: "Is MARGDARSHAK free to use?",
    answer: "Yes! MARGDARSHAK offers a comprehensive free tier that includes task management, grade tracking, and the study timer. We also offer premium features for advanced analytics and unlimited storage."
  },
  {
    question: "How do I calculate my GPA?",
    answer: "Navigate to the 'Grades' section from your dashboard. Enter your course names, credits, and the grades you achieved. Our built-in calculator will automatically compute your semester and cumulative GPA."
  },
  {
    question: "Can I sync my timetable with Google Calendar?",
    answer: "Currently, we support manual export of your timetable as an ICS file, which can be imported into Google Calendar, Outlook, or Apple Calendar. Automatic sync is coming in a future update."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption for all data transmission and storage. Your personal information and academic records are private and accessible only by you."
  }
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded" />
            <span className="font-bold text-xl tracking-tight">MARGDARSHAK <span className="text-emerald-400 font-light">Help</span></span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        
        {/* Hero Search Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Search our knowledge base or browse common questions below.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <Input 
                type="text"
                placeholder="Search for answers (e.g., 'GPA', 'Password')" 
                className="w-full pl-12 pr-4 py-6 bg-white/5 border-white/10 rounded-2xl focus:border-emerald-500/50 focus:ring-emerald-500/20 text-lg transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        {/* Support Categories */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {[
            { icon: Book, title: "Getting Started", desc: "New to MARGDARSHAK? Learn the basics here.", link: "/features" },
            { icon: Shield, title: "Account & Security", desc: "Manage your profile, password, and privacy.", link: "/settings" },
            { icon: FileText, title: "Billing & Plans", desc: "Questions about premium features and pricing.", link: "/upgrade" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link to={item.link} className="block group">
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all h-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-white/10 rounded-xl bg-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-gray-200">{faq.question}</span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 mt-2">
                      <div className="pt-2">{faq.answer}</div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need support?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Our team is available Monday through Friday to assist you with any technical issues or account questions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-xl w-full sm:w-auto">
                  <Mail className="w-4 h-4 mr-2" /> Contact Support
                </Button>
              </Link>
              <a href="mailto:support@margdarshak.com">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 rounded-xl w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" /> Email Us Directly
                </Button>
              </a>
            </div>
          </div>
        </div>

      </main>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm bg-black/30">
        <p>© 2025 VSAV GYANTAPA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HelpPage;
