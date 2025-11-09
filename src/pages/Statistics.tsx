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
      setPlayers(players.sort((a,b) => b.name.split(" ")[1] > a.name.split(" ")[1] ? -1 : 1));
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
          {/* Podium for Top 3 Goal Scorers */}
          {players.length >= 3 && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-4">Mål</h2>
              <div className="flex items-end justify-center gap-4 py-8">
                {(() => {
                  const sortedByGoals = [...players].sort((a, b) => (b.goals) - (a.goals));
                  return (
                    <>
                      {/* 2nd place */}
                      <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 p-6 rounded-lg w-40" style={{height: '200px'}}>
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="font-bold text-center">{sortedByGoals[1].name}</div>
                        <div className="text-3xl font-bold text-primary mt-auto">{sortedByGoals[1].goals}</div>
                        <div className="text-xs text-muted-foreground">mål</div>
                      </div>
                      {/* 1st place - tallest */}
                      <div className="flex flex-col items-center bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg w-40" style={{height: '240px'}}>
                        <div className="text-5xl mb-2">🥇</div>
                        <div className="font-bold text-lg text-center">{sortedByGoals[0].name}</div>
                        <div className="text-4xl font-bold text-primary mt-auto">{sortedByGoals[0].goals}</div>
                        <div className="text-sm text-muted-foreground">mål</div>
                      </div>
                      {/* 3rd place */}
                      <div className="flex flex-col items-center bg-orange-100 dark:bg-orange-900 p-4 rounded-lg w-40" style={{height: '165px'}}>
                        <div className="text-3xl mb-2">🥉</div>
                        <div className="font-bold text-center">{sortedByGoals[2].name}</div>
                        <div className="text-2xl font-bold text-primary mt-auto">{sortedByGoals[2].goals}</div>
                        <div className="text-xs text-muted-foreground">mål</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Podium for Top 3 Points Leaders */}
          {players.length >= 3 && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-4">Totalpoäng</h2>
              <div className="flex items-end justify-center gap-4 py-8">
                {(() => {
                  const sortedByPoints = [...players].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));
                  return (
                    <>
                      {/* 2nd place */}
                      <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 p-6 rounded-lg w-40" style={{height: '200px'}}>
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="font-bold text-center">{sortedByPoints[1].name}</div>
                        <div className="text-3xl font-bold text-primary mt-auto">{sortedByPoints[1].goals + sortedByPoints[1].assists}</div>
                        <div className="text-xs text-muted-foreground">{sortedByPoints[1].goals}+{sortedByPoints[1].assists}</div>
                      </div>
                      {/* 1st place - tallest */}
                      <div className="flex flex-col items-center bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg w-40" style={{height: '240px'}}>
                        <div className="text-5xl mb-2">🥇</div>
                        <div className="font-bold text-lg text-center">{sortedByPoints[0].name}</div>
                        <div className="text-4xl font-bold text-primary mt-auto">{sortedByPoints[0].goals + sortedByPoints[0].assists}</div>
                        <div className="text-sm text-muted-foreground">{sortedByPoints[0].goals}+{sortedByPoints[0].assists}</div>
                      </div>
                      {/* 3rd place */}
                      <div className="flex flex-col items-center bg-orange-100 dark:bg-orange-900 p-4 rounded-lg w-40" style={{height: '165px'}}>
                        <div className="text-3xl mb-2">🥉</div>
                        <div className="font-bold text-center">{sortedByPoints[2].name}</div>
                        <div className="text-2xl font-bold text-primary mt-auto">{sortedByPoints[2].goals + sortedByPoints[2].assists}</div>
                        <div className="text-xs text-muted-foreground">{sortedByPoints[2].goals}+{sortedByPoints[2].assists}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

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
                      .filter(p => p.currentTab + p.paidOffTab > 0)
                      .sort((a, b) => b.currentTab - a.currentTab)
                      .map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>{player.name}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {player.currentTab > 0 ? `${player.currentTab} burkar` : '-'}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {player.paidOffTab > 0 ? `${player.paidOffTab} burkar` : '-'}
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
                    <TableHead className="text-right">Poäng</TableHead>
                    <TableHead className="text-right">Mål</TableHead>
                    <TableHead className="text-right">Assist</TableHead>
                    <TableHead className="text-right">Utv. minuter</TableHead>
                    <TableHead className="text-right">Matcher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.length > 0 ? (
                    players
                      .sort((a,b) => b.name.split(" ")[1] > a.name.split(" ")[1] ? -1 : 1)
                      .sort((a,b) => (b.goals + b.assists) - (a.goals + a.assists))
                      .map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {player.goals + player.assists}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{player.goals}</TableCell>
                        <TableCell className="text-right">{player.assists}</TableCell>
                        <TableCell className="text-right">{player.penaltyMins}</TableCell>
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
