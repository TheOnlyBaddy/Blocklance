export default function RoleSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select role">
      {['freelancer','client'].map(r => (
        <button key={r} type="button" onClick={()=>onChange(r)}
          role="radio" aria-checked={value===r}
          className={`glass-button py-2 ${value===r ? 'ring-2 ring-brand-mint/60' : ''}`}>
          {r === 'freelancer' ? 'Freelancer' : 'Client'}
        </button>
      ))}
    </div>
  )
}
