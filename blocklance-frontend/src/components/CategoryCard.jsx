import GlassCard from './GlassCard.jsx'
import { motion } from 'framer-motion'
import { Palette, Code, Megaphone, FileText, PenTool, Brain, Database, Network, ShieldCheck, Sparkles } from 'lucide-react'

export default function CategoryCard({ c }){
  const t = (c?.title || '').toLowerCase()
  const Icon =
    t.includes('design') ? Palette :
    t.includes('develop') || t.includes('web') || t.includes('frontend') || t.includes('backend') ? Code :
    t.includes('market') ? Megaphone :
    t.includes('writing') ? PenTool :
    t.includes('ai') ? Brain :
    t.includes('data') ? Database :
    t.includes('blockchain') || t.includes('web3') ? Network :
    t.includes('security') ? ShieldCheck : Sparkles
  return (
    <GlassCard className="p-4 glass-strong">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
        <Icon className="h-7 w-7 mb-2 text-[#007aff] opacity-90" />
        <p className="font-semibold text-[#1a1a1a]">{c.title}</p>
        <p className="text-sm text-[#4a4a4a]">{c.desc}</p>
      </motion.div>
    </GlassCard>
  )
}
