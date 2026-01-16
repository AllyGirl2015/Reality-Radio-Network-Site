'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Music } from 'lucide-react';
import UploadImage from '@/components/UploadImage';

interface Track {
  number: number;
  title: string;
  duration: string;
  featured?: boolean;
  previewUrl?: string;
}

export default function NewAlbumPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    artistSlug: '',
    genre: '',
    year: new Date().getFullYear(),
    duration: '',
    digitalPrice: 8.99,
    physicalPrice: 14.99,
    catalog: '',
    image: '',
    description: '',
    digitalBuyLink: '',
    physicalBuyLink: '',
    accentColor: 'purple' as const,
    featured: false,
  });

  const [tracklist, setTracklist] = useState<Track[]>([
    { number: 1, title: '', duration: '', featured: false, previewUrl: '' }
  ]);

  // Get password from session
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_auth') || '';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) : value
    }));
    
    // Auto-generate artist slug
    if (name === 'artist') {
      setFormData(prev => ({
        ...prev,
        artistSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  };

  const handleTrackChange = (index: number, field: keyof Track, value: string | boolean | number) => {
    const newTracklist = [...tracklist];
    newTracklist[index] = { ...newTracklist[index], [field]: value };
    setTracklist(newTracklist);
  };

  const addTrack = () => {
    setTracklist([
      ...tracklist,
      { number: tracklist.length + 1, title: '', duration: '', featured: false, previewUrl: '' }
    ]);
  };

  const removeTrack = (index: number) => {
    const newTracklist = tracklist.filter((_, i) => i !== index);
    // Renumber tracks
    newTracklist.forEach((track, i) => {
      track.number = i + 1;
    });
    setTracklist(newTracklist);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          ...formData,
          tracklist
        })
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create album');
      }
    } catch (err) {
      setError('Failed to create album');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">New Album</h1>
            <p className="text-gray-400 text-sm">Create a new album in the store</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Album Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="America's Changed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="Johnathan Gold & Guilded Hearts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="Country / Americana"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="38:42"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catalog Number
                </label>
                <input
                  type="text"
                  name="catalog"
                  value={formData.catalog}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="RRN-JG-AC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accent Color
                </label>
                <select
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="purple">Purple (Johnathan Gold)</option>
                  <option value="pink">Pink (Kaira Heartfelt)</option>
                  <option value="red">Red (Mathew Cage)</option>
                  <option value="indigo">Indigo (Chronix)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-purple-500/30 bg-gray-900/50 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-300">
                  Featured Album
                </label>
              </div>
            </div>

            {/* Album Cover Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Album Cover Image
              </label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <UploadImage
                    onUploadSuccess={(url) => {
                      setFormData(prev => ({ ...prev, image: url }));
                      setImagePreview(url);
                    }}
                    onUploadError={setError}
                  />
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Or enter image URL/path manually"
                    className="w-full mt-2 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                {imagePreview && (
                  <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-purple-500/30">
                    <img
                      src={imagePreview}
                      alt="Album cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                placeholder="A powerful reflection on transformation and truth..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Album Cover Image Path
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                placeholder="/America's Changed.png"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pricing & Links</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Digital Price ($)
                </label>
                <input
                  type="number"
                  name="digitalPrice"
                  value={formData.digitalPrice}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Physical Price ($)
                </label>
                <input
                  type="number"
                  name="physicalPrice"
                  value={formData.physicalPrice}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Digital Buy Link (Square)
                </label>
                <input
                  type="url"
                  name="digitalBuyLink"
                  value={formData.digitalBuyLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="https://square.link/u/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Physical Buy Link (Square)
                </label>
                <input
                  type="url"
                  name="physicalBuyLink"
                  value={formData.physicalBuyLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  placeholder="https://square.link/u/..."
                />
              </div>
            </div>
          </div>

          {/* Tracklist */}
          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tracklist</h2>
              <button
                type="button"
                onClick={addTrack}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Track
              </button>
            </div>

            <div className="space-y-4">
              {tracklist.map((track, index) => (
                <div key={index} className="p-4 bg-gray-900/30 border border-purple-500/10 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded text-purple-400 font-mono text-sm">
                      {track.number}
                    </span>
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                      placeholder="Track Title"
                      className="flex-1 px-3 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      value={track.duration}
                      onChange={(e) => handleTrackChange(index, 'duration', e.target.value)}
                      placeholder="3:42"
                      className="w-20 px-3 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={track.featured || false}
                        onChange={(e) => handleTrackChange(index, 'featured', e.target.checked)}
                        className="rounded border-purple-500/30 bg-gray-900/50 text-purple-500"
                      />
                      Featured
                    </label>
                    {tracklist.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <input
                      type="url"
                      value={track.previewUrl || ''}
                      onChange={(e) => handleTrackChange(index, 'previewUrl', e.target.value)}
                      placeholder="Preview URL (R2): https://pub-xxx.r2.dev/Music/..."
                      className="w-full px-3 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Album
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
