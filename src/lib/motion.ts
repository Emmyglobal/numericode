export const fadeUp   = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }
export const fadeIn   = { hidden: { opacity: 0 },         show: { opacity: 1, transition: { duration: 0.25 } } }
export const scaleIn  = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.2 } } }
export const stagger  = (delay = 0.08) => ({ show: { transition: { staggerChildren: delay } } })
