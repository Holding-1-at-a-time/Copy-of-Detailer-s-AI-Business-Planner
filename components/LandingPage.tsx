
import React, { useState } from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm" aria-label="Main Navigation">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2" aria-label="Homepage">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-2xl font-bold">Detailer's AI Planner</span>
          </a>
          <div className="flex items-center space-x-6">
            <a href="/pricing" className="text-gray-300 hover:text-white transition font-medium">Pricing</a>
            <button onClick={onLogin} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_50%)]" aria-hidden="true"></div>
          <div className="container mx-auto px-6 relative">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
              Stop Guessing. Start Growing.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              The all-in-one car detailing software for professionals. Track jobs, manage goals, and get AI-powered business insights to drive your shop forward.
            </p>
            <button onClick={onLogin} className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-lg shadow-cyan-500/30">
              Start Your 7-Day Free Trial
            </button>
            <p className="text-sm text-gray-500 mt-4">No credit card required for trial.</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-800/50" aria-labelledby="features-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold">Everything Your Detailing Business Needs to Scale</h2>
              <p className="text-gray-400 mt-2">From granular job logging to AI-driven strategy, we've got you covered.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard title="Granular Job Logging" description="Quickly log every job with details like service type, value, and lead source. Ditch the clunky spreadsheets for good." />
              <FeatureCard title="Automated Analytics" description="Your key metrics—revenue, customer acquisition, and job profitability—are calculated automatically. See your business at a glance." />
              <FeatureCard title="AI Business Consultant" description="Chat with your AI assistant 24/7. Get data-driven advice, spot trends, and find opportunities you might have missed." />
              <FeatureCard title="Actionable Goal Tracking" description="Set clear business goals and track your progress in real-time. Let our AI generate step-by-step action plans to help you succeed." />
              <FeatureCard title="Multi-Location Ready" description="Manage multiple shops or business entities from a single, unified account with our seamless organization switcher." />
              <FeatureCard title="Secure Team Management" description="Invite your team members, assign admin or member roles, and control permissions. Built for secure collaboration from day one." />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20" aria-labelledby="pricing-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-gray-400 mt-2">Choose the plan that's right for your business. Cancel anytime.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard plan="Solo" price="$29" features={['Unlimited Job Logging', 'Automated Analytics', 'AI Chat Assistant', 'Goal Tracking']} />
              <PricingCard plan="Pro" price="$79" features={['Everything in Solo, plus:', 'AI-Generated Action Plans', 'Team & Role Management', 'Multi-Organization Support', 'Priority Support']} isFeatured={true} />
              <PricingCard plan="Enterprise" price="Contact Us" features={['Everything in Pro, plus:', 'Custom Integrations', 'Dedicated Account Manager', 'Advanced Security & SSO', 'On-premise AI Models']} />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-800/50" aria-labelledby="testimonials-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold">Trusted by Detailers Like You</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Testimonial author="Mike R., Pristine Auto" text="This tool is a game-changer. I finally have a clear picture of my numbers, and the AI insights helped me identify my most profitable service." />
              <Testimonial author="Sarah L., Gleam Team Detailing" text="I was skeptical about the AI, but it's like having a business coach on call. It helped me set and hit my revenue goals for Q3. Highly recommend!" />
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20" aria-labelledby="faq-heading">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              <FaqItem
                question="How does the AI consultant work?"
                answer="Our AI analyzes the job data and goals you input in real-time. It's trained to identify trends in revenue, customer sources, and service profitability specific to the detailing industry. It then provides actionable advice through the chat interface to help you make smarter business decisions."
              />
              <FaqItem
                question="Is my business data secure?"
                answer="Absolutely. Data security is our top priority. All your business data is encrypted both in transit and at rest. We never share your data with third parties, and the AI models only use your data to generate insights for you within your secure session."
              />
              <FaqItem
                question="What happens after my 7-day free trial ends?"
                answer="After your free trial, you'll be prompted to choose a paid plan to continue using the service. We don't require a credit card to start the trial, so you will not be automatically charged. Your data will be waiting for you when you decide to subscribe."
              />
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-8" role="contentinfo">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Detailer's AI Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Sub-components for Landing Page
const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/20">
    <h3 className="text-xl font-bold text-cyan-400 mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const PricingCard: React.FC<{ plan: string; price: string; features: string[]; isFeatured?: boolean }> = ({ plan, price, features, isFeatured }) => (
  <div className={`border rounded-lg p-6 flex flex-col ${isFeatured ? 'border-cyan-500 bg-gray-800' : 'border-gray-700'}`}>
    <h3 className="text-2xl font-bold">{plan}</h3>
    <p className="text-4xl font-bold my-4">{price}<span className="text-base font-normal text-gray-400">{price.startsWith('$') ? ' / mo' : ''}</span></p>
    <ul className="space-y-2 text-gray-300 mb-6 flex-grow" aria-label={`Features for ${plan} plan`}>
      {features.map((feature, i) => (
        <li key={i} className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {feature}
        </li>
      ))}
    </ul>
    <a href="/pricing" className={`block w-full text-center font-bold py-3 px-6 rounded-lg transition ${isFeatured ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
      {plan === 'Enterprise' ? 'Contact Sales' : 'Choose Plan'}
    </a>
  </div>
);

const Testimonial: React.FC<{ text: string; author: string }> = ({ text, author }) => (
  <blockquote className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <p className="text-gray-300 italic">"{text}"</p>
    <cite className="text-cyan-400 font-bold mt-4 block not-italic">- {author}</cite>
  </blockquote>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-200 hover:text-cyan-400 focus:outline-none transition"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
            <p className="text-gray-400 pr-10 pt-4">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
