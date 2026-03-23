import { motion } from 'framer-motion'

const variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.7, ease: [0.21, 0.9, 0.2, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
