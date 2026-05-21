import { useState, useEffect, useRef } from 'react'
import { GraduationCap, Cpu, Users, Building2, HandHeart, Target, TrendingUp, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../translations/LanguageContext'

function WhatYouCanSupport() {
  const { t } = useLanguage()
  const [currentProgress, setCurrentProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const sectionRef = useRef(null)
  const annualGoal = 100000000

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    fetchTotalDonaciones()
    const interval = setInterval(fetchTotalDonaciones, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isVisible && !loading) {
      const targetPercentage = calculatePercentage()
      let current = 0
      const increment = targetPercentage / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= targetPercentage) {
          setAnimatedProgress(targetPercentage)
          clearInterval(timer)
        } else {
          setAnimatedProgress(current)
        }
      }, 30)
      return () => clearInterval(timer)
    }
  }, [isVisible, loading, currentProgress])

  const fetchTotalDonaciones = async () => {
    try {
      const response = await api.get('/submissions')
      let donaciones = []
      if (Array.isArray(response.data)) {
        donaciones = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        donaciones = response.data.data
      }
      const total = donaciones.reduce((acc, donacion) => {
        return acc + (Number(donacion.total) || 0)
      }, 0)
      setCurrentProgress(total)
    } catch (error) {
      console.error('Error al cargar donaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const macroCategories = [
    {
      icon: HandHeart,
      title: t('programs.tcsInAction'),
      color: '#EC008C',
      subprograms: [
        { icon: Users, title: t('programs.social'), description: t('programs.socialDesc') },
        { icon: HandHeart, title: t('programs.volunteering'), description: t('programs.volunteeringDesc') },
      ]
    },
    {
      icon: GraduationCap,
      title: t('programs.educationForAll'),
      color: '#00A9E0',
      subprograms: [
        { icon: GraduationCap, title: t('programs.scholarships'), description: t('programs.scholarshipsDesc') },
        { icon: Cpu, title: t('programs.robotics'), description: t('programs.roboticsDesc') },
        { icon: Building2, title: t('programs.infrastructure'), description: t('programs.infrastructureDesc') },
      ]
    },
    {
      icon: Users,
      title: t('programs.columbusByColumbus'),
      color: '#92c83e',
      subprograms: [
        { icon: HandHeart, title: t('programs.familiesTCS'), description: t('programs.familiesTCSDesc') },
      ]
    },
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const calculatePercentage = () => {
    return Math.min(Math.round((currentProgress / annualGoal) * 100), 100)
  }

  const getProgressMessage = () => {
    const percentage = calculatePercentage()
    if (percentage === 0) return t('impact.progressStart')
    if (percentage < 25) return t('impact.progressUnder25').replace('{percent}', percentage)
    if (percentage < 50) return t('impact.progressUnder50').replace('{percent}', percentage)
    if (percentage < 75) return t('impact.progressUnder75').replace('{percent}', percentage)
    if (percentage < 100) return t('impact.progressUnder100').replace('{remaining}', (100 - percentage))
    return t('impact.progressComplete')
  }

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Decoraciones de fondo animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-slow"
            style={{
              width: `${4 + Math.random() * 4}px`,
              height: `${4 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? '#004990' : '#92c83e',
              opacity: 0.2,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`
          text-center mb-12
          transition-all duration-1000 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#004990' }}>
            {t('impact.title')}
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full mb-4 overflow-hidden" style={{ backgroundColor: '#92c83e' }}>
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('impact.subtitle')}
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {macroCategories.map((macro, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden shadow-md border-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              style={{ borderColor: macro.color, transitionDelay: `${index * 120}ms` }}
            >
              {/* Cabecera macro */}
              <div
                className="flex items-center gap-4 px-6 py-4"
                style={{ backgroundColor: macro.color }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <macro.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-black text-white tracking-wide">{macro.title}</h3>
              </div>

              {/* Sub-programas */}
              {macro.subprograms.length > 0 && (
                <div className="bg-white divide-y divide-gray-100">
                  {macro.subprograms.map((sub, si) => (
                    <div key={si} className="flex items-start gap-4 px-6 py-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#004990' }}
                      >
                        <sub.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1" style={{ color: '#004990' }}>{sub.title}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{sub.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {macro.subprograms.length === 0 && (
                <div className="bg-white px-6 py-4 text-gray-400 text-sm italic">
                  Próximamente
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes shimmer-progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes border-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes number-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.8);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float-slow {
          animation: float-slow linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .animate-shimmer-progress {
          animation: shimmer-progress 2s linear infinite;
        }

        .animate-border-pulse {
          animation: border-pulse 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-number-pop {
          animation: number-pop 0.5s ease-out;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 1s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}

export default WhatYouCanSupport