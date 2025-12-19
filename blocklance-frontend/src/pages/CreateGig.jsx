import FloatingWizard from '../components/FloatingWizard.jsx'

function Step1({ onNext }){
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Basic Info</h3>
      <input className="glass-input w-full px-3 py-2" placeholder="Gig Title" />
      <input className="glass-input w-full px-3 py-2" placeholder="Category, Tags" />
      <div className="flex gap-2"><button onClick={onNext} className="glass-button px-4 py-2">Next</button></div>
    </div>
  )
}
function Step2({ onNext, onPrev }){
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Description & Skills</h3>
      <textarea className="glass-input w-full px-3 py-2" rows={5} placeholder="Describe your gig" />
      <div className="flex gap-2"><button onClick={onPrev} className="glass-button px-4 py-2">Back</button><button onClick={onNext} className="glass-button px-4 py-2">Next</button></div>
    </div>
  )
}
function Step3({ onNext, onPrev }){
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Pricing Tiers</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {['Basic','Standard','Premium'].map(t => (
          <div key={t} className="glass-card p-3"><p className="font-medium">{t}</p><input className="glass-input w-full px-3 py-2 mt-2" placeholder="Price" /></div>
        ))}
      </div>
      <div className="flex gap-2"><button onClick={onPrev} className="glass-button px-4 py-2">Back</button><button onClick={onNext} className="glass-button px-4 py-2">Next</button></div>
    </div>
  )
}
function Step4({ onNext, onPrev }){
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Gallery Uploads</h3>
      <div className="glass-card h-28 flex items-center justify-center">Drag & drop images</div>
      <div className="flex gap-2"><button onClick={onPrev} className="glass-button px-4 py-2">Back</button><button onClick={onNext} className="glass-button px-4 py-2">Next</button></div>
    </div>
  )
}
function Step5({ onPrev }){
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Review & Publish</h3>
      <div className="glass-card p-3">Summary preview...</div>
      <div className="flex gap-2"><button onClick={onPrev} className="glass-button px-4 py-2">Back</button><button className="glass-button px-4 py-2">Publish</button></div>
    </div>
  )
}

export default function CreateGig(){
  return <FloatingWizard steps={[Step1, Step2, Step3, Step4, Step5]} />
}
