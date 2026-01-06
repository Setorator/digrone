import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Target } from 'lucide-react';
import { fetchMatches } from '@/lib/github-storage';
import { useEffect, useState } from 'react';
import { Match } from '@/lib/storage';

const Index = () => {
  const [stats, setStats] = useState(
    { 
      matches: 0, 
      totGoalsFor: 0,
      totGoalsAgainst: 0,
      wins: 0
    }
  );
  const [lastFiveResults, setLastFiveResults] = useState<string[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [prevMatch, setPrevMatch] = useState<Match | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      const matches = await fetchMatches();
      const matchesPlayed = matches.filter( m => new Date(m.date) < now );
      const totGoalsFor = matches.reduce((sum, m) => sum + m.goalsFor, 0);
      const totGoalsAgainst = matches.reduce((sum, m) => sum + m.goalsAgainst, 0);
      const wins = matchesPlayed.filter(m => m.goalsFor > m.goalsAgainst).length;
      
      // Get last 5 matches results
      const lastFive = matchesPlayed
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .reverse()
        .map(m => {
          if (m.goalsFor > m.goalsAgainst) return 'win';
          if (m.goalsFor < m.goalsAgainst) return 'loss';
          return 'draw';
        });
      setLastFiveResults(lastFive);
      
      setStats(
        { 
          matches: matchesPlayed.length,
          totGoalsFor,
          totGoalsAgainst, 
          wins
        });

      const nextMatch = matches
        .filter( m => new Date(m.date) > now )
        .sort( (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() )[0];
      const prevMatch = matches
        .filter( m => new Date(m.date) < now )
        .sort( (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() )[0];
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
              <CardTitle className="text-sm font-medium">Senaste 5 matcherna</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-center items-center h-12">
                {lastFiveResults.length > 0 ? (
                  lastFiveResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-full ${
                        result === 'win' ? 'bg-green-500' :
                        result === 'loss' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}
                      title={result === 'win' ? 'Vinst' : result === 'loss' ? 'Förlust' : 'Oavgjort'}
                    />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Inga matcher än</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Målratio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totGoalsFor} - {stats.totGoalsAgainst}</div>
              <p className="text-xs text-muted-foreground">Gjorda mål - Insläppta mål</p>
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
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
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
      <footer className="mt-16 py-6 border-t border-border/40">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground/60 mb-2">Framtagen och drivs av:</p>
          <img src="asklingforit.logo.svg" alt="Askling for IT" className="h-16" />
        </div>
      </footer>
    </div>
  );
};

export default Index;
