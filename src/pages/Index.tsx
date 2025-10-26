import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Target } from 'lucide-react';
import { fetchMatches, fetchPlayers } from '@/lib/github-storage';
import { useEffect, useState } from 'react';

const Index = () => {
  const [stats, setStats] = useState({ matches: 0, players: 0, totalGoals: 0, wins: 0 });

  useEffect(() => {
    const loadData = async () => {
      const matches = await fetchMatches();
      const players = await fetchPlayers();
      const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
      const wins = matches.filter(m => m.goalsFor > m.goalsAgainst).length;
      setStats({ matches: matches.length, players: players.length, totalGoals, wins });
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">Di Gröne</h1>
          <p className="text-xl text-muted-foreground">Innebandylag med passion för spelet</p>
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
              <CardTitle className="text-sm font-medium">Totalt mål</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGoals}</div>
              <p className="text-xs text-muted-foreground">Gjorda mål denna säsong</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Om Di Gröne</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-green max-w-none">
            <p className="text-muted-foreground">
              Välkommen till Di Grönes officiella statistiksida! Här kan du följa lagets framsteg,
              se spelstatistik och resultat från våra matcher. Vi är ett innebandylag som brinner
              för sporten och kamratskapen.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
