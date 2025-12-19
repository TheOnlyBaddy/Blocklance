export default function GlassCard({ className = '', children, ...props }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  )
}
