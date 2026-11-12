import React from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <section className="relative overflow-hidden bg-stone-100/60 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Intent */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium tracking-widest text-stone-500 uppercase">
              Autumn · Winter Collection 2026
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Enduring forms for architectural living.
            </h1>

            <p className="text-base text-stone-600 leading-relaxed max-w-xl">
              Thoughtfully sculpted furniture, atmospheric warm brass luminaires, and slow-harvested botanical extracts crafted in small batches across European and Japanese workshops.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-sm"
              >
                <span>Browse the Collection</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Focal Point */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-xl bg-stone-200 border border-stone-300/60 shadow-sm">
              <img
                src="/src/assets/images/hero_lifestyle_lounge_1794469627385.jpg"
                alt="Architectural Scandinavian living room with modern sculptural lounge chair and fluted travertine table"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-stone-900/75 backdrop-blur-md text-stone-100 p-3 rounded-lg text-xs flex items-center justify-between">
                <span className="font-medium">Atelier Lounge Series & Honed Roman Travertine</span>
                <span className="text-stone-300 tabular-nums">From $890</span>
              </div>
            </div>
          </div>

        </div>

        {/* Claim-to-Proof Adjacency Strip */}
        <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-stone-600">
          <div>
            <div className="font-semibold text-stone-900 mb-0.5">Artisanal Provenance</div>
            <p className="text-stone-500">Hand-finished in Denmark, Japan, and Italy.</p>
          </div>
          <div>
            <div className="font-semibold text-stone-900 mb-0.5">Tactile Integrity</div>
            <p className="text-stone-500">Solid white oak, pure linen, and cast brass.</p>
          </div>
          <div>
            <div className="font-semibold text-stone-900 mb-0.5">Complimentary Delivery</div>
            <p className="text-stone-500">Insured global white-glove on orders over $150.</p>
          </div>
          <div>
            <div className="font-semibold text-stone-900 mb-0.5">Database Authority</div>
            <p className="text-stone-500 font-mono text-[11px]">Real-time MongoDB inventory decrement.</p>
          </div>
        </div>

      </div>
    </section>
  );
};
