import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, UserPlus, Trophy, ArrowRight } from "lucide-react";

function JoinPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center">
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white" data-testid="text-join-title">
            JOIN THE ACTION
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto" data-testid="text-join-subtitle">
            Ready to climb the ladder? Create your account to get ranked, challenge opponents, and compete for real money.
          </p>
        </div>

        <Card className="bg-gray-900/80 border-gray-800">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                <UserPlus className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white" data-testid="text-step-1">Step 1: Create Your Account</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Sign up with your info and choose your membership tier. Rookies play free.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/50 border border-gray-700/30 rounded-lg">
                <Target className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white" data-testid="text-step-2">Step 2: Pick Your Table Size</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Choose from 9ft (Big Dog Throne), 8ft (Almost Big Time), or 7ft (Kiddie Box King) ladders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/50 border border-gray-700/30 rounded-lg">
                <Trophy className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-white" data-testid="text-step-3">Step 3: Start Competing</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Challenge players, climb the rankings, and earn your spot on the ladder.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="flex-1">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
                  data-testid="button-signup-from-join"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 text-lg py-6"
                  data-testid="button-login-from-join"
                >
                  Already Have an Account? Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-sm" data-testid="text-join-tagline">
          In here, respect is earned in racks, not words.
        </p>
      </div>
    </div>
  );
}

export default JoinPage;
