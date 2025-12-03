import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Trophy, BookOpen, Users, Shield, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuests: 0,
    totalCredentials: 0,
  });

  useEffect(() => {
    // Fetch platform stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats for now - replace with actual API calls
      setStats({
        totalUsers: 1247,
        totalQuests: 42,
        totalCredentials: 3891,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Quests',
      description: 'Complete hands-on learning challenges across various domains like programming, design, and marketing.',
    },
    {
      icon: Shield,
      title: 'Blockchain Verified',
      description: 'Earn soulbound NFT credentials that are permanently verified on the Solana blockchain.',
    },
    {
      icon: Trophy,
      title: 'Skill Passport',
      description: 'Showcase your achievements in a tamper-proof digital portfolio that employers can trust.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a community of learners and compete on leaderboards while building real skills.',
    },
  ];

  return (
    <>
      <Head>
        <title>SkillChain - Web3 Credentialing Platform</title>
        <meta name="description" content="Earn blockchain-verified credentials through interactive learning quests" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SkillChain</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/quests" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Quests
                </Link>
                <Link href="/leaderboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Leaderboard
                </Link>
                {connected && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Dashboard
                  </Link>
                )}
              </nav>

              <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Learn. Earn.{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Verify.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Complete interactive learning quests and earn blockchain-verified credentials 
                that showcase your skills in a tamper-proof digital passport.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {connected ? (
                  <Link
                    href="/dashboard"
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <div className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold">
                    Connect Wallet to Start
                  </div>
                )}
                
                <Link
                  href="/quests"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Browse Quests
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-gray-600">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.totalQuests}</div>
                <div className="text-gray-600">Learning Quests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.totalCredentials.toLocaleString()}</div>
                <div className="text-gray-600">Credentials Issued</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose SkillChain?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The future of credentialing is here. Build skills, earn trust, and showcase your expertise 
                with blockchain-verified achievements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of learners earning verified credentials on the blockchain.
            </p>
            
            {!connected && (
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-white !text-primary-600 hover:!bg-gray-100 !font-semibold !px-8 !py-3 !rounded-lg" />
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">SkillChain</span>
                </div>
                <p className="text-gray-400">
                  The future of credentialing on the blockchain.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/quests" className="hover:text-white transition-colors">Quests</Link></li>
                  <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Community</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 SkillChain. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}