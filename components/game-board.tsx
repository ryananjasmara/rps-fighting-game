import { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Shield, Sword, Heart, Hand, Scissors, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";
import { StickFigure } from "@/stick-figure";
import { useSocket } from "@/use-socket";

// Attack and defense types
type MoveType = "rock" | "paper" | "scissors";

type Fighter = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  currentAttackType: MoveType | null;
  currentDefenseType: MoveType | null;
};

type ActionType = "idle" | "attack" | "defend" | "hit" | "victory" | "defeat";

// Menambahkan tipe turn untuk membedakan giliran serang dan bertahan
type TurnType = "attack" | "defend";

type GameState = {
  gameId: string;
  players: Fighter[];
  currentTurn: string | null;
  currentTurnType: TurnType; // Menambahkan tipe giliran
  pendingAttack: { playerId: string; attackType: MoveType } | null; // Menyimpan serangan yang tertunda
  phase: "waiting" | "selection" | "battle" | "game_over";
  winner: string | null;
  gameLog: string[];
};

type GameBoardProps = {
  gameId: string;
  playerId: string;
  playerName: string;
  onExitGame: () => void;
};

export function GameBoard({
  gameId,
  playerId,
  playerName,
  onExitGame,
}: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>({
    gameId,
    players: [],
    currentTurn: null,
    currentTurnType: "attack", // Default ke serangan untuk giliran pertama
    pendingAttack: null,
    phase: "waiting",
    winner: null,
    gameLog: ["Waiting for opponent to join..."],
  });

  const [localMoveType, setLocalMoveType] = useState<MoveType | null>(null);
  const [attackAnimation, setAttackAnimation] = useState<string | null>(null);
  const [playerAction, setPlayerAction] = useState<ActionType>("idle");
  const [opponentAction, setOpponentAction] = useState<ActionType>("idle");
  const [effectiveness, setEffectiveness] = useState<
    "super" | "normal" | "not" | null
  >(null);

  const { socket } = useSocket();

  // Get player and opponent from game state
  const player = gameState.players.find((p) => p.id === playerId) || null;
  const opponent = gameState.players.find((p) => p.id !== playerId) || null;

  const isPlayerTurn = gameState.currentTurn === playerId;

  useEffect(() => {
    if (!socket) return;

    // Listen for game state updates
    socket.on("game_state_update", (data: GameState) => {
      console.log("Game state update received:", data);
      setGameState(data);

      // Reset local selections when it's a new turn
      if (data.currentTurn === playerId) {
        setLocalMoveType(null);
      }
    });

    // Tambahkan log untuk event game_joined
    socket.on("game_joined", (data) => {
      console.log("Game joined event received:", data);

      // Jika player B bergabung, minta update game state terbaru
      if (data.gameId === gameId) {
        console.log("Requesting game state update after joining");
        socket.emit("get_game_state", { gameId });
      }
    });

    socket.on("attack_animation", (data) => {
      const {
        attackerId,
        defenderId,
        attackType,
        defenseType,
        effectiveness: eff,
      } = data;

      setAttackAnimation(attackerId);

      if (attackerId === playerId) {
        setPlayerAction("attack");
        setOpponentAction("hit");
      } else {
        setPlayerAction("hit");
        setOpponentAction("attack");
      }

      setEffectiveness(eff);

      // Reset animations after a delay
      setTimeout(() => {
        setAttackAnimation(null);
        setPlayerAction("idle");
        setOpponentAction("idle");
        setEffectiveness(null);
      }, 1500);
    });

    socket.on("game_over", (data) => {
      const { winnerId } = data;

      if (winnerId === playerId) {
        setPlayerAction("victory");
        setOpponentAction("defeat");
      } else {
        setPlayerAction("defeat");
        setOpponentAction("victory");
      }
    });

    // Minta game state saat komponen dimount
    console.log("Component mounted, requesting initial game state");
    socket.emit("get_game_state", { gameId });

    return () => {
      socket.off("game_state_update");
      socket.off("game_joined");
      socket.off("attack_animation");
      socket.off("game_over");
    };
  }, [socket, playerId, gameId]);

  const handleMoveSelect = (type: MoveType) => {
    if (gameState.phase !== "selection" || !isPlayerTurn) return;
    setLocalMoveType(type);
  };

  const handleConfirmMove = () => {
    if (
      !socket ||
      gameState.phase !== "selection" ||
      !isPlayerTurn ||
      !localMoveType
    )
      return;

    // Kirim jenis gerakan berdasarkan tipe giliran saat ini
    if (gameState.currentTurnType === "attack") {
      socket.emit("submit_attack", {
        gameId,
        playerId,
        attackType: localMoveType,
      });
    } else {
      socket.emit("submit_defense", {
        gameId,
        playerId,
        defenseType: localMoveType,
      });
    }
  };

  // Helper function to get icon for move type
  const getMoveTypeIcon = (type: MoveType) => {
    switch (type) {
      case "rock":
        return <Hand className="h-5 w-5" />;
      case "paper":
        return <Scroll className="h-5 w-5" />;
      case "scissors":
        return <Scissors className="h-5 w-5" />;
    }
  };

  // PERBAIKAN: Jika socket belum terhubung, tampilkan layar loading
  if (!socket) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connecting to Server</CardTitle>
          <CardDescription>
            Please wait while we connect to the game server...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-center">Establishing connection...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // PERBAIKAN: Ubah kondisi untuk menampilkan layar menunggu
  // Hanya tampilkan layar menunggu jika fase permainan adalah "waiting"
  if (gameState.phase === "waiting") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waiting for Opponent</CardTitle>
          <CardDescription>
            Share this game code with a friend to play together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="text-center">
              <p className="mb-4">Game Code:</p>
              <div className="bg-muted p-4 rounded-md font-mono text-xl mb-4">
                {gameId}
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with a friend so they can join your game
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onExitGame} className="w-full">
            Cancel and Return to Lobby
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Mendapatkan teks status giliran
  const getTurnStatusText = () => {
    if (gameState.phase === "game_over") {
      return `Game Over! ${
        gameState.winner === playerId ? "You Won!" : "You Lost!"
      }`;
    }

    if (!isPlayerTurn) {
      return gameState.currentTurnType === "attack"
        ? `${opponent?.name || "Opponent"}'s Turn to Attack`
        : `${opponent?.name || "Opponent"}'s Turn to Defend Against Your ${
            gameState.pendingAttack?.attackType || ""
          } Attack`;
    }

    return gameState.currentTurnType === "attack"
      ? "Your Turn to Attack"
      : `Your Turn to Defend Against ${opponent?.name || "Opponent"}'s ${
          gameState.pendingAttack?.attackType || ""
        } Attack`;
  };

  // Mendapatkan teks instruksi untuk pemain
  const getInstructionText = () => {
    if (!isPlayerTurn) {
      return gameState.currentTurnType === "attack"
        ? "Waiting for opponent to choose their attack..."
        : `Waiting for opponent to choose their defense against your ${
            gameState.pendingAttack?.attackType || ""
          } attack...`;
    }

    return gameState.currentTurnType === "attack"
      ? "Choose your attack type"
      : `Choose your defense type against opponent's ${
          gameState.pendingAttack?.attackType || ""
        } attack`;
  };

  return (
    <div className="grid gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{getTurnStatusText()}</h2>
        <Button variant="outline" onClick={onExitGame}>
          Exit Game
        </Button>
      </div>

      {/* Battle Arena */}
      <div className="relative h-64 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl overflow-hidden border">
        <div className="absolute inset-0 flex items-center justify-between px-12">
          {/* Player Stick Figure */}
          <div className="flex flex-col items-center">
            <StickFigure
              action={playerAction}
              moveType={player?.currentAttackType || localMoveType || "rock"}
              color="blue"
              flipped={false}
              className="h-40 w-40"
            />
            <div className="mt-2 w-32">
              <Progress
                value={
                  ((player?.health || 0) / (player?.maxHealth || 100)) * 100
                }
                className="h-2"
              />
              <p className="text-xs text-center mt-1">
                {player?.health || 0}/{player?.maxHealth || 100}
              </p>
              {player?.currentAttackType && (
                <div className="flex justify-center mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getMoveTypeIcon(player.currentAttackType)}
                    {player.currentAttackType}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Effectiveness Indicator */}
          {effectiveness && (
            <div
              className={cn(
                "absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-white font-bold",
                effectiveness === "super"
                  ? "bg-green-500"
                  : effectiveness === "normal"
                  ? "bg-blue-500"
                  : "bg-red-500"
              )}
            >
              {effectiveness === "super"
                ? "Super Effective!"
                : effectiveness === "normal"
                ? "Normal Effectiveness"
                : "Not Very Effective..."}
            </div>
          )}

          {/* VS */}
          <div className="text-4xl font-bold opacity-20">VS</div>

          {/* Opponent Stick Figure */}
          <div className="flex flex-col items-center">
            <StickFigure
              action={opponentAction}
              moveType={opponent?.currentAttackType || "rock"}
              color="red"
              flipped={true}
              className="h-40 w-40"
            />
            <div className="mt-2 w-32">
              <Progress
                value={
                  ((opponent?.health || 0) / (opponent?.maxHealth || 100)) * 100
                }
                className="h-2"
              />
              <p className="text-xs text-center mt-1">
                {opponent?.health || 0}/{opponent?.maxHealth || 100}
              </p>
              {opponent?.currentAttackType && (
                <div className="flex justify-center mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getMoveTypeIcon(opponent.currentAttackType)}
                    {opponent.currentAttackType}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Player Card */}
        <Card
          className={cn(
            "relative overflow-hidden",
            attackAnimation === opponent?.id && "animate-shake"
          )}
        >
          <CardHeader className="bg-primary/10">
            <CardTitle className="flex justify-between items-center">
              <span>{player?.name || playerName} (You)</span>
              <Heart className="h-5 w-5 text-red-500" />
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Progress
                  value={
                    ((player?.health || 0) / (player?.maxHealth || 100)) * 100
                  }
                  className="h-4"
                />
                <span className="text-sm font-medium">
                  {player?.health || 0}/{player?.maxHealth || 100}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-orange-500" />
                <span>Attack: {player?.attack || 15}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>Defense: {player?.defense || 5}</span>
              </div>
              {player?.currentAttackType && (
                <div className="flex items-center gap-2">
                  {getMoveTypeIcon(player.currentAttackType)}
                  <span>Last Attack: {player.currentAttackType}</span>
                </div>
              )}
              {player?.currentDefenseType && (
                <div className="flex items-center gap-2">
                  {getMoveTypeIcon(player.currentDefenseType)}
                  <span>Last Defense: {player.currentDefenseType}</span>
                </div>
              )}
            </div>
          </CardContent>
          <div
            className={cn(
              "absolute inset-0 bg-red-500/20 pointer-events-none opacity-0",
              attackAnimation === opponent?.id && "opacity-100"
            )}
          />
        </Card>

        {/* Opponent Card */}
        <Card
          className={cn(
            "relative overflow-hidden",
            attackAnimation === playerId && "animate-shake"
          )}
        >
          <CardHeader className="bg-destructive/10">
            <CardTitle className="flex justify-between items-center">
              <span>{opponent?.name || "Opponent"}</span>
              <Heart className="h-5 w-5 text-red-500" />
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Progress
                  value={
                    ((opponent?.health || 0) / (opponent?.maxHealth || 100)) *
                    100
                  }
                  className="h-4"
                />
                <span className="text-sm font-medium">
                  {opponent?.health || 0}/{opponent?.maxHealth || 100}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-orange-500" />
                <span>Attack: {opponent?.attack || 15}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>Defense: {opponent?.defense || 5}</span>
              </div>
              {opponent?.currentAttackType && (
                <div className="flex items-center gap-2">
                  {getMoveTypeIcon(opponent.currentAttackType)}
                  <span>Last Attack: {opponent.currentAttackType}</span>
                </div>
              )}
              {opponent?.currentDefenseType && (
                <div className="flex items-center gap-2">
                  {getMoveTypeIcon(opponent.currentDefenseType)}
                  <span>Last Defense: {opponent.currentDefenseType}</span>
                </div>
              )}
            </div>
          </CardContent>
          <div
            className={cn(
              "absolute inset-0 bg-red-500/20 pointer-events-none opacity-0",
              attackAnimation === playerId && "opacity-100"
            )}
          />
        </Card>
      </div>

      {/* Selection Phase UI - Dimodifikasi untuk menampilkan hanya serangan atau pertahanan */}
      {gameState.phase === "selection" && isPlayerTurn && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {gameState.currentTurnType === "attack"
                ? "Choose Your Attack"
                : "Choose Your Defense"}
            </CardTitle>
            <CardDescription>
              {gameState.currentTurnType === "attack"
                ? "Rock beats Scissors, Scissors beats Paper, Paper beats Rock"
                : `Defend against opponent's ${gameState.pendingAttack?.attackType} attack`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-medium mb-3">
                {gameState.currentTurnType === "attack"
                  ? "Attack Type:"
                  : "Defense Type:"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={localMoveType === "rock" ? "default" : "outline"}
                  onClick={() => handleMoveSelect("rock")}
                  className="flex items-center gap-2"
                >
                  <Hand className="h-5 w-5" />
                  Rock
                </Button>
                <Button
                  variant={localMoveType === "paper" ? "default" : "outline"}
                  onClick={() => handleMoveSelect("paper")}
                  className="flex items-center gap-2"
                >
                  <Scroll className="h-5 w-5" />
                  Paper
                </Button>
                <Button
                  variant={localMoveType === "scissors" ? "default" : "outline"}
                  onClick={() => handleMoveSelect("scissors")}
                  className="flex items-center gap-2"
                >
                  <Scissors className="h-5 w-5" />
                  Scissors
                </Button>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              disabled={!localMoveType}
              onClick={handleConfirmMove}
            >
              Confirm{" "}
              {gameState.currentTurnType === "attack" ? "Attack" : "Defense"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Waiting for opponent's move */}
      {gameState.phase === "selection" && !isPlayerTurn && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Waiting for Opponent</CardTitle>
            <CardDescription>
              {gameState.currentTurnType === "attack"
                ? `${opponent?.name || "Opponent"} is choosing their attack`
                : `${
                    opponent?.name || "Opponent"
                  } is choosing their defense against your ${
                    gameState.pendingAttack?.attackType || ""
                  } attack`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>
                  {gameState.currentTurnType === "attack"
                    ? "Get ready to defend once they choose their attack..."
                    : "Waiting for opponent to choose their defense..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {gameState.phase === "game_over"
              ? `Game Over! ${
                  gameState.winner === playerId ? "You Won!" : "You Lost!"
                }`
              : gameState.phase === "selection"
              ? "Selection Phase"
              : "Battle Phase"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 overflow-y-auto border rounded-md p-4">
            {gameState.gameLog.map((log, index) => (
              <p key={index} className="mb-1">
                {log}
              </p>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          {gameState.phase === "game_over" && (
            <Button onClick={onExitGame} variant="secondary" className="w-full">
              Return to Lobby
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Game Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Players take turns attacking and defending.</li>
            <li>When it's your turn to attack, choose your attack type.</li>
            <li>
              When it's your turn to defend, choose your defense type against
              the opponent's attack.
            </li>
            <li>
              Rock beats Scissors, Scissors beats Paper, Paper beats Rock.
            </li>
            <li>
              Attack effectiveness depends on the defender's defense type:
              <ul className="list-circle pl-5 mt-1">
                <li>
                  Super Effective (2x damage): Your attack type beats their
                  defense type
                </li>
                <li>
                  Normal Effective (1x damage): Your attack type matches their
                  defense type
                </li>
                <li>
                  Not Very Effective (0.5x damage): Your attack type is weak
                  against their defense type
                </li>
              </ul>
            </li>
            <li>Reduce your opponent's health to zero to win!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
