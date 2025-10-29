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
import { Trash2, Edit2, Save, X } from 'lucide-react';

const Admin = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
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
      currentTab: 0,
      paidOffTab: 0,
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

  const deletePlayer = async (id: string) => {
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    toast({ title: 'Spelare borttagen' });
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    const updatedPlayers = players.map(p => p.id === id ? { ...p, ...updates } : p);
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    setEditingPlayer(null);
    toast({ title: 'Spelare uppdaterad' });
  };

  const deleteMatch = async (id: string) => {
    const updatedMatches = matches.filter(m => m.id !== id);
    setMatches(updatedMatches);
    await saveMatches(updatedMatches);
    toast({ title: 'Match borttagen' });
  };

  const updateMatch = async (id: string, updates: Partial<Match>) => {
    const updatedMatches = matches.map(m => m.id === id ? { ...m, ...updates } : m);
    setMatches(updatedMatches);
    await saveMatches(updatedMatches);
    setEditingMatch(null);
    toast({ title: 'Match uppdaterad' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Administration</h1>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="players">Spelare</TabsTrigger>
            <TabsTrigger value="matches">Matcher</TabsTrigger>
            <TabsTrigger value="goals">Mål</TabsTrigger>
            <TabsTrigger value="tabs">Böter</TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lägg till spelare</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addPlayer} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="playerName">Namn</Label>
                    <Input id="playerName" name="playerName" required />
                  </div>
                  <div className="w-32">
                    <Label htmlFor="playerNumber">Nummer</Label>
                    <Input id="playerNumber" name="playerNumber" type="number" required />
                  </div>
                  <Button type="submit">Lägg till</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spelare ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inga spelare ännu</p>
                  ) : (
                    players.map((player) => (
                      <div key={player.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        {editingPlayer === player.id ? (
                          <>
                            <Input
                              defaultValue={player.name}
                              className="flex-1"
                              id={`edit-name-${player.id}`}
                            />
                            <Input
                              defaultValue={player.number}
                              type="number"
                              className="w-20"
                              id={`edit-number-${player.id}`}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const name = (document.getElementById(`edit-name-${player.id}`) as HTMLInputElement).value;
                                const number = parseInt((document.getElementById(`edit-number-${player.id}`) as HTMLInputElement).value);
                                updatePlayer(player.id, { name, number });
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingPlayer(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">#{player.number}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {player.matches} matcher | {player.goals} mål | {player.assists} assist
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingPlayer(player.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deletePlayer(player.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registrera match</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addMatch} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="matchDate">Datum</Label>
                      <Input id="matchDate" name="matchDate" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="opponent">Motståndare</Label>
                      <Input id="opponent" name="opponent" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
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

            <Card>
              <CardHeader>
                <CardTitle>Matcher ({matches.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {matches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inga matcher ännu</p>
                  ) : (
                    matches
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((match) => (
                        <div key={match.id} className="flex items-center gap-2 p-3 border rounded-lg">
                          {editingMatch === match.id ? (
                            <>
                              <Input
                                defaultValue={match.date}
                                type="date"
                                className="w-40"
                                id={`edit-date-${match.id}`}
                              />
                              <Input
                                defaultValue={match.opponent}
                                className="flex-1"
                                id={`edit-opponent-${match.id}`}
                              />
                              <Input
                                defaultValue={match.goalsFor}
                                type="number"
                                className="w-16"
                                id={`edit-for-${match.id}`}
                              />
                              <span>-</span>
                              <Input
                                defaultValue={match.goalsAgainst}
                                type="number"
                                className="w-16"
                                id={`edit-against-${match.id}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const date = (document.getElementById(`edit-date-${match.id}`) as HTMLInputElement).value;
                                  const opponent = (document.getElementById(`edit-opponent-${match.id}`) as HTMLInputElement).value;
                                  const goalsFor = parseInt((document.getElementById(`edit-for-${match.id}`) as HTMLInputElement).value);
                                  const goalsAgainst = parseInt((document.getElementById(`edit-against-${match.id}`) as HTMLInputElement).value);
                                  updateMatch(match.id, { date, opponent, goalsFor, goalsAgainst });
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingMatch(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="w-32 text-sm">
                                {new Date(match.date).toLocaleDateString('sv-SE')}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">{match.opponent}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {match.homeGame ? '(H)' : '(B)'}
                                </span>
                              </div>
                              <div className={`font-bold ${
                                match.goalsFor > match.goalsAgainst ? 'text-green-600' :
                                match.goalsFor < match.goalsAgainst ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {match.goalsFor} - {match.goalsAgainst}
                              </div>
                              <div className="text-xs text-muted-foreground w-20">
                                {match.lineup.length} spelare
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingMatch(match.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMatch(match.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))
                  )}
                </div>
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

          <TabsContent value="tabs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lägg till böter</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const playerId = formData.get('tabPlayer') as string;
                  const amount = parseInt(formData.get('tabAmount') as string);
                  
                  const updatedPlayers = players.map(p => 
                    p.id === playerId ? { ...p, currentTab: p.currentTab + amount } : p
                  );
                  setPlayers(updatedPlayers);
                  await savePlayers(updatedPlayers);
                  
                  e.currentTarget.reset();
                  toast({ title: 'Böter tillagda', description: `${amount} kr har lagts till.` });
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="tabPlayer">Spelare</Label>
                    <Select name="tabPlayer" required>
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
                    <Label htmlFor="tabAmount">Belopp (kr)</Label>
                    <Input id="tabAmount" name="tabAmount" type="number" min="1" required />
                  </div>
                  <Button type="submit">Lägg till böter</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hantera böter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Inga spelare ännu</p>
                  ) : (
                    players
                      .filter(p => p.currentTab > 0 || p.paidOffTab > 0)
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-2 p-3 border rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium">{player.name}</span>
                            <div className="text-sm text-muted-foreground">
                              Aktuell: {player.currentTab} kr | Betald: {player.paidOffTab} kr
                            </div>
                          </div>
                          {player.currentTab > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const updatedPlayers = players.map(p => 
                                  p.id === player.id 
                                    ? { ...p, paidOffTab: p.paidOffTab + p.currentTab, currentTab: 0 } 
                                    : p
                                );
                                setPlayers(updatedPlayers);
                                await savePlayers(updatedPlayers);
                                toast({ title: 'Böter betalda', description: `${player.name} har betalat sin skuld.` });
                              }}
                            >
                              Markera som betald
                            </Button>
                          )}
                        </div>
                      ))
                  )}
                  {players.every(p => p.currentTab === 0 && p.paidOffTab === 0) && (
                    <p className="text-sm text-muted-foreground">Inga böter registrerade ännu</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
