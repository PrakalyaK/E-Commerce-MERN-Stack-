import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-serif text-stone-100 tracking-tight">AURA LIVING</h2>
            <p className="text-stone-400 max-w-md leading-relaxed">
              A bespoke digital storefront devoted to architectural furniture, meditative lighting, and slow botanicals. Built with React, Node.js, Express, and a high-performance MongoDB document store.
            </p>
            <div className="pt-2 text-[11px] text-stone-500 font-mono">
              Database: <span className="text-emerald-400">aura_living_db</span> · Powered by Node.js & Express REST Engine
            </div>
          </div>

          {/* Curated Categories */}
          <div className="space-y-3">
            <h3 className="text-stone-100 font-medium tracking-wide uppercase text-[11px]">Collections</h3>
            <ul className="space-y-2 text-stone-400">
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Living & Furniture</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Lighting & Ambience</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Home Fragrance</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Textiles & Wear</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Limited Editions</span></li>
            </ul>
          </div>

          {/* Client Care & Guarantee */}
          <div className="space-y-3">
            <h3 className="text-stone-100 font-medium tracking-wide uppercase text-[11px]">Client Care</h3>
            <ul className="space-y-2 text-stone-400">
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Insured White-Glove Shipping</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">30-Day In-Home Trial</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">5-Year Structural Guarantee</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Architect & Trade Inquiries</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Cash on Delivery Policy</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} AURA LIVING Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-400 transition-colors cursor-pointer">Privacy Notice</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-stone-400 transition-colors cursor-pointer">Terms of Purchase</span>
            <span aria-hidden="true">·</span>
            <span className="hover:text-stone-400 transition-colors cursor-pointer">Sustainability Report</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
