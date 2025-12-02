'use client';

import { useState, useEffect } from 'react';
import { Music, Disc, BookText, LogOut, Plus, Edit, Trash2, Eye, Search, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Album {
  id: string;
  slug: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  featured: boolean;
}

interface Single {
  id: string;
  slug: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  featured: boolean;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  author: string;
  published: boolean;
  publishedAt: string;
}

type TabType = 'albums' | 'singles' | 'blogs';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('albums');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Single[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('admin_auth');
    if (storedAuth) {
      setIsAuthenticated(true);
      setPassword(storedAuth);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll verify by making a test API call
    fetch('/api/admin/albums', {
      headers: {
        'Authorization': `Bearer ${password}`
      }
    })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
          sessionStorage.setItem('admin_auth', password);
          setAuthError('');
        } else {
          setAuthError('Invalid password');
        }
      })
      .catch(() => {
        // If API doesn't exist yet, just authenticate for development
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', password);
      });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    sessionStorage.removeItem('admin_auth');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${password}` };
      
      if (activeTab === 'albums') {
        const res = await fetch('/api/admin/albums', { headers });
        if (res.ok) {
          const data = await res.json();
          setAlbums(data);
        }
      } else if (activeTab === 'singles') {
        const res = await fetch('/api/admin/singles', { headers });
        if (res.ok) {
          const data = await res.json();
          setSingles(data);
        }
      } else if (activeTab === 'blogs') {
        const res = await fetch('/api/admin/blogs', { headers });
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (type: TabType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/admin/${type}?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${password}` }
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Filter items based on search query
  const filteredAlbums = albums.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSingles = singles.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                RRN Admin
              </h1>
              <p className="text-gray-400 text-sm mt-2">Content Management System</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
              
              {authError && (
                <p className="text-red-400 text-sm">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/25"
              >
                Login
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
                ← Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-black/60 border-r border-purple-500/20 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white">RRN Admin</h1>
                <p className="text-xs text-gray-400">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('albums')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'albums'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Albums</span>}
            {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button
            onClick={() => setActiveTab('singles')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'singles'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Singles</span>}
            {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'blogs'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Blog Posts</span>}
            {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-purple-500/20 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-black/40 border-b border-purple-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
              <p className="text-sm text-gray-400">
                Manage your {activeTab === 'blogs' ? 'blog posts' : activeTab}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 w-64"
                />
              </div>
              
              {/* Add New Button */}
              <Link
                href={`/admin/${activeTab}/new`}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Albums Table */}
              {activeTab === 'albums' && (
                <div className="bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Title</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Artist</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Genre</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Year</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Featured</th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlbums.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            No albums found. <Link href="/admin/albums/new" className="text-purple-400 hover:underline">Create one</Link>
                          </td>
                        </tr>
                      ) : (
                        filteredAlbums.map((album) => (
                          <tr key={album.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{album.title}</td>
                            <td className="px-6 py-4 text-gray-300">{album.artist}</td>
                            <td className="px-6 py-4 text-gray-300">{album.genre}</td>
                            <td className="px-6 py-4 text-gray-300">{album.year}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${album.featured ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {album.featured ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/store/albums/${album.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors" title="View">
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link href={`/admin/albums/${album.id}`} className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button onClick={() => handleDelete('albums', album.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Singles Table */}
              {activeTab === 'singles' && (
                <div className="bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Title</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Artist</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Genre</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Year</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Featured</th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSingles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            No singles found. <Link href="/admin/singles/new" className="text-purple-400 hover:underline">Create one</Link>
                          </td>
                        </tr>
                      ) : (
                        filteredSingles.map((single) => (
                          <tr key={single.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{single.title}</td>
                            <td className="px-6 py-4 text-gray-300">{single.artist}</td>
                            <td className="px-6 py-4 text-gray-300">{single.genre}</td>
                            <td className="px-6 py-4 text-gray-300">{single.year}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${single.featured ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {single.featured ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/store/singles/${single.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors" title="View">
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link href={`/admin/singles/${single.id}`} className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button onClick={() => handleDelete('singles', single.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Blogs Table */}
              {activeTab === 'blogs' && (
                <div className="bg-black/40 border border-purple-500/20 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Title</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Author</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Published</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBlogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            No blog posts found. <Link href="/admin/blogs/new" className="text-purple-400 hover:underline">Create one</Link>
                          </td>
                        </tr>
                      ) : (
                        filteredBlogs.map((post) => (
                          <tr key={post.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{post.title}</td>
                            <td className="px-6 py-4 text-gray-300">{post.author}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {post.published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white transition-colors" title="View">
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link href={`/admin/blogs/${post.id}`} className="p-2 text-gray-400 hover:text-purple-400 transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button onClick={() => handleDelete('blogs', post.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
