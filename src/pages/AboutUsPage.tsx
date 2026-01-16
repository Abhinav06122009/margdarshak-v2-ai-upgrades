import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from "@/components/logo/logo.png";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
             <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="w-8 h-8 rounded" />
                <span className="font-bold">MARGDARSHAK</span>
             </div>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-6 text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full -z-10"></div>
           <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
           >
             <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
               Our Mission
             </h1>
             <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
               We are dedicated to empowering students worldwide with AI-driven tools that simplify academic management, reduce stress, and foster a love for learning.
             </p>
           </motion.div>
        </section>

        {/* Values Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Focus", desc: "We build tools that help you filter out noise and concentrate on what matters: your education.", color: "text-blue-400" },
              { icon: Heart, title: "Wellness", desc: "Academic success shouldn't come at the cost of mental health. Our tools promote balance.", color: "text-red-400" },
              { icon: Sparkles, title: "Innovation", desc: "We constantly evolve, using the latest technology to solve old student problems.", color: "text-yellow-400" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <item.icon className={`w-12 h-12 ${item.color} mb-6`} />
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-white/5 py-20">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-8">Our Story</h2>
            <p className="text-gray-300 mb-6 text-lg">
              MARGDARSHAK started as a simple idea in a dorm room. We realized that while there were dozens of apps for notes, calendars, and grades, none of them talked to each other.
            </p>
            <p className="text-gray-300 text-lg">
              We built the solution we wished we had: an all-in-one ecosystem where your syllabus automatically updates your calendar, and your grades inform your study schedule. Today, we serve thousands of students, helping them reclaim their time and achieve their potential.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 MARGDARSHAK. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUsPage;
