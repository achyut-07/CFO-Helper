import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Shield
} from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Financial Analysis',
      description: 'Real-time revenue vs expenses visualization with predictive analytics',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Smart Organization Setup',
      description: 'Tailored for events, companies, startups, and non-profit organizations',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Target,
      title: 'Interactive Forecasting',
      description: 'Circular and vertical sliders for intuitive financial planning',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Secure & Professional',
      description: 'Enterprise-grade security with Clerk authentication',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Startup Founder',
      company: 'TechVenture India',
      content: 'CFO Helper transformed how we plan our finances. The visual controls make complex forecasting simple.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Event Organizer',
      company: 'Elite Events Mumbai',
      content: 'Perfect for event planning! The runway calculations helped us avoid budget overruns.',
      rating: 5
    },
    {
      name: 'Anita Patel',
      role: 'CFO',
      company: 'GreenTech Solutions',
      content: 'The most intuitive financial planning tool I\'ve used. Great for presenting to investors.',
      rating: 5
    }
  ];

  const stats = [
    { value: '10K+', label: 'Simulations Run' },
    { value: '500+', label: 'Organizations' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl">
                <img 
                  src="/CFO Helper-logo.png" 
                  alt="CFO Helper Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Calculator className="w-8 h-8 text-emerald-600 hidden" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  CFO Helper
                </h1>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started Free
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-4">
                  🚀 Now with Advanced Authentication
                </span>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Smart Financial
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                    Planning for India
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Transform your business with AI-powered financial forecasting. 
                  Built specifically for Indian businesses - from startups to established companies.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <SignUpButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </SignUpButton>
                
                <button className="px-8 py-4 border-2 border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 font-semibold rounded-xl text-lg transition-all duration-300">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200 p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">Live Financial Dashboard</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-600">₹12.5L</div>
                      <div className="text-sm text-emerald-700">Monthly Revenue</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">₹8.7L</div>
                      <div className="text-sm text-blue-700">Monthly Expenses</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Size</span>
                    <span className="text-sm font-semibold text-emerald-600">25 employees</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg"
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-lg"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything you need for
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                Financial Success
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed for modern Indian businesses, from quick simulations to detailed forecasting.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-emerald-200 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Indian Businesses
            </h2>
            <p className="text-xl text-gray-600">See what our customers are saying</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-emerald-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Financial Planning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of Indian businesses using CFO Helper for smarter financial decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Free Trial
                </motion.button>
              </SignUpButton>
              
              <button className="px-8 py-4 border-2 border-white/30 text-white hover:border-white/50 hover:bg-white/10 font-semibold rounded-xl text-lg transition-all duration-300">
                Schedule Demo
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-8 text-sm opacity-75">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg">
                  <Calculator className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold">CFO Helper</span>
              </div>
              <p className="text-gray-400">
                Smart financial planning for modern Indian businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CFO Helper. All rights reserved. Built with ❤️ for Indian businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;