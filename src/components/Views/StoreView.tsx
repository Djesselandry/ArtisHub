import React, { useState } from 'react';
import { Product, UserProfile, CartItem } from '../../types';
import { 
  Search, 
  Star, 
  ShoppingCart, 
  Heart, 
  Download, 
  Eye, 
  Filter,
  Tag
} from 'lucide-react';
import { toggleProductLike } from '../../lib/api';
import confetti from 'canvas-confetti';

interface StoreViewProps {
  products: Product[];
  currentUser: UserProfile | null;
  searchQuery: string;
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onRequireAuth: () => void;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Illustration Fantaisie HD',
    description: 'Illustration digitale haute résolution, style fantaisie médiévale. Livré en PNG et PSD.',
    price: 25,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    category: 'Art',
    tags: ['fantasy', 'illustration', 'digital'],
    authorUid: 'u1',
    author: 'Marie Artiste',
    authorHandle: '@marie_art',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
    likes: 42,
    likedBy: [],
    downloadCount: 128,
    rating: 4.8,
    ratingCount: 24,
    createdAt: '2026-08-20',
    featured: true,
  },
  {
    id: 'p2',
    title: 'Pack UI Kit Minimaliste',
    description: 'Kit complet de composants UI pour apps web et mobile. 200+ composants Figma.',
    price: 45,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    category: 'Template',
    tags: ['ui', 'figma', 'template'],
    authorUid: 'u2',
    author: 'Design Studio',
    authorHandle: '@designstudio',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=design',
    likes: 89,
    likedBy: [],
    downloadCount: 342,
    rating: 4.9,
    ratingCount: 67,
    createdAt: '2026-08-15',
    featured: true,
  },
  {
    id: 'p3',
    title: 'Musique Ambient - Pack 10 pistes',
    description: '10 pistes ambient pour projets créatifs. Licences libres incluses.',
    price: 15,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    category: 'Music',
    tags: ['music', 'ambient', 'soundtrack'],
    authorUid: 'u3',
    author: 'Sound Maker',
    authorHandle: '@soundmaker',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sound',
    likes: 31,
    likedBy: [],
    downloadCount: 87,
    rating: 4.6,
    ratingCount: 15,
    createdAt: '2026-08-18',
  },
  {
    id: 'p4',
    title: 'Modèle 3D Personnage RPG',
    description: 'Personnage 3D stylisé pour jeux vidéo. Formats FBX, OBJ, blend.',
    price: 60,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=400&fit=crop',
    category: '3D Model',
    tags: ['3d', 'character', 'rpg', 'game'],
    authorUid: 'u4',
    author: '3D Creator',
    authorHandle: '@3dcreator',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3d',
    likes: 56,
    likedBy: [],
    downloadCount: 203,
    rating: 4.7,
    ratingCount: 31,
    createdAt: '2026-08-10',
    featured: true,
  },
];

export const StoreView: React.FC<StoreViewProps> = ({
  products,
  currentUser,
  searchQuery,
  onAddToCart,
  onOpenCart,
  onRequireAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price'>('popular');

  const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;

  const filteredProducts = displayProducts.filter((prod) => {
    if (selectedCategory && prod.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prod.title.toLowerCase().includes(q);
      const matchAuthor = prod.author.toLowerCase().includes(q);
      const matchTags = prod.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.downloadCount - a.downloadCount;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.price - b.price;
  });

  const handleLike = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!currentUser) { onRequireAuth(); return; }
    const res = await toggleProductLike(product.id, currentUser.uid);
    if (res.liked) {
      confetti({ particleCount: 20, spread: 35, origin: { y: 0.7 }, colors: ['#25D366', '#5de6ff'] });
    }
  };

  const categories = ['Art', 'Illustration', '3D Model', 'Music', 'Game Asset', 'Template', 'Tutorial'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e5e1e4]">
          Boutique <span className="text-[#25D366]">ArtisHub</span>
        </h1>
        <p className="text-sm text-[#cfc2d6]/60 max-w-xl mx-auto">
          Découvrez et achetez des créations exclusives de nos artistes. Supports, assets, musiques et templates.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#e5e1e4]">Explorer</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#25D366]/20 text-xs font-mono text-[#25D366]">
            {filteredProducts.length} produits
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-bold'
                : 'text-[#cfc2d6] hover:bg-white/5'
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-bold'
                  : 'text-[#cfc2d6] hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#cfc2d6]/50" />
        <span className="text-xs text-[#cfc2d6]/50">Trier par:</span>
        {(['popular', 'newest', 'price'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
              sortBy === s
                ? 'bg-white/10 text-[#e5e1e4] font-bold'
                : 'text-[#cfc2d6]/50 hover:text-[#cfc2d6]'
            }`}
          >
            {s === 'popular' ? 'Populaires' : s === 'newest' ? 'Récents' : 'Prix'}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#1b1b1d] border border-white/5 rounded-2xl overflow-hidden hover:border-[#25D366]/30 transition-all duration-300 group flex flex-col"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.featured && (
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-wider">
                  Populaire
                </div>
              )}
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={(e) => handleLike(e, product)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <Heart className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3 h-3 text-[#25D366]" />
                <span className="text-[10px] font-mono text-[#25D366] uppercase">{product.category}</span>
              </div>
              <h3 className="text-sm font-bold text-[#e5e1e4] mb-1 line-clamp-1">{product.title}</h3>
              <p className="text-xs text-[#cfc2d6]/50 mb-3 line-clamp-2">{product.description}</p>

              {/* Author */}
              <div className="flex items-center gap-2 mb-3">
                <img src={product.authorAvatar} alt={product.author} className="w-6 h-6 rounded-full" />
                <span className="text-xs text-[#cfc2d6]/70">{product.author}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-[10px] text-[#cfc2d6]/40 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{product.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{product.downloadCount}</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                <p className="text-lg font-black text-[#25D366]">{product.price} <span className="text-xs font-normal text-[#cfc2d6]/50">{product.currency}</span></p>
                <button
                  onClick={() => { if (!currentUser) { onRequireAuth(); return; } onAddToCart(product); }}
                  className="w-9 h-9 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] flex items-center justify-center transition-colors group/btn"
                >
                  <ShoppingCart className="w-4 h-4 text-[#25D366] group-hover/btn:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-4 text-[#cfc2d6]/20" />
          <p className="text-sm text-[#cfc2d6]/50">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
};
