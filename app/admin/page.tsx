'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Music, Disc, Users, LogOut, Plus, Edit, Trash2, Eye, Search, 
  Menu, X, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle,
  Mail, Lock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/storage';

// Types
interface Artist {
  id: string;
  slug: string;
  name: string;
  genre: string;
  bio: string;
  image: string;
  accent_color: string;
  social_links?: Record<string, string>;
}

interface Album {
  id: string;
  slug: string;
  title: string;
  artist_id: string;
  artist_name: string;
  artist_slug: string;
  genre: string;
  year: number;
  duration: string;
  digital_price: number;
  physical_price: number;
  catalog: string;
  image: string;
  description: string;
  digital_buy_link: string;
  physical_buy_link: string;
  accent_color: string;
  featured: boolean;
}

interface Single {
  id: string;
  slug: string;
  title: string;
  artist_id: string;
  artist_name: string;
  artist_slug: string;
  album_id?: string;
  album_title?: string;
  genre: string;
  year: number;
  duration: string;
  price: number;
  catalog: string;
  description: string;
  buy_link: string;
  preview_url?: string;
  image?: string;
  accent_color: string;
  featured: boolean;
}

type TabType = 'artists' | 'albums' | 'singles';

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('artists');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Single[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Artist | Album | Single | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Check if already authenticated via Supabase session
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const supabase = getSupabase();
    if (!supabase) {
      setAuthError('Supabase is not configured');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setIsAuthenticated(true);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      if (activeTab === 'artists') {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .order('name');
        if (!error && data) setArtists(data);
      } else if (activeTab === 'albums') {
        const { data, error } = await supabase
          .from('albums')
          .select('*, artists(name, slug)')
          .order('year', { ascending: false });
        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setAlbums(data.map((album: any) => ({
            ...album,
            artist_name: album.artists?.name || '',
            artist_slug: album.artists?.slug || ''
          })));
        }
      } else if (activeTab === 'singles') {
        const { data, error } = await supabase
          .from('singles')
          .select('*, artists(name, slug), albums(title)')
          .order('year', { ascending: false });
        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSingles(data.map((single: any) => ({
            ...single,
            artist_name: single.artists?.name || '',
            artist_slug: single.artists?.slug || '',
            album_title: single.albums?.title || ''
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error fetching data', 'error');
    }
    setLoading(false);
  }, [activeTab]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab, fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', id);
      
      if (!error) {
        showToast('Item deleted successfully', 'success');
        fetchData();
      } else {
        showToast('Error deleting item', 'error');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Error deleting item', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const supabase = getSupabase();
    if (!supabase) {
      setSaving(false);
      return;
    }

    try {
      if (editingItem) {
        // Update
        const { error } = await supabase
          .from(activeTab)
          .update(formData)
          .eq('id', editingItem.id);
        
        if (!error) {
          showToast('Updated successfully', 'success');
          setShowForm(false);
          setEditingItem(null);
          setFormData({});
          fetchData();
        } else {
          showToast(error.message || 'Error saving', 'error');
        }
      } else {
        // Create
        const { error } = await supabase
          .from(activeTab)
          .insert([formData]);
        
        if (!error) {
          showToast('Created successfully', 'success');
          setShowForm(false);
          setEditingItem(null);
          setFormData({});
          fetchData();
        } else {
          showToast(error.message || 'Error saving', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Error saving item', 'error');
    }
    setSaving(false);
  };

  const openForm = (item?: Artist | Album | Single) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData(getDefaultFormData());
    }
    setShowForm(true);
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'artists':
        return { slug: '', name: '', genre: '', bio: '', image: '', accent_color: 'purple' };
      case 'albums':
        return {
          slug: '', title: '', artist_id: '', genre: '', year: new Date().getFullYear(),
          duration: '', digital_price: 8.99, physical_price: 14.99, catalog: '', image: '',
          description: '', digital_buy_link: '', physical_buy_link: '', accent_color: 'purple', featured: false
        };
      case 'singles':
        return {
          slug: '', title: '', artist_id: '', album_id: '', genre: '', year: new Date().getFullYear(),
          duration: '', price: 0.99, catalog: '', description: '', buy_link: '', preview_url: '',
          accent_color: 'purple', featured: false
        };
      default:
        return {};
    }
  };

  // Filter items based on search query
  const filteredArtists = artists.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAlbums = albums.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSingles = singles.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Login screen with email/password
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reality Radio Network</h1>
            <p className="text-gray-400 mt-2">Admin Dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            Admin access only
          </p>
        </div>
      </div>
    );
  }

  // Form modal
  if (showForm) {
    return (
      <div className="fixed inset-0 bg-gray-900 p-6 z-50 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => { setShowForm(false); setEditingItem(null); setFormData({}); }}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingItem ? 'Edit' : 'New'} {activeTab === 'artists' ? 'Artist' : activeTab === 'albums' ? 'Album' : 'Single'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              {activeTab === 'artists' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                      <input
                        type="text"
                        value={formData.genre || ''}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Accent Color</label>
                      <select
                        value={formData.accent_color || 'purple'}
                        onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="purple">Purple</option>
                        <option value="blue">Blue</option>
                        <option value="red">Red</option>
                        <option value="green">Green</option>
                        <option value="yellow">Yellow</option>
                        <option value="pink">Pink</option>
                        <option value="orange">Orange</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-32"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'albums' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Artist</label>
                      <select
                        value={formData.artist_id || ''}
                        onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      >
                        <option value="">Select an artist</option>
                        {artists.map(artist => (
                          <option key={artist.id} value={artist.id}>{artist.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                      <input
                        type="text"
                        value={formData.genre || ''}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                      <input
                        type="number"
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        placeholder="45:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Catalog</label>
                      <input
                        type="text"
                        value={formData.catalog || ''}
                        onChange={(e) => setFormData({ ...formData, catalog: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        placeholder="RRN-001"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Digital Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.digital_price || 8.99}
                        onChange={(e) => setFormData({ ...formData, digital_price: parseFloat(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Physical Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.physical_price || 14.99}
                        onChange={(e) => setFormData({ ...formData, physical_price: parseFloat(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Digital Buy Link</label>
                      <input
                        type="text"
                        value={formData.digital_buy_link || ''}
                        onChange={(e) => setFormData({ ...formData, digital_buy_link: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Physical Buy Link</label>
                      <input
                        type="text"
                        value={formData.physical_buy_link || ''}
                        onChange={(e) => setFormData({ ...formData, physical_buy_link: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                      />
                      Featured
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'singles' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Artist</label>
                      <select
                        value={formData.artist_id || ''}
                        onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      >
                        <option value="">Select an artist</option>
                        {artists.map(artist => (
                          <option key={artist.id} value={artist.id}>{artist.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Album (optional)</label>
                      <select
                        value={formData.album_id || ''}
                        onChange={(e) => setFormData({ ...formData, album_id: e.target.value || null })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">None</option>
                        {albums.map(album => (
                          <option key={album.id} value={album.id}>{album.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                      <input
                        type="text"
                        value={formData.genre || ''}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                      <input
                        type="number"
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        placeholder="3:45"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || 0.99}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Catalog</label>
                      <input
                        type="text"
                        value={formData.catalog || ''}
                        onChange={(e) => setFormData({ ...formData, catalog: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        placeholder="RRN-S001"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Preview URL</label>
                    <input
                      type="text"
                      value={formData.preview_url || ''}
                      onChange={(e) => setFormData({ ...formData, preview_url: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Buy Link</label>
                    <input
                      type="text"
                      value={formData.buy_link || ''}
                      onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                      />
                      Featured
                    </label>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingItem(null); setFormData({}); }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="fixed inset-0 bg-gray-900 flex z-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <Link href="/" className="text-white font-bold text-lg">RRN Admin</Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('artists')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'artists' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Artists</span>}
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'albums' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Disc className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Albums</span>}
          </button>
          <button
            onClick={() => setActiveTab('singles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'singles' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Music className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Singles</span>}
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeTab}
            </h1>
            <button
              onClick={() => openForm()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  {activeTab === 'artists' && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Genre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Slug</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                    </>
                  )}
                  {activeTab === 'albums' && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artist</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Year</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Featured</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                    </>
                  )}
                  {activeTab === 'singles' && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Artist</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Year</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Featured</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {activeTab === 'artists' && filteredArtists.map(artist => (
                  <tr key={artist.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {artist.image && (
                          <Image
                            src={getImageUrl(artist.image)}
                            alt={artist.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        )}
                        <span className="text-white font-medium">{artist.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{artist.genre}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-sm">{artist.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/talent/${artist.slug}`}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openForm(artist)}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(artist.id)}
                          className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'albums' && filteredAlbums.map(album => (
                  <tr key={album.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {album.image && (
                          <Image
                            src={getImageUrl(album.image)}
                            alt={album.title}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        )}
                        <span className="text-white font-medium">{album.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{album.artist_name}</td>
                    <td className="px-4 py-3 text-gray-400">{album.year}</td>
                    <td className="px-4 py-3">
                      {album.featured && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/store/albums/${album.slug}`}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openForm(album)}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
                          className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'singles' && filteredSingles.map(single => (
                  <tr key={single.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{single.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{single.artist_name}</td>
                    <td className="px-4 py-3 text-gray-400">{single.year}</td>
                    <td className="px-4 py-3">
                      {single.featured && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/store/singles/${single.slug}`}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openForm(single)}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(single.id)}
                          className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {((activeTab === 'artists' && filteredArtists.length === 0) ||
                  (activeTab === 'albums' && filteredAlbums.length === 0) ||
                  (activeTab === 'singles' && filteredSingles.length === 0)) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
