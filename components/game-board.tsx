import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Shield, Sword, Heart, Hand, Scissors, Scroll } from "lucide-react";
import { cn } from "@components/lib/utils";
import { StickFigure } from "@components/stick-figure";
import { useSocket } from "@hooks/use-socket";
import capitalize from "@utils/capitalize";
import { HowToPlayModal } from "@components/how-to-play-modal";

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

// Action types for the stick figure animations
type ActionType = "idle" | "attack" | "defend" | "hit" | "victory" | "defeat";

// Adding turn type to differentiate between attack and defend turns
type TurnType = "attack" | "defend";

type GameState = {
  gameId: string;
  players: Fighter[];
  currentTurn: string | null;
  currentTurnType: TurnType;
  pendingAttack: { playerId: string; attackType: MoveType } | null;
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
    currentTurnType: "attack",
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
    });

    // Add logging for game_joined event
    socket.on("game_joined", (data) => {
      console.log("Game joined event received:", data);

      // If player B joins, request the latest game state
      if (data.gameId === gameId) {
        console.log("Requesting game state update after joining");
        socket.emit("get_game_state", { gameId });
      }
    });

    socket.on("attack_animation", (data) => {
      const { attackerId, effectiveness: eff } = data;

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

    // Request game state when component mounts
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

    // Send move type based on current turn type
    if (gameState.currentTurnType === "attack") {
      socket.emit("submit_attack", {
        gameId,
        playerId,
        attackType: localMoveType,
      });

      // Reset local move type after confirming attack
      setLocalMoveType(null);
    } else {
      socket.emit("submit_defense", {
        gameId,
        playerId,
        defenseType: localMoveType,
      });

      // Reset local move type after confirming defense
      setLocalMoveType(null);
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

  // IMPROVE: If socket is not connected, show loading screen
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

  // IMPROVE: Change condition to show waiting screen
  // Show waiting screen only if game phase is "waiting"
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

  // Get turn status text
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="md:text-2xl font-bold">Room ID: {gameId}</h1>
        <div className="space-x-2 flex items-center gap-2">
          <HowToPlayModal />
          <Button variant="destructive" size="sm" onClick={onExitGame}>
            Exit Game
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{getTurnStatusText()}</h2>
        </div>

        {/* Battle Arena */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl overflow-hidden border">
          <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-12">
            {/* Player Stick Figure */}
            <div className="flex flex-col items-center">
              <StickFigure
                action={playerAction}
                moveType={player?.currentAttackType || localMoveType || "rock"}
                color="blue"
                flipped={false}
                className="h-24 w-24 sm:h-40 sm:w-40"
              />
              <div className="mt-2 w-20 sm:w-32">
                <Progress
                  value={
                    ((player?.health || 0) / (player?.maxHealth || 100)) * 100
                  }
                  className="h-2"
                />
                <p className="text-[10px] sm:text-xs text-center mt-1">
                  {player?.health || 0}/{player?.maxHealth || 100}
                </p>
              </div>
            </div>

            {/* Effectiveness Indicator */}
            {effectiveness && (
              <div
                className={cn(
                  "absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white font-bold text-xs sm:text-sm",
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
            <div className="text-2xl sm:text-4xl font-bold opacity-20">VS</div>

            {/* Opponent Stick Figure */}
            <div className="flex flex-col items-center">
              <StickFigure
                action={opponentAction}
                moveType={opponent?.currentAttackType || "rock"}
                color="red"
                flipped={true}
                className="h-24 w-24 sm:h-40 sm:w-40"
              />
              <div className="mt-2 w-20 sm:w-32">
                <Progress
                  value={
                    ((opponent?.health || 0) / (opponent?.maxHealth || 100)) *
                    100
                  }
                  className="h-1.5 sm:h-2"
                />
                <p className="text-[10px] sm:text-xs text-center mt-1">
                  {opponent?.health || 0}/{opponent?.maxHealth || 100}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Phase UI - Modified to show only attack or defense for mobile */}
        {gameState.phase === "selection" && isPlayerTurn && (
          <Card className="block md:hidden">
            <CardHeader>
              <CardTitle>
                {gameState.currentTurnType === "attack"
                  ? "Choose Your Attack"
                  : "Choose Your Defense"}
              </CardTitle>
              <CardDescription>
                {gameState.currentTurnType === "attack"
                  ? "Rock beats Scissors, Scissors beats Paper, Paper beats Rock"
                  : `Defend against opponent's attack`}
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
                    variant={
                      localMoveType === "scissors" ? "default" : "outline"
                    }
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

        {/* Waiting for opponent's move for mobile */}
        {gameState.phase === "selection" && !isPlayerTurn && (
          <Card className="block md:hidden">
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
                    <span>
                      Last Attack: {capitalize(player.currentAttackType)}
                    </span>
                  </div>
                )}
                {player?.currentDefenseType && (
                  <div className="flex items-center gap-2">
                    {getMoveTypeIcon(player.currentDefenseType)}
                    <span>
                      Last Defense: {capitalize(player.currentDefenseType)}
                    </span>
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
                    <span>
                      Last Attack: {capitalize(opponent.currentAttackType)}
                    </span>
                  </div>
                )}
                {opponent?.currentDefenseType && (
                  <div className="flex items-center gap-2">
                    {getMoveTypeIcon(opponent.currentDefenseType)}
                    <span>
                      Last Defense: {capitalize(opponent.currentDefenseType)}
                    </span>
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

        {/* Selection Phase UI - Modified to show only attack or defense */}
        {gameState.phase === "selection" && isPlayerTurn && (
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>
                {gameState.currentTurnType === "attack"
                  ? "Choose Your Attack"
                  : "Choose Your Defense"}
              </CardTitle>
              <CardDescription>
                {gameState.currentTurnType === "attack"
                  ? "Rock beats Scissors, Scissors beats Paper, Paper beats Rock"
                  : `Defend against opponent's attack`}
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
                    variant={
                      localMoveType === "scissors" ? "default" : "outline"
                    }
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
          <Card className="hidden md:block">
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
        <Card>
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
              <Button
                onClick={onExitGame}
                variant="secondary"
                className="w-full"
              >
                Return to Lobby
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
