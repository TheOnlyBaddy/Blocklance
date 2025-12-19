import HeroIllustration from '../components/HeroIllustration.jsx'
import FreelancerCard from '../components/FreelancerCard.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import TestimonialCard from '../components/TestimonialCard.jsx'
import mockFreelancers from '../data/mockFreelancers.js'
import { Upload, Users, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const navigate = useNavigate()
  const categories = [
    { title: 'Web Development', desc: 'React, Node, Next.js' },
    { title: 'Design', desc: 'UI/UX, Branding' },
    { title: 'Blockchain', desc: 'Solidity, dApps' },
    { title: 'Writing', desc: 'Copy, Technical' },
  ]

  const steps = [
    { title: 'Post Project / Create Gig', desc: 'Share your needs or offer your services in minutes.', Icon: Upload },
    { title: 'Get Proposals / Connect', desc: 'Receive proposals and chat to find the perfect fit.', Icon: Users },
    { title: 'Payment / Complete Project', desc: 'Pay securely and track progress until delivery.', Icon: CheckCircle },
  ]

  const testimonials = [
    { quote: 'Found amazing talent in days!', rating: 4.9, author: 'Amit, Founder' },
    { quote: 'Seamless experience and great UI.', rating: 4.8, author: 'Sara, PM' },
    { quote: 'Love the glass design!', rating: 5.0, author: 'Leo, Designer' },
  ]

  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Hire elite Web2/Web3 talent with liquid-glass precision.</h1>
          <p className="text-[#4a4a4a]">Discover freelancers and clients, manage gigs and payments — traditional or blockchain — all in one modern marketplace.</p>
          <div className="flex gap-2 mb-4">
            <input className="flex-1 glass-input px-3 py-2" placeholder="Search skills, gigs, projects" />
            <button onClick={() => navigate('/signup')} className="glass-button px-4">Get Started</button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {['React','Solidity','Design','AI','Node'].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/50 text-[#1a1a1a]">{tag}</span>
            ))}
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Featured Freelancers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockFreelancers.slice(0,6).map(f => <FreelancerCard key={f.id} f={f} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c,i) => <CategoryCard key={i} c={c} />)}
        </div>
      </section>

      <section id="how">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map(({ title, desc, Icon }, idx) => (
            <motion.div
              key={idx}
              className="glass-card glass-strong p-6 text-center flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Icon className="h-9 w-9 text-[#007aff] opacity-90 mb-2" />
              <p className="font-semibold text-[#1a1a1a]">{title}</p>
              <p className="text-sm text-[#4a4a4a]">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Testimonials</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t,i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </section>
    </div>
  )
}
