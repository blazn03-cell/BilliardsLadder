import React from 'react';

const SpecialEventsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-400 neon-glow mb-4">
          SPECIAL EVENTS
        </h1>
        <p className="text-green-500 text-xl">
          Community support and special occasions
        </p>
      </div>

      {/* Birthday Events */}
      <div className="bg-pink-900/10 border border-pink-700/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-pink-400 mb-4 flex items-center gap-2">
          <span>🎂</span>
          Birthday Month Benefits
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-pink-300 mb-2">Birthday Perks</h3>
            <ul className="space-y-2 text-sm text-pink-200">
              <li>• One free tournament entry OR Kelly Pool buy-in</li>
              <li>• If you win that event, pot gets +$25 from house</li>
              <li>• Special birthday recognition on stream</li>
              <li>• Birthday badge on leaderboard all month</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">🎂</div>
            <div className="text-pink-400 font-bold">Celebrate Your Month!</div>
          </div>
        </div>
      </div>

      {/* Family Support */}
      <div className="bg-purple-900/10 border border-purple-700/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <span>❤️</span>
          Family Situations Support
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-purple-300 mb-2">Free Pass Benefits</h3>
            <ul className="space-y-2 text-sm text-purple-200">
              <li>• Exempt from required matches (no forfeit penalties)</li>
              <li>• One free tournament entry OR Kelly Pool buy-in</li>
              <li>• Optional solidarity side pot from community</li>
              <li>• Continued access to all ladder features</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">❤️</div>
            <div className="text-purple-400 font-bold">We Support Our Own</div>
            <p className="text-xs text-purple-500 mt-2">
              Going through tough times? The operator can grant you a Free Pass.
            </p>
          </div>
        </div>
      </div>

      {/* Charity Events */}
      <div className="bg-blue-900/10 border border-blue-700/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <span>🤝</span>
          Charity Nights
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-blue-300 mb-2">How It Works</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>• Entry fees stay the same</li>
              <li>• Percentage of pot goes to chosen cause</li>
              <li>• Players still get points and payouts</li>
              <li>• Community votes on charity recipients</li>
              <li>• Held every few months</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">🤝</div>
            <div className="text-blue-400 font-bold">Give Back Together</div>
          </div>
        </div>
      </div>

      {/* Player in Need */}
      <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <span>🛑</span>
          Player in Need Rule
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-red-300 mb-2">Emergency Support</h3>
            <ul className="space-y-2 text-sm text-red-200">
              <li>• Free Action Pass for struggling players</li>
              <li>• Covers ladder dues for the month</li>
              <li>• OR covers one match challenge (max $100)</li>
              <li>• Goal: keep players in the community</li>
              <li>• Operator discretion for approval</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">🛑</div>
            <div className="text-red-400 font-bold">Nobody Left Behind</div>
          </div>
        </div>
      </div>

      {/* Respect Points */}
      <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <span>🌟</span>
          Good Vibes Bonus System
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-yellow-300 mb-2">Earn Respect Points</h3>
            <ul className="space-y-2 text-sm text-yellow-200">
              <li>• Chip in for charity events</li>
              <li>• Help another player in need</li>
              <li>• Show good sportsmanship</li>
              <li>• Contribute to community solidarity</li>
            </ul>
            
            <h3 className="font-bold text-yellow-300 mb-2 mt-4">Respect Benefits</h3>
            <ul className="space-y-2 text-sm text-yellow-200">
              <li>• Break ties in tournament seeding</li>
              <li>• Shoutouts on live streams</li>
              <li>• Build your hall reputation</li>
              <li>• More than just a cue-slinger</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">⭐</div>
            <div className="text-yellow-400 font-bold">Respect Earned</div>
            <p className="text-xs text-yellow-500 mt-2">
              It's not just about the money - it's about the community.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-green-400 mb-4">
          Need Support?
        </h3>
        <p className="text-green-500 mb-4">
          Going through a tough time? Contact the operator to discuss available support options.
        </p>
        <button className="btn-gritty">
          Contact Operator
        </button>
      </div>
    </div>
  );
};

export default SpecialEventsPage;