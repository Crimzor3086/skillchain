import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Clock, 
  Star, 
  Trophy, 
  CheckCircle,
  Play,
  BookOpen,
  Users,
  Award,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

export default function QuestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, publicKey } = useWallet();
  const { user, isAuthenticated, login } = useAuth();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch quest details
  const { data: questData, isLoading, error } = useQuery({
    queryKey: ['quest', id],
    queryFn: () => api.get(`/quests/${id}`),
    enabled: !!id,
  });

  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: (questId) => api.post(`/quests/${questId}/complete`, {
      walletAddress: publicKey?.toString()
    }),
    onSuccess: (data) => {
      toast.success('🎉 Quest completed! Credential is being minted...');
      queryClient.invalidateQueries(['quest', id]);
      queryClient.invalidateQueries(['quest-progress']);
      queryClient.invalidateQueries(['user-credentials']);
      
      // Redirect to passport after a delay
      setTimeout(() => {
        router.push('/passport');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to complete quest');
    },
  });

  const quest = questData?.data;
  const isCompleted = quest?.isCompleted;

  const handleCompleteQuest = async () => {
    if (!isAuthenticated) {
      const success = await login();
      if (!success) return;
    }

    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsCompleting(true);
    try {
      await completeQuestMutation.mutateAsync(id);
    } finally {
      setIsCompleting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quest Not Found</h1>
          <p className="text-gray-600 mb-6">The quest you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/quests"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse All Quests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{quest.title} - SkillChain</title>
        <meta name="description" content={quest.description} />
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/quests"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </Link>

          {/* Quest Header */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getCategoryColor(quest.category)}`}>
                    {quest.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                  {isCompleted && (
                    <span className="px-3 py-1 text-sm font-medium rounded bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{quest.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{quest.description}</p>

                {/* Quest Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{quest.estimatedTime} minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{quest.completionCount || 0} completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{quest.difficulty} level</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-end gap-4">
                {!connected ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Connect wallet to start quest</p>
                    <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
                  </div>
                ) : isCompleted ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-600 font-medium mb-3">Quest Completed!</p>
                    <Link
                      href="/passport"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      View Credential
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleCompleteQuest}
                    disabled={isCompleting || completeQuestMutation.isLoading}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting || completeQuestMutation.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Complete Quest
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Objectives */}
              {quest.learningObjectives && quest.learningObjectives.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Learning Objectives
                  </h2>
                  <ul className="space-y-2">
                    {quest.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quest Content */}
              {quest.content && quest.content.steps && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Quest Steps</h2>
                  <div className="space-y-6">
                    {quest.content.steps.map((step, index) => (
                      <div key={index} className="border-l-4 border-primary-200 pl-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        {step.resources && step.resources.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Resources:</p>
                            {step.resources.map((resource, resourceIndex) => (
                              <a
                                key={resourceIndex}
                                href={resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {resource}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Requirements */}
              {quest.requirements && quest.requirements.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {quest.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-2"></div>
                        <span className="text-gray-600">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quest Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quest Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{quest.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium text-gray-900 capitalize">{quest.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{quest.estimatedTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completions:</span>
                    <span className="font-medium text-gray-900">{quest.completionCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Credential Preview */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Earn This Credential
                </h3>
                <div className="bg-white rounded-lg p-4 border-2 border-dashed border-primary-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{quest.title}</h4>
                    <p className="text-sm text-gray-600">Blockchain-Verified Credential</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Complete this quest to earn a soulbound NFT credential that proves your skills on the blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}