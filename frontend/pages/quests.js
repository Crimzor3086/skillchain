import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Trophy, 
  Filter,
  Search,
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function Quests() {
  const { connected } = useWallet();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Fetch all quests
  const { data: questsData, isLoading, error } = useQuery({
    queryKey: ['quests'],
    queryFn: () => api.get('/quests'),
  });

  // Fetch user's quest progress if authenticated
  const { data: progressData } = useQuery({
    queryKey: ['quest-progress'],
    queryFn: () => api.get('/quests/progress'),
    enabled: isAuthenticated,
  });

  const quests = questsData?.data || [];
  const userProgress = progressData?.data || [];

  // Get unique categories and difficulties
  const categories = ['all', ...new Set(quests.map(q => q.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Filter quests based on search and filters
  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || quest.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get user's progress for a specific quest
  const getQuestProgress = (questId) => {
    return userProgress.find(p => p.questId === questId);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Quests</h1>
          <p className="text-gray-600 mb-6">There was an error loading the quests. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Learning Quests - SkillChain</title>
        <meta name="description" content="Discover and complete interactive learning quests to earn blockchain-verified credentials" />
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
                <Link href="/quests" className="text-primary-600 font-medium">
                  Quests
                </Link>
                {connected && (
                  <>
                    <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/passport" className="text-gray-600 hover:text-primary-600 transition-colors">
                      Passport
                    </Link>
                  </>
                )}
                <Link href="/leaderboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Leaderboard
                </Link>
              </nav>

              <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Quests</h1>
            <p className="text-gray-600">
              Complete interactive challenges and earn blockchain-verified credentials
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quest Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quests Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No quests are available at the moment'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuests.map((quest) => {
                const progress = getQuestProgress(quest.id);
                const isCompleted = progress?.completed;
                
                return (
                  <div key={quest.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Quest Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(quest.category)}`}>
                              {quest.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(quest.difficulty)}`}>
                              {quest.difficulty}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{quest.title}</h3>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Quest Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {quest.description}
                      </p>

                      {/* Quest Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{quest.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{quest.completionCount || 0} completed</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/quests/${quest.id}`}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            View Completed
                          </>
                        ) : (
                          <>
                            Start Quest
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats Summary */}
          {!isLoading && filteredQuests.length > 0 && (
            <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{filteredQuests.length}</div>
                  <div className="text-sm text-gray-600">Available Quests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {isAuthenticated ? userProgress.filter(p => p.completed).length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {isAuthenticated ? userProgress.filter(p => !p.completed).length : 0}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {categories.length - 1}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}