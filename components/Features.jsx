import { Gift, Shield, Ribbon, Package, Star } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Premium Quality",
    description: "All our gifts are carefully selected to ensure the highest quality and elegance.",
    icon: <Star className="h-8 w-8 text-[#D4AF37]" />,
  },
  {
    id: 2,
    title: "Secure Payments",
    description: "Shop with confidence using our secure payment options and encryption.",
    icon: <Shield className="h-8 w-8 text-[#D4AF37]" />,
  },
  {
    id: 3,
    title: "Gift Wrapping",
    description: "Complimentary elegant gift wrapping service available for all purchases.",
    icon: <Ribbon className="h-8 w-8 text-[#D4AF37]" />,
  },
  {
    id: 4,
    title: "Custom Orders",
    description: "Special requirements? We can create custom gift packages just for you.",
    icon: <Gift className="h-8 w-8 text-[#D4AF37]" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-dark to-dark-light">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-4 text-[#D4AF37]">
          Our Premium Services
        </h2>
        <p className="text-cream-light/80 text-center mb-12 max-w-2xl mx-auto">
          We go beyond just selling gifts - we provide an exceptional gifting experience
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-dark-light/50 hover:bg-dark-light transition-all duration-300 rounded-xl p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 mb-4 rounded-full bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-playfair font-medium text-cream-light mb-2">
                  {feature.title}
                </h3>
                <p className="text-cream-light/70">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-[#D4AF37] hover:bg-[#F5D68E] text-dark font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/30">
            Explore Our Gift Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;