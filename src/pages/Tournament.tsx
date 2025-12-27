import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { fetchTournamentPlayers } from '@/lib/github-storage';
import type { Player } from '@/lib/storage';

const TEAM_NAME = 'Di Gröne';

type Standing = {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

type FixtureScore = {
  diGrone: number;
  opponent: number;
};

type GroupMatchScore = {
  home: number;
  away: number;
};

type GroupMatch = {
  id: string;
  stage: string;
  date: string;
  teams: [string, string];
  score?: GroupMatchScore;
  type: 'group' | 'knockout';
};

type Fixture = {
  id: string;
  opponent: string;
  stage: string;
  date: string;
  type: 'group' | 'knockout';
  score?: FixtureScore;
};

const groupMatches: GroupMatch[] = [
  {
    id: 'group-1',
    stage: 'Match 1',
    date: '10:00',
    teams: [TEAM_NAME, 'Tröccas'],
    score: { home: 0, away: 4 },
    type: 'group',
  },
  {
    id: 'group-2',
    stage: 'Match 2',
    date: '10:50',
    teams: ['Monster E', 'Lysviks IBF'],
    score: { home: 2, away: 2 },
    type: 'group',
  },
  {
    id: 'group-3',
    stage: 'Match 3',
    date: '11:40',
    teams: ['Monster E', 'Tröccas'],
    score: { home: 0, away: 2 },
    type: 'group',
  },
  {
    id: 'group-4',
    stage: 'Match 4',
    date: '12:30',
    teams: [TEAM_NAME, 'Lysviks IBF'],
    score: { home: 3, away: 0 },
    type: 'group',
  },
  {
    id: 'group-5',
    stage: 'Match 5',
    date: '13:20',
    teams: [TEAM_NAME, 'Monster E'],
    score: { home: 2, away: 1 },
    type: 'group',
  },
  {
    id: 'group-6',
    stage: 'Match 6',
    date: '14:10',
    teams: ['Tröccas', 'Lysviks IBF'],
    // score: { home: 0, away: 0 },
    type: 'group',
  },
  {
    id: 'kvart',
    stage: 'Kvartsfinal',
    date: '15:00 / 15:30',
    teams: [TEAM_NAME, 'TBD'],
    // score: { home: 0, away: 0 },
    type: 'knockout',
  },
  {
    id: 'semi',
    stage: 'Semifinal',
    date: '16:30 / 16:50',
    teams: [TEAM_NAME, 'TBD'],
    // score: { home: 0, away: 0 },
    type: 'knockout',
  },
  {
    id: 'final',
    stage: 'Final',
    date: '17:10',
    teams: [TEAM_NAME, 'TBD'],
    // score: { home: 0, away: 0 },
    type: 'knockout',
  },
];

const fixtures: Fixture[] = [
  ...groupMatches
    .filter((match) => match.teams.includes(TEAM_NAME) && match.type === 'group')
    .map((match) => {
      const diGroneHome = match.teams[0] === TEAM_NAME;
      const opponent = diGroneHome ? match.teams[1] : match.teams[0];
      const score = match.score
        ? diGroneHome
          ? { diGrone: match.score.home, opponent: match.score.away }
          : { diGrone: match.score.away, opponent: match.score.home }
        : undefined;
      return {
        id: match.id,
        opponent,
        stage: `Gruppspel • ${match.stage}`,
        date: match.date,
        type: 'group' as const,
        score,
      };
    }),
];

const deriveStandings = (games: GroupMatch[]): Standing[] => {
  const standings = new Map<string, Standing>();

  const ensureTeam = (team: string) => {
    if (!standings.has(team)) {
      standings.set(team, {
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    }
    return standings.get(team)!;
  };

  const applyResult = (entry: Standing, goalsFor: number, goalsAgainst: number) => {
    entry.played += 1;
    entry.goalsFor += goalsFor;
    entry.goalsAgainst += goalsAgainst;
    if (goalsFor > goalsAgainst) {
      entry.wins += 1;
      entry.points += 3;
    } else if (goalsFor === goalsAgainst) {
      entry.draws += 1;
      entry.points += 1;
    } else {
      entry.losses += 1;
    }
  };

  games.forEach((match) => {
    if (match.teams.includes('TBD')) return;
    const [home, away] = match.teams;
    const homeEntry = ensureTeam(home);
    const awayEntry = ensureTeam(away);

    if (!match.score) return;

    applyResult(homeEntry, match.score.home, match.score.away);
    applyResult(awayEntry, match.score.away, match.score.home);
  });

  return Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
};

const Tournament = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const loadPlayers = async () => {
      const roster = await fetchTournamentPlayers();
      setPlayers(roster);
    };

    loadPlayers();
  }, []);

  const groupStandings = deriveStandings(groupMatches);

  const activeRoster = useMemo(
    () =>
      [...players].sort((a, b) => {
        if (b.matches !== a.matches) return b.matches - a.matches;
        return (b.goals + b.assists) - (a.goals + a.assists);
      }),
    [players],
  );

  const topPerformers = useMemo(
    () =>
      [...activeRoster]
        .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
        .slice(0, 3),
    [activeRoster],
  );

  const averagePointsPerPlayer = useMemo(() => {
    if (!activeRoster.length) return '0.0';
    const totalPoints = activeRoster.reduce((sum, player) => sum + player.goals + player.assists, 0);
    return (totalPoints / activeRoster.length).toFixed(1);
  }, [activeRoster]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-10 space-y-10">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-500 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">2025</p>
                <h1 className="text-4xl font-black tracking-tight">Regionscupen</h1>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
                <Calendar className="h-10 w-10 text-white" />
                <div>
                  <p className="text-sm text-white/70">Speldag</p>
                  <p className="text-xl font-semibold text-white">27 december</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
                <MapPin className="h-10 w-10 text-white" />
                <div>
                  <p className="text-sm text-white/70">Arena</p>
                  <p className="text-xl font-semibold text-white">ECG Arena</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <Card className="border-emerald-100 shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Grupp 1-tabell</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table className="text-sm sm:text-base">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lag</TableHead>
                      <TableHead className="text-center">M</TableHead>
                      <TableHead className="text-center">V</TableHead>
                      <TableHead className="text-center">+/-</TableHead>
                      <TableHead className="text-right">Poäng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupStandings.map((team) => {
                      const goalDiff = team.goalsFor - team.goalsAgainst;
                      const highlight = team.team === TEAM_NAME ? 'bg-muted/60' : '';
                      return (
                        <TableRow key={team.team} className={highlight}>
                          <TableCell className="font-medium">{team.team}</TableCell>
                          <TableCell className="text-center">{team.played}</TableCell>
                          <TableCell className="text-center">{team.wins}</TableCell>
                          <TableCell className="text-center">{goalDiff}</TableCell>
                          <TableCell className="text-right font-semibold">{team.points}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Matcher & slutspelet</CardTitle>
                <p className="text-sm text-muted-foreground">Gruppspel, semifinal och final</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 sm:hidden">
                  {groupMatches.map((match) => {
                    const isDiMatch = match.teams.includes(TEAM_NAME);
                    const resultText = match.score ? `${match.score.home} - ${match.score.away}` : 'Ej spelad';
                    return (
                      <div
                        key={match.id}
                        className={`rounded-2xl border p-5 text-base ${
                          isDiMatch ? 'border-primary/60 bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{match.stage}</span>
                          <span>{match.date}</span>
                        </div>
                        <p className="mt-2 font-semibold">
                          {match.teams[0]} vs {match.teams[1]}
                        </p>
                        <p className="text-2xl font-bold">{resultText}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden sm:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Match</TableHead>
                          <TableHead>Lag</TableHead>
                          <TableHead className="text-center">Resultat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupMatches.map((match) => {
                          const isDiMatch = match.teams.includes(TEAM_NAME);
                          return (
                            <TableRow key={match.id} className={isDiMatch ? 'bg-muted/40' : ''}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{match.stage}</span>
                                  <span className="text-xs text-muted-foreground">{match.date}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {match.teams[0]} vs {match.teams[1]}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                {match.score ? `${match.score.home} - ${match.score.away}` : '–'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nyckelspelare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPerformers.length > 0 ? (
                  topPerformers.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                      <div>
                        <p className="font-semibold">
                          {index + 1}. {player.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.goals} mål • {player.assists} assist
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-base">
                        {player.goals + player.assists} p
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Statistik laddas in...</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Snittpoäng per spelare: <span className="font-semibold">{averagePointsPerPlayer}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Spelarstatistik</h2>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4 sm:hidden">
                {activeRoster.length > 0 ? (
                  activeRoster
                    .sort((a, b) => b.name.split(' ')[1] > a.name.split(' ')[1] ? -1 : 1)
                    .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                    .map((player) => (
                      <div key={player.id} className="rounded-2xl border border-border p-5 text-base">
                        <div className="flex items-center justify-between text-lg font-semibold">
                          <span>{player.name}</span>
                          <span>{player.goals + player.assists} p</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <span>Matcher: {player.matches}</span>
                          <span>Mål: {player.goals}</span>
                          <span>Assist: {player.assists}</span>
                          <span>Utvisning: {player.penaltyMins}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Inga spelare registrerade ännu.</p>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spelare</TableHead>
                        <TableHead className="text-center">Matcher</TableHead>
                        <TableHead className="text-center">Mål</TableHead>
                        <TableHead className="text-center">Assist</TableHead>
                        <TableHead className="text-center">Poäng</TableHead>
                        <TableHead className="text-center">Utvisningsmin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeRoster.length > 0 ? (
                        activeRoster
                          .sort((a,b) => b.name.split(" ")[1] > a.name.split(" ")[1] ? -1 : 1)
                          .sort((a,b) => (b.goals + b.assists) - (a.goals + a.assists))
                          .map((player) => (
                          <TableRow key={player.id}>
                            <TableCell className="font-medium">{player.name}</TableCell>
                            <TableCell className="text-center">{player.matches}</TableCell>
                            <TableCell className="text-center font-semibold">{player.goals}</TableCell>
                            <TableCell className="text-center font-semibold">{player.assists}</TableCell>
                            <TableCell className="text-center font-semibold">
                              {player.goals + player.assists}
                            </TableCell>
                            <TableCell className="text-center">{player.penaltyMins}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            Inga spelare registrerade ännu. Lägg till truppen i Admin-vyn.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Tournament;
