import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowRight,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const { user, isAuthenticated, login } = useAuth();

  // Fetch user's quest progress
  const { data: questProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['quest-progress'],
    queryFn: () => api.get('/quests/progress'),
    enabled: isAuthenticated,
  });

  // Fetch user's credentials
  const { data: credentials, isLoading: credentialsLoading } = useQuery({
    queryKey: ['user-credentials', user?.id],
    queryFn: () => api.get(`/users/${user.id}/credentials`),
    enabled: isAuthenticated && user?.id,
  });

  // Fetch available quests
  const { data: availableQuests, isLoading: questsLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: () => api.get('/quests'),
  });

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">Connect your Solana wallet to access your dashboard</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authenticate</h1>
          <p className="text-gray-600 mb-6">Sign a message to verify your wallet ownership</p>
          <button
            onClick={login}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Sign Message
          </button>
        </div>
      </div>
    );
  }

  const completedQuests = questProgress?.data?.filter(q => q.completed) || [];
  const inProgressQuests = questProgress?.data?.filter(q => !q.completed) || [];
  const totalCredentials = credentials?.data?.totalCredentials || 0;

  const stats = [
    {
      label: 'Quests Completed',
      value: completedQuests.length,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Credentials Earned',
      value: totalCredentials,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      value: inProgressQuests.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Total Score',
      value: completedQuests.length * 100, // Simple scoring
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - SkillChain</title>
        <meta name="description" content="Your SkillChain learning dashboard" />
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
                <Link href="/passport" className="text-gray-600 hover:text-primary-600 transition-colors">
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.username || 'Learner'}!
            </h1>
            <p className="text-gray-600">
              Continue your learning journey and earn more credentials
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* In Progress Quests */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                </div>
                <div className="p-6">
                  {progressLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : inProgressQuests.length > 0 ? (
                    <div className="space-y-4">
                      {inProgressQuests.slice(0, 3).map((progress) => (
                        <div key={progress.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <h3 className="font-medium text-gray-900">{progress.quest.title}</h3>
                            <p className="text-sm text-gray-600">{progress.quest.category}</p>
                          </div>
                          <Link
                            href={`/quests/${progress.quest.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No quests in progress</p>
                      <Link
                        href="/quests"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Browse Quests
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Achievements</h2>
                </div>
                <div className="p-6">
                  {credentialsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : credentials?.data?.credentials?.length > 0 ? (
                    <div className="space-y-4">
                      {credentials.data.credentials.slice(0, 5).map((credential) => (
                        <div key={credential.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {credential.quest.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(credential.mintedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Link
                        href="/passport"
                        className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4"
                      >
                        View All Credentials
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No credentials yet</p>
                      <p className="text-sm text-gray-500">Complete quests to earn your first credential!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Quests */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
              </div>
              <div className="p-6">
                {questsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableQuests?.data?.slice(0, 3).map((quest) => (
                      <Link
                        key={quest.id}
                        href={`/quests/${quest.id}`}
                        className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                            {quest.category}
                          </span>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-xs ml-1">{quest.difficulty}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{quest.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quest.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {quest.estimatedTime} min
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}