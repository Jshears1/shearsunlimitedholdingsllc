import { useEffect, useRef, useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Briefcase,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', ref: heroRef },
    { name: 'About', ref: aboutRef },
    { name: 'Services', ref: servicesRef },
    { name: 'Contact', ref: contactRef },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <span className="text-lg md:text-xl font-semibold tracking-tight">
                Shears Unlimited
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.ref)}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection(contactRef)}
                className="bg-white text-black hover:bg-gray-200 text-sm font-medium"
              >
                Get in Touch
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.ref)}
                  className="block w-full text-left text-gray-300 hover:text-white py-2 transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <Button 
                onClick={() => scrollToSection(contactRef)}
                className="w-full bg-white text-black hover:bg-gray-200 mt-4"
              >
                Get in Touch
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300">Limited Liability Company</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Shears Unlimited</span>
              <br />
              <span className="text-white">Holdings LLC</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A forward-thinking holding company dedicated to strategic investments, 
              business development, and creating lasting value across diverse industries.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => scrollToSection(contactRef)}
                className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-base font-medium group"
              >
                Contact Us
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => scrollToSection(aboutRef)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={aboutRef}
        className="py-20 md:py-32 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="animate-slide-in-left">
              <span className="text-sm text-gray-500 uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
                Building Value Through <span className="gradient-text">Strategic Vision</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Shears Unlimited Holdings LLC is a diversified holding company focused on 
                identifying and nurturing high-potential business opportunities. We partner 
                with innovative companies and entrepreneurs to drive growth and create 
                sustainable long-term value.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our approach combines deep industry expertise with strategic capital allocation 
                to support businesses at various stages of development. We believe in building 
                strong relationships with our partners and stakeholders.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <div className="text-3xl font-bold text-white mb-2">10+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
                <div className="glass rounded-xl p-6">
                  <div className="text-3xl font-bold text-white mb-2">Multiple</div>
                  <div className="text-sm text-gray-400">Industries</div>
                </div>
              </div>
            </div>
            
            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur-xl" />
                <div className="relative glass rounded-2xl p-8 md:p-12">
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Growth Focused</h3>
                        <p className="text-gray-400">We identify and invest in businesses with strong growth potential and scalable models.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Risk Management</h3>
                        <p className="text-gray-400">Prudent risk assessment and diversified portfolio approach to protect stakeholder interests.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Professional Excellence</h3>
                        <p className="text-gray-400">Committed to the highest standards of corporate governance and ethical business practices.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section 
        ref={servicesRef}
        className="py-20 md:py-32 relative bg-[#0f0f0f]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm text-gray-500 uppercase tracking-wider">What We Do</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We provide comprehensive holding company services focused on investment, 
              management, and business development across various sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Strategic Investments',
                description: 'Identifying and investing in high-potential businesses and emerging market opportunities with strong growth trajectories.'
              },
              {
                icon: <Building2 className="w-8 h-8" />,
                title: 'Business Development',
                description: 'Providing strategic guidance, operational support, and resources to help portfolio companies achieve their full potential.'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Asset Management',
                description: 'Professional management of diverse assets with a focus on long-term value creation and capital preservation.'
              },
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: 'Corporate Advisory',
                description: 'Expert advisory services for mergers, acquisitions, restructuring, and strategic business planning.'
              },
              {
                icon: <ChevronRight className="w-8 h-8" />,
                title: 'Partnership Opportunities',
                description: 'Building strategic partnerships and joint ventures to create synergies and unlock new market opportunities.'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Portfolio Growth',
                description: 'Continuous monitoring and optimization of investment portfolios to maximize returns and minimize risks.'
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="group glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={contactRef}
        className="py-20 md:py-32 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wider">Contact Us</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
                Let's <span className="gradient-text">Connect</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                Whether you're a potential creditor, business partner, or interested in 
                investment opportunities, we'd love to hear from you. Reach out to discuss 
                how we can work together.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <a 
                      href="mailto:info@shearsunlimitedholdings.com" 
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      info@shearsunlimitedholdings.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                    <a 
                      href="tel:+1-000-000-0000" 
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      Available upon request
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <span className="text-white">United States</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 md:p-10">
              <h3 className="text-2xl font-semibold mb-6">Send us a message</h3>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">First Name</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input 
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Subject</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <Button className="w-full bg-white text-black hover:bg-gray-200 py-6 text-base font-medium">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-white" />
              <span className="text-lg font-semibold">Shears Unlimited Holdings LLC</span>
            </div>
            
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.ref)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Shears Unlimited Holdings LLC. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              A Limited Liability Company
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
