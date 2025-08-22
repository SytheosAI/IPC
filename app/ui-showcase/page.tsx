'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Cpu, 
  Globe, 
  Layers, 
  Hexagon,
  Triangle,
  Square,
  Circle,
  Star,
  Grid3x3,
  Box
} from 'lucide-react'

export default function UIShowcase() {
  const [activeTab, setActiveTab] = useState('buttons')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Abstract Decoration */}
        <div className="text-center mb-12 relative abstract-dots">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            IPC UI Showcase
          </h1>
          <p className="text-gray-300 text-lg">Modern, sophisticated design system with depth and elegance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-morphism rounded-2xl p-2 flex gap-2">
            {['buttons', 'cards', 'gradients', 'borders', 'shapes', 'effects'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl capitalize transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Button Showcase */}
        {activeTab === 'buttons' && (
          <div className="grid gap-8">
            <section className="card-modern p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Enhanced Buttons
              </h2>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">
                  Primary Button
                </button>
                <button className="btn-secondary">
                  Secondary Button
                </button>
                <button className="btn-primary rounded-full">
                  Rounded Primary
                </button>
                <button className="btn-secondary border-animated rounded-xl">
                  Animated Border
                </button>
                <button className="glass-morphism px-6 py-3 rounded-xl text-white hover:scale-105 transition-transform">
                  Glass Button
                </button>
                <button className="neumorphism px-6 py-3 text-gray-700 hover:scale-105 transition-transform">
                  Neumorphic
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Card Showcase */}
        {activeTab === 'cards' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-modern p-6 relative abstract-corner-tl abstract-corner-br">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Modern Card</h3>
              <p className="text-gray-300">Glass morphism with abstract corners and hover effects</p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 hover:scale-105 transition-transform">
              <Cpu className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Glass Effect</h3>
              <p className="text-gray-300">Transparent backdrop with blur effect</p>
            </div>
            
            <div className="neumorphism p-6">
              <Globe className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Neumorphism</h3>
              <p className="text-gray-600">Soft shadows creating depth</p>
            </div>
            
            <div className="border-gradient rounded-2xl p-6 bg-gray-900">
              <Layers className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Gradient Border</h3>
              <p className="text-gray-300">Dynamic gradient border effect</p>
            </div>
            
            <div className="border-animated rounded-2xl p-6 bg-gray-900">
              <Sparkles className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Animated Border</h3>
              <p className="text-gray-300">Flowing animated gradient border</p>
            </div>
            
            <div className="border-glow rounded-2xl p-6 bg-gray-900">
              <Star className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Glow Border</h3>
              <p className="text-gray-300">Soft glowing border effect</p>
            </div>
          </div>
        )}

        {/* Gradient Showcase */}
        {activeTab === 'gradients' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="gradient-mesh rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Mesh Gradient</h3>
                <p className="text-gray-300">Complex radial gradient mesh</p>
              </div>
            </div>
            
            <div className="gradient-aurora rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Aurora Effect</h3>
                <p className="text-gray-100">Animated color flow</p>
              </div>
            </div>
            
            <div className="gradient-holographic rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Holographic</h3>
                <p className="text-gray-100">Iridescent animated gradient</p>
              </div>
            </div>
            
            <div className="gradient-sky rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Sky Gradient</h3>
                <p className="text-gray-100">Classic diagonal gradient</p>
              </div>
            </div>
          </div>
        )}

        {/* Border Showcase */}
        {activeTab === 'borders' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-gradient rounded-xl p-6 bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gradient Border</h3>
              <p className="text-gray-600">Static gradient border using CSS masks</p>
            </div>
            
            <div className="border-animated rounded-xl p-6 bg-gray-900">
              <h3 className="text-xl font-bold text-white mb-2">Animated Border</h3>
              <p className="text-gray-300">Flowing gradient animation</p>
            </div>
            
            <div className="border-glow rounded-xl p-6 bg-gray-900">
              <h3 className="text-xl font-bold text-white mb-2">Glow Border</h3>
              <p className="text-gray-300">Multiple shadow layers for glow</p>
            </div>
            
            <div className="relative abstract-corner-tl abstract-corner-br rounded-xl p-6 bg-gray-900">
              <h3 className="text-xl font-bold text-white mb-2">Corner Accents</h3>
              <p className="text-gray-300">Abstract corner decorations</p>
            </div>
            
            <div className="abstract-circuit rounded-xl p-6 bg-gray-900">
              <h3 className="text-xl font-bold text-white mb-2">Circuit Pattern</h3>
              <p className="text-gray-300">Tech-inspired circuit decoration</p>
            </div>
            
            <div className="border-2 border-dashed border-blue-400 rounded-xl p-6 bg-gray-900/50">
              <h3 className="text-xl font-bold text-white mb-2">Dashed Border</h3>
              <p className="text-gray-300">Simple dashed border style</p>
            </div>
          </div>
        )}

        {/* Shape Showcase */}
        {activeTab === 'shapes' && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="shape-hexagon bg-gradient-to-br from-blue-500 to-purple-600 w-32 h-32 flex items-center justify-center mx-auto">
              <Hexagon className="text-white" />
            </div>
            
            <div className="shape-diamond bg-gradient-to-br from-green-500 to-teal-600 w-32 h-32 flex items-center justify-center mx-auto">
              <Square className="text-white rotate-45" />
            </div>
            
            <div className="shape-pentagon bg-gradient-to-br from-orange-500 to-red-600 w-32 h-32 flex items-center justify-center mx-auto">
              <Star className="text-white" />
            </div>
            
            <div className="shape-chevron bg-gradient-to-br from-pink-500 to-purple-600 w-32 h-32 flex items-center justify-center mx-auto">
              <Triangle className="text-white" />
            </div>
          </div>
        )}

        {/* Special Effects */}
        {activeTab === 'effects' && (
          <div className="grid gap-8">
            <section className="glass-morphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Glass Morphism</h2>
              <p className="text-gray-300 mb-4">Transparent glass-like effect with backdrop blur</p>
              <div className="flex gap-4">
                <div className="badge-glow">Glowing Badge</div>
                <div className="badge-premium">Premium</div>
                <div className="ai-badge">AI Powered</div>
              </div>
            </section>
            
            <section className="neumorphism p-8">
              <h2 className="text-2xl font-bold text-gray-700 mb-6">Neumorphism Light</h2>
              <p className="text-gray-600 mb-4">Soft, extruded appearance using shadows</p>
              <div className="flex gap-4">
                <div className="neumorphism-inset px-4 py-2">Inset Style</div>
                <input className="neumorphism-inset px-4 py-2 outline-none" placeholder="Neumorphic Input" />
              </div>
            </section>
            
            <section className="card-modern p-8 abstract-dots">
              <h2 className="text-2xl font-bold text-white mb-6">Abstract Symbols</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="relative abstract-corner-tl abstract-corner-br glass-morphism rounded-xl p-4">
                  <p className="text-white">Corner Accents</p>
                </div>
                <div className="abstract-circuit glass-morphism rounded-xl p-4">
                  <p className="text-white">Circuit Pattern</p>
                </div>
                <div className="relative abstract-dots glass-morphism rounded-xl p-4 pt-8">
                  <p className="text-white">Hex Dots</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Input Examples */}
        <div className="mt-12 card-modern p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Enhanced Inputs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <input 
              type="text" 
              placeholder="Modern input with glass effect" 
              className="input-modern"
            />
            <select className="input-modern">
              <option>Select an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <textarea 
              placeholder="Modern textarea with enhanced styling" 
              className="input-modern"
              rows={3}
            />
            <div className="flex gap-2">
              <button className="btn-primary flex-1">Submit</button>
              <button className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}