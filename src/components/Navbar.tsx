import React from 'react';
import { ShoppingBag, Database, PackageCheck, Search, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMongoConsole: () => void;
  onOpenOrders: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenMongoConsole,
  onOpenOrders,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const [showSearchInput, setShowSearchInput] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Single element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('all');
            }}
            className="text-xl sm:text-2xl font-serif tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            AURA LIVING
          </a>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => onSelectCategory('all')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'all'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-[2px]'
                  : ''
              }`}
            >
              All Pieces
            </button>
            <button
              onClick={() => onSelectCategory('living')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'living'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-[2px]'
                  : ''
              }`}
            >
              Living & Furniture
            </button>
            <button
              onClick={() => onSelectCategory('lighting')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'lighting'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-[2px]'
                  : ''
              }`}
            >
              Lighting & Ambience
            </button>
            <button
              onClick={() => onSelectCategory('fragrance')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'fragrance'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-[2px]'
                  : ''
              }`}
            >
              Home Fragrance
            </button>
            <button
              onClick={() => onSelectCategory('textiles')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'textiles'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-[2px]'
                  : ''
              }`}
            >
              Textiles & Wear
            </button>
          </nav>

          {/* Zone 3: Primary actions & utility controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Toggle */}
            {showSearchInput ? (
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="w-36 sm:w-52 px-3 py-1.5 text-xs bg-stone-100 border border-stone-300 rounded-md focus:outline-none focus:border-stone-500 text-stone-900 placeholder-stone-400"
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchChange('');
                  }}
                  className="absolute right-2 text-stone-400 hover:text-stone-700"
                  aria-label="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 text-stone-600 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100"
                aria-label="Search collection"
                title="Search collection"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* MongoDB Console Trigger */}
            <button
              onClick={onOpenMongoConsole}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-stone-700 bg-stone-200/70 hover:bg-stone-200 border border-stone-300/80 rounded-md transition-colors"
              title="Inspect MongoDB Collections"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden lg:inline text-[11px] font-medium">MongoDB</span>
            </button>

            {/* Orders Tracker */}
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-md transition-colors"
              title="Track Orders"
            >
              <PackageCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </button>

            {/* Shopping Bag Button (Zone 3 Primary CTA) */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-sm"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="font-mono tabular-nums text-xs px-1.5 py-0.2 bg-stone-700 text-stone-100 rounded">
                {cartCount}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
