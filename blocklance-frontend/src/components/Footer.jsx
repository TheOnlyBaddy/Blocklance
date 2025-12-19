import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Github, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#f8f9fb] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent" />
              <span className="font-semibold text-[#1a1a1a]">Blocklance</span>
            </div>
            <p className="text-[#4a4a4a] text-sm">The future of freelancing, powered by blockchain technology.</p>
          </div>

          <div>
            <p className="text-xs tracking-wider font-semibold text-[#1a1a1a] uppercase mb-3">For Freelancers</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/create-gig" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Create Gig</Link></li>
              <li><Link to="/dashboard/freelancer" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Dashboard</Link></li>
              <li><Link to="/messages" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Messages</Link></li>
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Withdraw Earnings</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-wider font-semibold text-[#1a1a1a] uppercase mb-3">For Clients</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/post-project" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Post Project</Link></li>
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Browse Freelancers</a></li>
              <li><Link to="/dashboard/client" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Dashboard</Link></li>
              <li><Link to="/payments" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Payments</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-wider font-semibold text-[#1a1a1a] uppercase mb-3">Resources</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Help Center</a></li>
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Blog</a></li>
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">FAQs</a></li>
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Terms of Service</a></li>
              <li><a href="#" className="text-[#4a4a4a] hover:text-[#007aff] hover:underline transition">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-wider font-semibold text-[#1a1a1a] uppercase mb-3">Connect</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Twitter" className="text-[#007aff] hover:brightness-110 transition"><Twitter className="h-5 w-5" /></a>
              <a href="#" aria-label="LinkedIn" className="text-[#007aff] hover:brightness-110 transition"><Linkedin className="h-5 w-5" /></a>
              <a href="#" aria-label="Discord" className="text-[#007aff] hover:brightness-110 transition"><MessageCircle className="h-5 w-5" /></a>
              <a href="#" aria-label="GitHub" className="text-[#007aff] hover:brightness-110 transition"><Github className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-black/10 text-center">
          <p className="text-[#666] text-sm">© 2025 Blocklance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
