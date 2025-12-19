import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function FloatingWizard({ steps, onFinish }){
  const [i, setI] = useState(0)
  const total = steps.length
  function next(){ if(i<total-1) setI(i+1); else onFinish?.() }
  function prev(){ if(i>0) setI(i-1) }
  const Step = steps[i]
  return (
    <div className="glass-card p-4 md:p-6 max-w-3xl mx-auto">
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4" aria-label="Progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(((i+1)/total)*100)}>
        <div className="h-full bg-gradient-to-r from-brand-mint to-brand-blue" style={{width: `${((i+1)/total)*100}%`}} />
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div key={i} initial={{x: 40, opacity:0}} animate={{x:0, opacity:1}} exit={{x:-40, opacity:0}}>
          <Step onNext={next} onPrev={prev} index={i} total={total} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
