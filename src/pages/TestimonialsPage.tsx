import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdSenseScript from "@/components/AdSenseScript";

const TestimonialsPage = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Engineering Student",
      image: "👩‍💻",
      content: "MARGDARSHAK has completely transformed how I study. The grade tracker helps me stay on top of my CGPA, and the task manager ensures I never miss an assignment. It's the best student app I've used!",
      rating: 5
    },
    {
      id: 2,
      name: "Rahul Verma",
      role: "Class 12 Student",
      image: "👨‍🎓",
      content: "I used to struggle with organizing my notes and syllabus. The Resource Library and Syllabus tracker here are lifesavers. I feel much more prepared for my board exams now.",
      rating: 5
    },
    {
      id: 3,
      name: "Anjali Gupta",
      role: "Medical Aspirant",
      image: "👩‍⚕️",
      content: "The Study Timer with the Pomodoro technique is amazing. It helps me focus during long study sessions for NEET. Highly recommend the Career Pathways section too!",
      rating: 5
    },
    {
      id: 4,
      name: "Vikram Singh",
      role: "Computer Science Major",
      image: "👨‍💻",
      content: "The Interview Prep section is gold. The technical questions and HR tips helped me crack my internship interview. Thank you MARGDARSHAK team!",
      rating: 4
    },
    {
      id: 5,
      name: "Sneha Patel",
      role: "Commerce Student",
      image: "👩‍💼",
      content: "Finally, a platform that understands what students actually need. No clutter, just useful tools. The Scientific Calculator is super handy for my accounts homework.",
      rating: 5
    },
    {
      id: 6,
      name: "Arjun Reddy",
      role: "High Schooler",
      image: "👨‍🏫",
      content: "I love the dark mode themes! It makes studying at night so much easier on the eyes. The UI is beautiful and very fast.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans pt-20 pb-12">
      <AdSenseScript />
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Stories of Success
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of students who are achieving their academic goals with MARGDARSHAK. Here's what they have to say.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 relative hover:bg-white/10 transition-colors"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-white/10" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl border-2 border-black">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
                  />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-y border-white/10 py-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-gray-400">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-gray-400">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">1M+</div>
            <div className="text-gray-400">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-400">Uptime & Support</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white/5 rounded-3xl p-12 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-6">Create Your Own Success Story</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Experience the difference MARGDARSHAK can make in your studies. It's free to get started.
          </p>
          <Link to="/auth">
            <Button className="h-14 px-10 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold">
              Join MARGDARSHAK Today
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TestimonialsPage;
