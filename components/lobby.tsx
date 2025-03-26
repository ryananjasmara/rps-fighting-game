"use client";

import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { useSocket } from "@hooks/use-socket";

type LobbyProps = {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
};

type GameListing = {
  id: string;
  host: string;
  players: number;
};

export function Lobby({
  playerName,
  setPlayerName,
  onCreateGame,
  onJoinGame,
}: LobbyProps) {
  const [gameIdToJoin, setGameIdToJoin] = useState("");
  const [availableGames, setAvailableGames] = useState<GameListing[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Request initial available games when component mounts
    socket.emit("get_available_games");

    // Listen for available games updates
    socket.on("available_games", (data) => {
      setAvailableGames(data.games);
    });

    return () => {
      socket.off("available_games");
    };
  }, [socket]);

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Player Setup</CardTitle>
          <CardDescription>Enter your name to start playing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="playerName"
                className="block text-sm font-medium mb-2"
              >
                Your Name
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Game</CardTitle>
            <CardDescription>
              Start a new game and wait for an opponent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onCreateGame}
              disabled={!playerName}
              className="w-full"
            >
              Create Game
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Game</CardTitle>
            <CardDescription>
              Join an existing game with a game code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="gameId"
                  className="block text-sm font-medium mb-2"
                >
                  Game Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="gameId"
                    value={gameIdToJoin}
                    onChange={(e) => setGameIdToJoin(e.target.value)}
                    placeholder="Enter game code"
                  />
                  <Button
                    onClick={() => onJoinGame(gameIdToJoin)}
                    disabled={!gameIdToJoin || !playerName}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Games</CardTitle>
          <CardDescription>Join one of these open games</CardDescription>
        </CardHeader>
        <CardContent>
          {availableGames.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No games available. Create one to get started!
            </p>
          ) : (
            <div className="grid gap-4">
              {availableGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{game.host}'s Game</p>
                    <p className="text-sm text-muted-foreground">
                      Game ID: {game.id}
                    </p>
                  </div>
                  <Button
                    onClick={() => onJoinGame(game.id)}
                    disabled={!playerName}
                  >
                    Join Game
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
