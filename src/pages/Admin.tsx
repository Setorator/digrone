import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { fetchPlayers, fetchMatches, fetchGoals, savePlayers, saveMatches, saveGoals } from '@/lib/github-storage';
import type { Player, Match, Goal } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const Admin = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      const players = await fetchPlayers();
      const matches = await fetchMatches();
      setPlayers(players);
      setMatches(matches);
    };
    loadData();
  }, []);

  const addPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: formData.get('playerName') as string,
      number: parseInt(formData.get('playerNumber') as string),
      goals: 0,
      assists: 0,
      matches: 0,
    };
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    e.currentTarget.reset();
    toast({ title: 'Spelare tillagd', description: `${newPlayer.name} har lagts till i laget.` });
  };

  const addMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lineup = formData.getAll('lineup') as string[];
    
    const newMatch: Match = {
      id: Date.now().toString(),
      date: formData.get('matchDate') as string,
      opponent: formData.get('opponent') as string,
      homeGame: formData.get('homeGame') === 'true',
      goalsFor: parseInt(formData.get('goalsFor') as string) || 0,
      goalsAgainst: parseInt(formData.get('goalsAgainst') as string) || 0,
      lineup,
    };

    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    await saveMatches(updatedMatches);

    // Update player match count
    const updatedPlayers = players.map(player => {
      if (lineup.includes(player.id)) {
        return { ...player, matches: player.matches + 1 };
      }
      return player;
    });
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);

    e.currentTarget.reset();
    toast({ title: 'Match registrerad', description: `Match mot ${newMatch.opponent} har lagts till.` });
  };

  const addGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const playerId = formData.get('goalScorer') as string;
    const assistId = formData.get('assist') as string;
    const matchId = formData.get('matchId') as string;

    const newGoal: Goal = {
      id: Date.now().toString(),
      playerId,
      assistId: assistId || undefined,
      matchId,
      period: parseInt(formData.get('period') as string),
      time: formData.get('time') as string,
    };

    const goals = await fetchGoals();
    await saveGoals([...goals, newGoal]);

    // Update player stats
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return { ...player, goals: player.goals + 1 };
      }
      if (assistId && player.id === assistId) {
        return { ...player, assists: player.assists + 1 };
      }
      return player;
    });
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);

    e.currentTarget.reset();
    toast({ title: 'Mål registrerat', description: 'Målet har lagts till i statistiken.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Administration</h1>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players">Spelare</TabsTrigger>
            <TabsTrigger value="matches">Matcher</TabsTrigger>
            <TabsTrigger value="goals">Mål</TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>Lägg till spelare</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addPlayer} className="space-y-4">
                  <div>
                    <Label htmlFor="playerName">Namn</Label>
                    <Input id="playerName" name="playerName" required />
                  </div>
                  <div>
                    <Label htmlFor="playerNumber">Nummer</Label>
                    <Input id="playerNumber" name="playerNumber" type="number" required />
                  </div>
                  <Button type="submit">Lägg till spelare</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Registrera match</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addMatch} className="space-y-4">
                  <div>
                    <Label htmlFor="matchDate">Datum</Label>
                    <Input id="matchDate" name="matchDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="opponent">Motståndare</Label>
                    <Input id="opponent" name="opponent" required />
                  </div>
                  <div>
                    <Label htmlFor="homeGame">Plats</Label>
                    <Select name="homeGame" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj plats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Hemma</SelectItem>
                        <SelectItem value="false">Borta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goalsFor">Våra mål</Label>
                      <Input id="goalsFor" name="goalsFor" type="number" min="0" required />
                    </div>
                    <div>
                      <Label htmlFor="goalsAgainst">Motståndarens mål</Label>
                      <Input id="goalsAgainst" name="goalsAgainst" type="number" min="0" required />
                    </div>
                  </div>
                  <div>
                    <Label>Laguppställning</Label>
                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded-md p-4">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <Checkbox id={`lineup-${player.id}`} name="lineup" value={player.id} />
                          <Label htmlFor={`lineup-${player.id}`} className="cursor-pointer">
                            {player.name} (#{player.number})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="submit">Registrera match</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Registrera mål</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addGoal} className="space-y-4">
                  <div>
                    <Label htmlFor="matchId">Match</Label>
                    <Select name="matchId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj match" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {new Date(match.date).toLocaleDateString('sv-SE')} - {match.opponent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goalScorer">Målskytt</Label>
                    <Select name="goalScorer" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj spelare" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} (#{player.number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assist">Assist (valfritt)</Label>
                    <Select name="assist">
                      <SelectTrigger>
                        <SelectValue placeholder="Välj spelare" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ingen assist</SelectItem>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} (#{player.number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period">Period</Label>
                      <Select name="period" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Period 1</SelectItem>
                          <SelectItem value="2">Period 2</SelectItem>
                          <SelectItem value="3">Period 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="time">Tid (mm:ss)</Label>
                      <Input id="time" name="time" placeholder="12:34" required />
                    </div>
                  </div>
                  <Button type="submit">Registrera mål</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
