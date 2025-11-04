import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchMatches, fetchPlayers } from '@/lib/github-storage';
import { useEffect, useState } from 'react';
import type { Match, Player } from '@/lib/storage';

const Statistics = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const players = await fetchPlayers();
      const matches = await fetchMatches()
      setPlayers(players.sort((a, b) => b.goals - a.goals));
      setMatches(matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Statistik</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Böter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Spelare</TableHead>
                    <TableHead className="text-right">Aktuell skuld</TableHead>
                    <TableHead className="text-right">Betald skuld</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.length > 0 ? (
                    players
                      .sort((a, b) => b.currentTab - a.currentTab)
                      .map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {player.currentTab > 0 ? `${player.currentTab} flak` : '-'}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {player.paidOffTab > 0 ? `${player.paidOffTab} flak` : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Ingen bötesinformation tillgänglig ännu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matcher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Motståndare</TableHead>
                    <TableHead className="text-center">Hemma/Borta</TableHead>
                    <TableHead className="text-center">Resultat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.length > 0 ? (
                    matches.map((match) => {
                      const won = match.goalsFor > match.goalsAgainst;
                      const draw = match.goalsFor === match.goalsAgainst;
                      return (
                        <TableRow key={match.id}>
                          <TableCell>{new Date(match.date).toLocaleDateString(
                            'sv-SE', { 
                              day: 'numeric',
                              month: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>{match.opponent}</TableCell>
                          <TableCell className="text-center">
                            {match.homeGame ? 'Hemma' : 'Borta'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`font-semibold ${
                                won
                                  ? 'text-primary'
                                  : draw
                                  ? 'text-muted-foreground'
                                  : 'text-destructive'
                              }`}
                            >
                              {match.goalsFor} - {match.goalsAgainst}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Inga matcher registrerade ännu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Skytteliga</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Plac.</TableHead>
                    <TableHead>Spelare</TableHead>
                    <TableHead className="text-right">Nr</TableHead>
                    <TableHead className="text-right">Mål</TableHead>
                    <TableHead className="text-right">Assist</TableHead>
                    <TableHead className="text-right">Poäng</TableHead>
                    <TableHead className="text-right">Matcher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.length > 0 ? (
                    players.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell className="text-right">{player.number}</TableCell>
                        <TableCell className="text-right font-semibold">{player.goals}</TableCell>
                        <TableCell className="text-right">{player.assists}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {player.goals + player.assists}
                        </TableCell>
                        <TableCell className="text-right">{player.matches}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Ingen statistik tillgänglig ännu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Statistics;
