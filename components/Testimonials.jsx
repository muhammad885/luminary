'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, ArrowRight, Quote, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Muhammad Ali",
    role: "Regular Customer",
    stars: 5,
    content:
      "Luminary Gift Store has been my go-to for gifts for over a year now. The quality and presentation are always exceptional, and my recipients absolutely love their gifts!",
  },
  {
    id: 2,
    name: "Michael Thompson",
    role: "Corporate Client",
    stars: 5,
    content:
      "We ordered custom gift baskets for our company's annual event, and Luminary exceeded all expectations. The attention to detail and professional service were outstanding.",
  },
  {
    id: 3,
    name: "Amina Ibrahim",
    role: "Happy Customer",
    stars: 4,
    content:
      "The perfume collection at Luminary is incredible. I found the perfect scent for my sister's birthday, and the gift wrapping made it look so luxurious!",
  },
  {
    id: 4,
    name: "Kolo Modu",
    role: "Repeat Customer",
    stars: 5,
    content:
      "What sets Luminary apart is their personalized service. They helped me select the perfect gift for my anniversary, and my wife was absolutely thrilled.",
  },
];

const Testimonials = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const handlePrevious = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + visibleCount < testimonials.length ? prev + 1 : prev
    );
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleTestimonials = testimonials.slice(
    startIndex,
    startIndex + visibleCount
  );

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-[#D4AF37]">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg">
            Don't just take our word for it. Here's what our valued customers have
            to say about their Luminary experience.
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group border border-[#D4AF37]/10 hover:border-[#D4AF37]/30"
                >
                  <div className="absolute top-4 right-4 text-[#D4AF37]/10 transform transition-transform duration-300 group-hover:scale-110">
                    <Quote size={48} />
                  </div>
                  
                  <div className="flex items-center mb-6 relative z-10">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-[#D4AF37]/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#D4AF37]/50" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] rounded-full p-1">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#D4AF37]/80 text-sm font-medium">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-4 text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.stars ? "fill-[#D4AF37]" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 leading-relaxed relative z-10">
                    "{testimonial.content}"
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          <div className="flex justify-center mt-12 space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 transform hover:scale-105"
              onClick={handlePrevious}
              disabled={startIndex === 0}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 transform hover:scale-105"
              onClick={handleNext}
              disabled={startIndex + visibleCount >= testimonials.length}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;