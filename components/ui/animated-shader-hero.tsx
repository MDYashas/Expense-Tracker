"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TrustBadge {
  text: string
  icons?: string[]
}

interface Headline {
  line1: string
  line2: string
}

interface Button {
  text: string
  onClick: () => void
}

interface Buttons {
  primary: Button
  secondary: Button
}

interface HeroProps {
  trustBadge?: TrustBadge
  headline: Headline
  subtitle: string
  buttons: Buttons
  className?: string
}

const Hero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className
}) => {
  return (
    <div className={cn(
      "relative min-h-screen w-full overflow-hidden",
      "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900",
      className
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Trust Badge */}
        {trustBadge && (
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm">
              {trustBadge.icons?.map((icon, idx) => (
                <span key={idx}>{icon}</span>
              ))}
              <span>{trustBadge.text}</span>
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="text-center mb-6 animate-slide-up">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-2">
            {headline.line1}
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {headline.line2}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-center text-lg md:text-xl text-white/70 max-w-2xl mb-10 animate-slide-up delay-200">
          {subtitle}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-300">
          <button
            onClick={buttons.primary.onClick}
            className="group relative px-8 py-4 rounded-lg font-semibold text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-opacity group-hover:opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <span className="relative z-10 flex items-center gap-2">
              {buttons.primary.text}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button
            onClick={buttons.secondary.onClick}
            className="group px-8 py-4 rounded-lg font-semibold text-white border-2 border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              {buttons.secondary.text}
              <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-lg backdrop-blur-sm border border-white/10 animate-float" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-500/10 rounded-full backdrop-blur-sm border border-white/10 animate-float delay-1000" />
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-pink-500/10 rounded-full backdrop-blur-sm border border-white/10 animate-float delay-500" />
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Hero
