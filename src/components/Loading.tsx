'use client'

import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

const SuperEnhancedLoading = () => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime + 1) % 24)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const skyColor = `hsl(${200 + time * 10}, 70%, ${70 - time * 2}%)`

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{ background: skyColor }}>
      <style jsx global>{`
        @keyframes sway {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <Sun time={time} />
      <Moon time={time} />
      <Stars time={time} />
      <Mountains />
      <Flowers />
      <Clouds />
      <Rainbow />
      <Rain time={time} />
      <Trampoline />
      <Kids />
      <FallingLeaves />
      <Butterflies />
      <LoadingText />
    </div>
  )
}

const Sun = ({ time }) => (
  <motion.div
    className="absolute w-20 h-20 bg-yellow-400 rounded-full"
    style={{
      boxShadow: '0 0 40px 15px rgba(255, 255, 0, 0.3)',
    }}
    animate={{
      top: ['20%', '80%'],
      left: ['0%', '100%'],
      scale: [1, 1.2, 1],
    }}
    transition={{
      repeat: Infinity,
      duration: 24,
      ease: 'linear',
    }}
  />
)

const Moon = ({ time }) => (
  <motion.div
    className="absolute w-16 h-16 bg-gray-200 rounded-full"
    style={{
      boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.3)',
    }}
    animate={{
      top: ['80%', '20%'],
      left: ['100%', '0%'],
      opacity: [0, 1, 0],
    }}
    transition={{
      repeat: Infinity,
      duration: 24,
      ease: 'linear',
    }}
  />
)

const Stars = ({ time }) => (
  <>
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          top: `${Math.random() * 50}%`,
          left: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: time > 18 || time < 6 ? [0, 1] : 0,
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </>
)

const Mountains = () => (
  <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="#4CAF50" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,224C672,213,768,171,864,149.3C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    <path fill="#2E7D32" d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,192C672,192,768,160,864,154.7C960,149,1056,171,1152,186.7C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
  </svg>
)

const Flowers = () => (
  <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bottom-0 w-4 h-16"
        style={{
          left: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="w-4 h-16 rounded-full"
          style={{
            background: `linear-gradient(to top, ${['#FF69B4', '#FF1493', '#FF00FF', '#BA55D3'][Math.floor(Math.random() * 4)]}, #4CAF50)`,
            animation: `sway ${2 + Math.random()}s ease-in-out infinite alternate`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-300 rounded-full"></div>
        </div>
      </motion.div>
    ))}
  </div>
)

const Clouds = () => (
  <>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-24 h-24 bg-white rounded-full opacity-80"
        style={{
          top: `${Math.random() * 30}%`,
          left: `-20%`,
        }}
        animate={{
          x: ['0%', '120%'],
        }}
        transition={{
          duration: 20 + Math.random() * 10,
          repeat: Infinity,
          ease: 'linear',
          delay: i * 2,
        }}
      >
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
      </motion.div>
    ))}
  </>
)

const Rainbow = () => (
  <motion.div
    className="absolute w-full h-64 opacity-50"
    style={{
      background: 'linear-gradient(to bottom, red, orange, yellow, green, blue, indigo, violet)',
      clipPath: 'ellipse(50% 50% at 50% 100%)',
    }}
    initial={{ y: '100%' }}
    animate={{ y: '70%' }}
    transition={{
      duration: 5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    }}
  />
)

const Rain = ({ time }) => (
  <>
    {time > 18 || time < 6 ? (
      [...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-0.5 h-4 bg-blue-400 opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: ['0%', '100vh'],
          }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random(),
          }}
        />
      ))
    ) : null}
  </>
)

const Trampoline = () => (
  <motion.div
    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-16"
    animate={{
      y: [0, -5, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <div className="w-full h-2 bg-gray-800 rounded-full"></div>
    <div className="absolute top-2 left-4 w-2 h-14 bg-gray-700 rounded-full transform -rotate-12"></div>
    <div className="absolute top-2 right-4 w-2 h-14 bg-gray-700 rounded-full transform rotate-12"></div>
  </motion.div>
)

const Kids = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bottom-36 w-8 h-12"
        style={{
          left: `${20 + i * 15}%`,
        }}
        animate={{
          y: [0, -100, 0],
          rotate: i % 2 === 0 ? [0, 360, 0] : [0, 0, 0],
        }}
        transition={{
          duration: 2 + Math.random(),
          repeat: Infinity,
          ease: 'easeInOut',
          delay: i * 0.2,
        }}
      >
        <div
          className="w-8 h-8 rounded-full"
          style={{ background: ['#FF69B4', '#FF6347', '#4169E1', '#32CD32', '#FFD700'][i] }}
        ></div>
        <div className="w-8 h-4 bg-blue-500"></div>
      </motion.div>
    ))}
  </>
)

const FallingLeaves = () => (
  <>
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-0 w-4 h-4 rounded-full opacity-60"
        style={{
          left: `${Math.random() * 100}%`,
          background: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2691E'][Math.floor(Math.random() * 5)],
        }}
        animate={{
          y: ['0%', '100vh'],
          rotate: [0, 360],
          x: ['-10%', '10%'],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 5,
        }}
      />
    ))}
  </>
)

const Butterflies = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-4"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          x: [0, Math.random() * 100 - 50],
          y: [0, Math.random() * 100 - 50],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="w-2 h-3 rounded-full"
          style={{ background: ['#FF69B4', '#FF6347', '#4169E1', '#32CD32', '#FFD700'][Math.floor(Math.random() * 5)] }}
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        <motion.div
          className="w-2 h-3 rounded-full"
          style={{ background: ['#FF69B4', '#FF6347', '#4169E1', '#32CD32', '#FFD700'][Math.floor(Math.random() * 5)] }}
          animate={{ rotate: [0, -10, 0, 10, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </motion.div>
    ))}
  </>
)

const LoadingText = () => (
  <motion.div
    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    Loading...
  </motion.div>
)

export default SuperEnhancedLoading

