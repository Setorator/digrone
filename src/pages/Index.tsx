import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Target } from 'lucide-react';
import { fetchMatches, fetchPlayers } from '@/lib/github-storage';
import { useEffect, useState } from 'react';
import { Match } from '@/lib/storage';

const Index = () => {
  const [stats, setStats] = useState(
    { 
      matches: 0, 
      players: 0, 
      goalRatio: 0.0, 
      wins: 0 
    }
  );
  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [prevMatch, setPrevMatch] = useState<Match | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      const matches = await fetchMatches();
      const players = await fetchPlayers();
      const matchesPlayed = matches.filter( m => new Date(m.date) < now );
      const totGoalsFor = matches.reduce((sum, m) => sum + m.goalsFor, 0);
      const totGoalsAgainst = matches.reduce((sum, m) => sum + m.goalsAgainst, 0);
      const goalRatio =  totGoalsFor/ totGoalsAgainst;
      const wins = matches.filter(m => m.goalsFor > m.goalsAgainst).length;
      setStats(
        { 
          matches: matchesPlayed.length, 
          players: players.length, 
          goalRatio, 
          wins 
        });

      const nextMatch = matches
        .filter( m => new Date(m.date) > now )
        .sort( (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() )[0];
      const prevMatch = matches
        .filter( m => new Date(m.date) < now )
        .sort( (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() )[0];
      setNextMatch(nextMatch);
      setPrevMatch(prevMatch);

    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px' }}>
          <img src="digrone_logo.png" alt="Di Gröne logo"></img>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matcher spelade</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.matches}</div>
              <p className="text-xs text-muted-foreground">{stats.wins} vinster</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spelare</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.players}</div>
              <p className="text-xs text-muted-foreground">Aktiva spelare</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Målratio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.goalRatio.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Gjorda mål / Insläppta mål</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="font-medium">Föregående match</CardTitle>
            </CardHeader>
            <CardContent>
              {prevMatch ? (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(prevMatch.date).toLocaleDateString('sv-SE', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-lg mb-2">
                    {prevMatch.homeGame ? `Di Gröne - ${prevMatch.opponent}` : `${prevMatch.opponent} - Di Gröne`}
                  </p>
                  <p className={`text-2xl font-bold 
                    ${prevMatch.goalsFor > prevMatch.goalsAgainst ? 'text-green-600' : 
                    prevMatch.goalsFor < prevMatch.goalsAgainst ? 'text-red-600' : 
                    'text-grey-600'}`}>
                    {prevMatch.homeGame ? `${prevMatch.goalsFor} - ${prevMatch.goalsAgainst}` : `${prevMatch.goalsAgainst} - ${prevMatch.goalsFor}`}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">Ingen tidigare match</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="font-medium">Kommande match</CardTitle>
            </CardHeader>
            <CardContent>
              {nextMatch ? (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(nextMatch.date).toLocaleDateString('sv-SE', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-lg">
                    {nextMatch.homeGame ? `Di Gröne - ${nextMatch.opponent}` : `${nextMatch.opponent} - Di Gröne`}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">Ingen kommande match</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
