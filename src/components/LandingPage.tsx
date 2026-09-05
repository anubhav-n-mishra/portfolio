"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useIsMobile, useMounted } from "@/lib/hooks"
import {
  Code2,
  Monitor,
  Smartphone,
  ArrowRight,
  Sparkles,
  Terminal,
  FolderTree,
  Palette,
  Layout,
  Zap,
  Globe,
} from "lucide-react"

interface LandingPageProps {
  onSelectIDE?: () => void
}

export default function LandingPage({ onSelectIDE }: LandingPageProps) {
  const router = useRouter()
  const mounted = useMounted()
  const isMobile = useIsMobile()
  const [hoveredOption, setHoveredOption] = useState<"ide" | "simple" | null>(null)

  useEffect(() => {
    // Only a real small screen redirects, and only once. This used to live inside the
    // resize handler, so every resize event queued another router.push.
    if (!isMobile) return
    const redirect = window.setTimeout(() => router.push("/portfolio"), 1800)
    return () => window.clearTimeout(redirect)
  }, [isMobile, router])

  const handleChoice = (choice: "ide" | "simple") => {
    localStorage.setItem("ide-experience", choice)
    if (choice === "ide") {
      if (onSelectIDE) {
        onSelectIDE()
      } else {
        window.location.reload()
      }
    } else {
      router.push("/portfolio")
    }
  }

  if (!mounted) return null

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <Smartphone className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-3">Mobile Detected</h1>
          <p className="text-gray-400 mb-8">Optimizing experience for your device...</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative selection:bg-blue-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 fixed">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center shadow-2xl shadow-blue-500/10"
          >
            <Code2 className="w-10 h-10 text-blue-400" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            Anubhav Mishra
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
            Product Engineer — bootloaders to multi-tenant SaaS
          </p>
        </motion.div>

        {/* Cards Container */}
        <div className="w-full max-w-4xl px-4 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* IDE Option */}
            <motion.button
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onClick={() => handleChoice("ide")}
              onMouseEnter={() => setHoveredOption("ide")}
              onMouseLeave={() => setHoveredOption(null)}
              className="group relative text-left"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl transition-opacity duration-500 ${hoveredOption === "ide" ? "opacity-100" : "opacity-0"}`}
              />
              <div className="relative bg-[#0a0a0a] border border-gray-800 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden flex flex-col h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent transition-opacity duration-500 ${hoveredOption === "ide" ? "opacity-100" : "opacity-0"}`}
                />

                <div className="relative z-10 flex flex-col h-full gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-colors">
                      <Monitor className="w-6 h-6 text-blue-400" />
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${hoveredOption === "ide" ? "translate-x-1" : ""}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      VS Code Experience
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      A working IDE. Browse the code, then actually run it \u2014 JavaScript, TypeScript, Python, C and C++.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-3">
                    <Tag icon={Terminal} label="Terminal" color="blue" />
                    <Tag icon={FolderTree} label="File System" color="cyan" />
                    <Tag icon={Zap} label="Interactive" color="yellow" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Classic Option */}
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onClick={() => handleChoice("simple")}
              onMouseEnter={() => setHoveredOption("simple")}
              onMouseLeave={() => setHoveredOption(null)}
              className="group relative text-left"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl transition-opacity duration-500 ${hoveredOption === "simple" ? "opacity-100" : "opacity-0"}`}
              />
              <div className="relative bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden flex flex-col h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent transition-opacity duration-500 ${hoveredOption === "simple" ? "opacity-100" : "opacity-0"}`}
                />

                <div className="relative z-10 flex flex-col h-full gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-colors">
                      <Layout className="w-6 h-6 text-purple-400" />
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${hoveredOption === "simple" ? "translate-x-1" : ""}`}
                    />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      Classic Portfolio
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      A modern, smooth-scrolling visual journey. Perfect for recruiters and visitors.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-3">
                    <Tag icon={Sparkles} label="Animated" color="purple" />
                    <Tag icon={Palette} label="Modern UI" color="pink" />
                    <Tag icon={Globe} label="Responsive" color="indigo" />
                  </div>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-sm text-gray-600 font-medium tracking-wide uppercase"
        >
          Select an interface to begin
        </motion.p>
      </div>
    </div>
  )
}

function Tag({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  color: "blue" | "cyan" | "yellow" | "purple" | "pink" | "indigo"
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}
    >
      <Icon size={12} />
      {label}
    </span>
  )
}
