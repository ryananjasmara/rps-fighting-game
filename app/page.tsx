"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@components/ui/card";
import { Lobby } from "@components/lobby";
import dynamic from "next/dynamic";
import { useSocket } from "@hooks/use-socket";

// Gunakan nama file yang eksplisit
const GameBoard = dynamic(
  () => import("@components/game-board").then((mod) => mod.GameBoard),
  {
    ssr: false,
    loading: () => <div>Loading game...</div>,
  }
);

const GameBoardAI = dynamic(
  () => import("@components/game-board-ai").then((mod) => mod.GameBoardAI),
  {
    ssr: false,
    loading: () => <div>Loading game...</div>,
  }
);

export default function FightingGame() {
  const [gameState, setGameState] = useState<"lobby" | "game" | "ai">("lobby");
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Generate a unique player ID if not already set
    if (!playerId) {
      const id = `player_${Math.random().toString(36).substring(2, 9)}`;
      setPlayerId(id);
    }

    // Listen for game events
    socket.on("game_joined", (data) => {
      console.log("Game joined event received in page.tsx:", data);
      setGameId(data.gameId);
      setGameState("game");
    });

    socket.on("error", (data) => {
      setError(data.message);
    });

    return () => {
      socket.off("game_joined");
      socket.off("error");
    };
  }, [socket, playerId]);

  const handleCreateGame = () => {
    if (!socket || !playerName) return;

    socket.emit("create_game", {
      playerId,
      playerName,
    });
  };

  const handleJoinGame = (gameIdToJoin: string) => {
    if (!socket || !playerName) return;

    socket.emit("join_game", {
      gameId: gameIdToJoin,
      playerId,
      playerName,
    });
  };

  const handleJoinAiGame = () => {
    if (!playerName) return;

    setGameState("ai");
  };

  const handleExitAiGame = () => {
    setGameState("lobby");
  };

  const handleExitGame = () => {
    if (!socket || !gameId) return;

    socket.emit("leave_game", {
      gameId,
      playerId,
    });

    // Reset state after leaving game
    setGameState("lobby");
    setGameId(null);
    setError(null);
    setPlayerId("");
    setPlayerName("");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Multiplayer Rock-Paper-Scissors Fighting Game
      </h1>

      {error && (
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {!isConnected && (
        <Card className="mb-8">
          <CardContent className="pt-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Connecting to server...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && gameState === "lobby" && (
        <Lobby
          playerName={playerName}
          setPlayerName={setPlayerName}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onJoinAiGame={handleJoinAiGame}
        />
      )}

      {isConnected && gameState === "game" && gameId && (
        <GameBoard
          gameId={gameId}
          playerId={playerId}
          playerName={playerName}
          onExitGame={handleExitGame}
        />
      )}

      {gameState === "ai" && (
        <GameBoardAI playerName={playerName} onExitGame={handleExitAiGame} />
      )}
    </div>
  );
}
