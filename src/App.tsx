/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  subscribeToAuth, 
  subscribeToProjects, 
  subscribeToCollaborations, 
  subscribeToForumTopics,
  getFirebaseStatus
} from './lib/firebase';
import { 
  Project, 
  CollaborationAd, 
  ForumTopic, 
  UserProfile,
  Product,
  CartItem 
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudioPortal } from './components/StudioPortal';
import { FeedView } from './components/Views/FeedView';
import { RecruitmentView } from './components/Views/RecruitmentView';
import { ForumView } from './components/Views/ForumView';
import { WeatherView } from './components/Views/WeatherView';
import { StoreView } from './components/Views/StoreView';

// Modals
import { PostWorkModal } from './components/Modals/PostWorkModal';
import { ArtworkDetailModal } from './components/Modals/ArtworkDetailModal';
import { PostAdModal } from './components/Modals/PostAdModal';
import { ApplyAdModal } from './components/Modals/ApplyAdModal';
import { CreateThreadModal } from './components/Modals/CreateThreadModal';
import { ThreadDetailModal } from './components/Modals/ThreadDetailModal';
import { FirebaseConfigModal } from './components/Modals/FirebaseConfigModal';
import { WhatsAppSettingsModal } from './components/Modals/WhatsAppSettingsModal';
import { ProfileSettingsModal } from './components/Modals/ProfileSettingsModal';
import { WhatsAppContactModal } from './components/Modals/WhatsAppContactModal';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { WhatsAppChatWidget } from './components/WhatsAppChatWidget';
import { PaymentModal } from './components/Modals/PaymentModal';
import { CartWidget } from './components/Modals/CartWidget';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'feed' | 'recruitment' | 'forum' | 'weather' | 'store'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);

  // Data Store State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collaborations, setCollaborations] = useState<CollaborationAd[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);

  // Modals Open State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postWorkModalOpen, setPostWorkModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [postAdModalOpen, setPostAdModalOpen] = useState(false);
  const [selectedAdForApply, setSelectedAdForApply] = useState<CollaborationAd | null>(null);
  const [createThreadModalOpen, setCreateThreadModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [firebaseConfigModalOpen, setFirebaseConfigModalOpen] = useState(false);
  const [whatsAppSettingsOpen, setWhatsAppSettingsOpen] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [whatsAppAd, setWhatsAppAd] = useState<CollaborationAd | null>(null);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  // Store State
  const [products] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Subscribe to real-time updates (Firebase Firestore / Reactive Local Store)
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    const unsubProjects = subscribeToProjects((projs) => {
      setProjects(projs);
      // Update selected project modal if currently open
      if (selectedProject) {
        const updated = projs.find((p) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    });

    const unsubCollabs = subscribeToCollaborations((collabs) => {
      setCollaborations(collabs);
    });

    const unsubForum = subscribeToForumTopics((topics) => {
      setForumTopics(topics);
      if (selectedTopic) {
        const updated = topics.find((t) => t.id === selectedTopic.id);
        if (updated) setSelectedTopic(updated);
      }
    });

    return () => {
      unsubAuth();
      unsubProjects();
      unsubCollabs();
      unsubForum();
    };
  }, [selectedProject?.id, selectedTopic?.id]);

  const handleSelectCollaborator = (author: string) => {
    setFilterAuthor(author);
    setCurrentTab('recruitment');
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex">
      {/* Desktop Fixed Sidebar */}
      <Sidebar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedTag(null);
        }}
        selectedTag={selectedTag}
        onSelectTag={(tag) => {
          setSelectedTag(tag);
          setSelectedCategory(null);
        }}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main App Canvas */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Fixed Header / Navbar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setFilterAuthor(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenPostWork={() => setPostWorkModalOpen(true)}
          onOpenPostAd={() => setPostAdModalOpen(true)}
          onOpenNewThread={() => setCreateThreadModalOpen(true)}
          onOpenFirebaseConfig={() => setFirebaseConfigModalOpen(true)}
          onOpenWhatsAppSettings={() => setWhatsAppSettingsOpen(true)}
          onOpenProfileSettings={() => setProfileSettingsOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content View Container */}
        <main className="flex-1 mt-16 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24">
          {currentTab === 'feed' && (
            <FeedView
              projects={projects}
              currentUser={currentUser}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              searchQuery={searchQuery}
              onSelectProject={(p) => setSelectedProject(p)}
              onOpenPostWork={() => setPostWorkModalOpen(true)}
              onRequireAuth={() => setAuthModalOpen(true)}
              onSelectCollaborator={handleSelectCollaborator}
            />
          )}

          {currentTab === 'recruitment' && (
            <RecruitmentView
              ads={collaborations}
              currentUser={currentUser}
              onOpenPostAd={() => setPostAdModalOpen(true)}
              onApplyAd={(ad) => setSelectedAdForApply(ad)}
              onContactWhatsApp={(ad) => setWhatsAppAd(ad)}
              onRequireAuth={() => setAuthModalOpen(true)}
              filterAuthor={filterAuthor}
            />
          )}

          {currentTab === 'forum' && (
            <ForumView
              topics={forumTopics}
              currentUser={currentUser}
              onSelectTopic={(t) => setSelectedTopic(t)}
              onOpenNewThread={() => setCreateThreadModalOpen(true)}
              onRequireAuth={() => setAuthModalOpen(true)}
            />
          )}

          {currentTab === 'weather' && <WeatherView />}

          {currentTab === 'store' && (
            <StoreView
              products={products}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onAddToCart={addToCart}
              onOpenCart={() => setCartOpen(true)}
              onRequireAuth={() => setAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS */}
      {/* ========================================================================= */}

      {/* Auth Studio Portal Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <StudioPortal
            isModal={true}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={() => setAuthModalOpen(false)}
            onOpenFirebaseConfig={() => {
              setAuthModalOpen(false);
              setFirebaseConfigModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Post Artwork Modal */}
      {postWorkModalOpen && (
        <PostWorkModal
          currentUser={currentUser}
          onClose={() => setPostWorkModalOpen(false)}
          onRequireAuth={() => {
            setPostWorkModalOpen(false);
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Artwork Detail View & Comments */}
      {selectedProject && (
        <ArtworkDetailModal
          project={selectedProject}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
          onRequireAuth={() => setAuthModalOpen(true)}
          onSelectCollaborator={handleSelectCollaborator}
        />
      )}

      {/* Post Recruitment Ad Modal */}
      {postAdModalOpen && (
        <PostAdModal
          currentUser={currentUser}
          onClose={() => setPostAdModalOpen(false)}
          onRequireAuth={() => {
            setPostAdModalOpen(false);
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Apply to Recruitment Ad Modal */}
      {selectedAdForApply && (
        <ApplyAdModal
          ad={selectedAdForApply}
          currentUser={currentUser}
          onClose={() => setSelectedAdForApply(null)}
          onRequireAuth={() => {
            setSelectedAdForApply(null);
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Create New Forum Thread Modal */}
      {createThreadModalOpen && (
        <CreateThreadModal
          currentUser={currentUser}
          onClose={() => setCreateThreadModalOpen(false)}
          onRequireAuth={() => {
            setCreateThreadModalOpen(false);
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Forum Thread Detail & Reply View */}
      {selectedTopic && (
        <ThreadDetailModal
          topic={selectedTopic}
          currentUser={currentUser}
          onClose={() => setSelectedTopic(null)}
          onRequireAuth={() => setAuthModalOpen(true)}
        />
      )}

      {/* Firebase Config / TP Settings Modal */}
      {firebaseConfigModalOpen && (
        <FirebaseConfigModal
          onClose={() => setFirebaseConfigModalOpen(false)}
        />
      )}
      {whatsAppSettingsOpen && currentUser && (
        <WhatsAppSettingsModal
          currentUser={currentUser}
          onClose={() => setWhatsAppSettingsOpen(false)}
          onSaved={setCurrentUser}
        />
      )}
      {profileSettingsOpen && currentUser && (
        <ProfileSettingsModal
          currentUser={currentUser}
          onClose={() => setProfileSettingsOpen(false)}
          onSaved={setCurrentUser}
        />
      )}
      {whatsAppAd && <WhatsAppContactModal ad={whatsAppAd} onClose={() => setWhatsAppAd(null)} />}

      {/* WhatsApp Floating Chat Widget */}
      <WhatsAppFloat onClick={() => setChatWidgetOpen(true)} isOpen={chatWidgetOpen} />
      {chatWidgetOpen && (
        <WhatsAppChatWidget
          onClose={() => setChatWidgetOpen(false)}
        />
      )}

      {/* Cart & Payment */}
      {cartOpen && (
        <CartWidget
          items={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onCheckout={() => { setCartOpen(false); setPaymentOpen(true); }}
          onClose={() => setCartOpen(false)}
        />
      )}
      {paymentOpen && (
        <PaymentModal
          items={cart}
          total={cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
          onClose={() => setPaymentOpen(false)}
          onSuccess={() => { setPaymentOpen(false); setCart([]); }}
        />
      )}
    </div>
  );
}
