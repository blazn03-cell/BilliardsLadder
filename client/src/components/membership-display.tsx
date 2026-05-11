import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Star, Trophy } from "lucide-react";

interface MembershipDisplayProps {
  membershipTier: string;
  onUpgrade?: () => void;
}

export function MembershipDisplay({ membershipTier, onUpgrade }: MembershipDisplayProps) {
  const getMembershipInfo = (tier: string) => {
    switch (tier) {
      case 'rookie':
        return {
          name: 'Rookie Pass',
          price: '$9.99/month',
          stakeFee: '4%',
          tournamentEntry: '$30',
          icon: <Star className="w-5 h-5" />,
          color: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
          perks: [
            'Jump in the ladder',
            '4% stake fee',
            'Tournament entry: $30'
          ]
        };
      case 'basic':
      case 'standard':
        return {
          name: 'Basic Member',
          price: '$24.99/month',
          stakeFee: '4%',
          tournamentEntry: '$25-30',
          icon: <Star className="w-5 h-5" />,
          color: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
          perks: [
            'Jump in the ladder',
            '4% stake fee',
            'Tournament entry: $25–30'
          ]
        };
      case 'premium':
      case 'pro':
        return {
          name: 'Premium Member',
          price: '$34.99/month',
          stakeFee: '3%',
          tournamentEntry: 'FREE',
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
          perks: [
            'FREE tournament entry (worth $25–30)',
            'Lower stake fees (3%)',
            'Premium perks (priority seeding, livestream)',
            'Advanced analytics & coaching tools'
          ]
        };
      case 'family':
        return {
          name: 'Family Plan',
          price: '$44.99/month',
          stakeFee: '4%',
          tournamentEntry: 'FREE',
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-pink-600/20 text-pink-400 border-pink-500/30',
          perks: [
            'Up to 4 family members',
            '4% stake fee per match',
            'FREE tournament entry',
            'Family leaderboard'
          ]
        };
      case 'elite':
        return {
          name: 'Elite Member',
          price: '$99/month',
          stakeFee: '2%',
          tournamentEntry: 'FREE',
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
          perks: [
            'Lowest stake fees (2%)',
            'FREE tournament entry',
            'VIP seeding & livestream',
            'Priority matchmaking',
            'Dedicated support'
          ]
        };
      default:
        return {
          name: 'No Membership',
          price: 'Free',
          stakeFee: '15%',
          tournamentEntry: '$30',
          icon: <Trophy className="w-5 h-5" />,
          color: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
          perks: [
            'Basic ladder access',
            '15% stake fee for non-members',
            'Tournament entry: $30'
          ]
        };
    }
  };

  const info = getMembershipInfo(membershipTier);

  return (
    <Card className={`bg-black/60 backdrop-blur-sm border shadow-felt ${info.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {info.icon}
          {info.name}
          <Badge className={info.color}>
            {info.price}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold">{info.stakeFee}</div>
            <div className="text-xs text-gray-400">Stake Fee</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{info.tournamentEntry}</div>
            <div className="text-xs text-gray-400">Tournament Entry</div>
          </div>
        </div>
        <div className="space-y-2">
          {info.perks.map((perk, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-400 font-bold">•</span>
              <span className="text-sm text-gray-300">{perk}</span>
            </div>
          ))}
        </div>
        {membershipTier !== 'elite' && onUpgrade && (
          <Button
            onClick={onUpgrade}
            className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-black font-bold"
            data-testid="button-upgrade-membership"
          >
            {membershipTier === 'premium' || membershipTier === 'pro' ? 'Upgrade to Elite' : 'Upgrade Membership'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
