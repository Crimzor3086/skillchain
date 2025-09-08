import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery } from '@tanstack/react-query';
import { 
  Award, 
  Trophy, 
  Share2, 
  Download, 
  ExternalLink,
  Calendar,
  Shield,
  Copy,
  Filter,
  Grid,
  List,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function Passport() {
  const { connected, publicKey } = useWallet();
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'category'

  // Fetch user's credentials
  const { data: credentialsData, isLoading, error } = useQuery({
    queryKey: ['user-credentials', user?.id],
    queryFn: () => api.get(`/users/${user.id}/credentials`),
    enabled: isAuthenticated && user?.id,
  });

  const credentials = credentialsData?.data?.credentials || [];
  const credentialsByCategory = credentialsData?.data?.credentialsByCategory || {};
  const categories = ['all', ...Object.keys(credentialsByCategory)];

  // Filter and sort credentials
  const filteredCredentials = credentials
    .filter(credential => {
      if (selectedCategory === 'all') return true;
      return credential.quest.category === selectedCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.mintedAt) - new Date(b.mintedAt);
        case 'category':
          return a.quest.category.localeCompare(b.quest.category);
        case 'newest':
        default:
          return new Date(b.mintedAt) - new Date(a.mintedAt);
      }
    });

  const copyProfileUrl = () => {
    const profileUrl = `${window.location.origin}/passport/${user.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard!');
  };

  const shareCredential = (credential) => {
    const shareUrl = `${window.location.origin}/credentials/${credential.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${credential.quest.title} - SkillChain Credential`,
        text: `Check out my blockchain-verified credential for ${credential.quest.title}!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Credential link copied to clipboard!');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Blockchain': 'text-purple-600 bg-purple-100',
      'Security': 'text-red-600 bg-red-100',
      'DeFi': 'text-blue-600 bg-blue-100',
      'NFT': 'text-pink-600 bg-pink-100',
      'Frontend': 'text-green-600 bg-green-100',
      'Analytics': 'text-orange-600 bg-orange-100',
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to view your skill passport</p>
          <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please authenticate to view your skill passport</p>
          <Link href="/dashboard" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Skill Passport - SkillChain</title>
        <meta name="description" content="View your blockchain-verified credentials and achievements" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SkillChain</span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/quests" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Quests
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/passport" className="text-primary-600 font-medium">
                  Passport
                </Link>
                <Link href="/leaderboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Leaderboard
                </Link>
              </nav>

              <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user?.username || 'Anonymous'}</h1>
                  <p className="text-gray-600 text-sm font-mono">
                    {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{credentials.length} Credentials</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Blockchain Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={copyProfileUrl}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Profile URL
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{credentials.length}</div>
              <div className="text-sm text-gray-600">Total Credentials</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{Object.keys(credentialsByCategory).length}</div>
              <div className="text-sm text-gray-600">Categories Mastered</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {credentials.filter(c => c.quest.difficulty === 'advanced').length}
              </div>
              <div className="text-sm text-gray-600">Advanced Skills</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {credentials.length > 0 ? Math.round((Date.now() - new Date(credentials[credentials.length - 1].mintedAt)) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-600">Days Since First</div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="category">By Category</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Credentials Display */}
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'No Credentials Yet' : `No ${selectedCategory} Credentials`}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory === 'all' 
                  ? 'Complete your first quest to earn a blockchain-verified credential!'
                  : `Complete quests in the ${selectedCategory} category to earn credentials.`
                }
              </p>
              <Link
                href="/quests"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Quests
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCredentials.map((credential) => (
                <div key={credential.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(credential.quest.category)}`}>
                            {credential.quest.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(credential.quest.difficulty)}`}>
                            {credential.quest.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{credential.quest.title}</h3>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {credential.quest.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(credential.mintedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/credentials/${credential.id}`}
                        className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => shareCredential(credential)}
                        className="p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              {filteredCredentials.map((credential, index) => (
                <div key={credential.id} className={`p-6 ${index !== filteredCredentials.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{credential.quest.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(credential.quest.category)}`}>
                            {credential.quest.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(credential.quest.difficulty)}`}>
                            {credential.quest.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">
                            Earned {new Date(credential.mintedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/credentials/${credential.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => shareCredential(credential)}
                        className="p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}