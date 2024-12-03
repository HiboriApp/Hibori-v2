import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Sun, Leaf, Wind } from 'lucide-react'

function FallingLeaf() {
  const randomLeft = `${Math.random() * 100}%`
  const randomDelay = Math.random() * 5
  const randomDuration = 3 + Math.random() * 2

  return (
    <motion.div
      initial={{ top: '-10%', left: randomLeft, rotate: 0 }}
      animate={{
        top: '110%',
        left: `calc(${randomLeft} + ${(Math.random() - 0.5) * 20}%)`,
        rotate: 360,
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute"
    >
      <Leaf className="text-green-400 w-6 h-6" />
    </motion.div>
  )
}

function Grass() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
      {[...Array(100)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute bottom-0 w-1 bg-green-500"
          style={{
            left: `${index}%`,
            height: `${Math.random() * 50 + 50}%`,
            transformOrigin: 'bottom',
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: index * 0.01 }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-green-600"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

function FloatingCloud({ left, delay } : { left: string, delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left }}
      initial={{ top: '10%', opacity: 0 }}
      animate={{ 
        top: ['10%', '15%', '10%'],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 20,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Cloud className="text-white w-16 h-16" />
    </motion.div>
  )
}

function BlowingWind() {
  return (
    <motion.div
      className="absolute top-1/4 left-0 w-full"
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Wind className="text-blue-300 w-full h-8" />
    </motion.div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen">
      <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-sky-200 overflow-hidden"
          >
            <motion.div
              className="absolute top-10 right-10 text-yellow-400"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <Sun size={64} />
            </motion.div>

            <Grass />

            {[...Array(3)].map((_, index) => (
              <FloatingCloud key={index} left={`${index * 30 + 10}%`} delay={index * 2} />
            ))}

            {[...Array(20)].map((_, index) => (
              <FallingLeaf key={index} />
            ))}

            <BlowingWind />
          </motion.div>
      </AnimatePresence>
    </main>
  )
}

