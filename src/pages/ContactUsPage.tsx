import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, MessageSquare, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"; // Using Sonner for toasts
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Attempt to save to Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            message: formData.message,
          }
        ]);

      if (error) throw error;

      // 2. Success Feedback
      toast.success("Message sent successfully!", {
        description: "We'll get back to you shortly.",
      });

      // 3. Reset Form
      setFormData({ firstName: '', lastName: '', email: '', message: '' });

    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Fallback: If Supabase fails (e.g. table missing), open mail client
      const mailtoLink = `mailto:abhinavjha393@gmail.com?subject=Contact from ${formData.firstName}&body=${encodeURIComponent(formData.message)}`;
      window.location.href = mailtoLink;

      toast.error("Database connection failed. Opening email client instead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-400">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-emerald-500 mt-1" />
                    <div>
                      <div className="font-semibold">Email</div>
                      <a href="mailto:abhinavjha393@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                        abhinavjha393@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-emerald-500 mt-1" />
                    <div>
                      <div className="font-semibold">Location</div>
                      <p className="text-gray-400">
                        New Delhi, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-emerald-500 mt-1" />
                    <div>
                      <div className="font-semibold">Support Hours</div>
                      <p className="text-gray-400">
                        Monday - Friday<br />
                        9:00 AM - 6:00 PM IST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 p-8 rounded-2xl border border-white/10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors text-white"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors text-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Message</label>
                  <textarea 
                    rows={4} 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors text-white"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <Button 
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-12 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 VSAV GYANTAPA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ContactUsPage;
