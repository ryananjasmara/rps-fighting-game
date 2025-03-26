import { useEffect, useState } from "react";
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Progress } from "@ui/progress";
import { HowToPlayModal } from "@components/how-to-play-modal";
import { Hand, Heart, Scissors, Shield, Scroll, Sword } from "lucide-react";
import { StickFigure } from "@components/stick-figure";
import { cn } from "@components/lib/utils";

type MoveType = "rock" | "paper" | "scissors";
type TurnType = "attack" | "defend";
type ActionType = "idle" | "attack" | "defend" | "hit" | "victory" | "defeat";

interface Player {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  currentAttackType: MoveType | null;
  currentDefenseType: MoveType | null;
}

export function GameBoardAI({
  playerName,
  onExitGame,
}: {
  playerName: string;
  onExitGame: () => void;
}) {
  const [player, setPlayer] = useState<Player>({
    name: playerName,
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 5,
    currentAttackType: null,
    currentDefenseType: null,
  });

  const [bot, setBot] = useState<Player>({
    name: "Computer",
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 5,
    currentAttackType: null,
    currentDefenseType: null,
  });

  const [currentTurn, setCurrentTurn] = useState<TurnType>("attack");
  const [gameLog, setGameLog] = useState<string[]>([
    "Game started. Your turn to attack!",
  ]);
  const [localMoveType, setLocalMoveType] = useState<MoveType | null>(null);
  const [effectiveness, setEffectiveness] = useState<
    "super" | "normal" | "not" | null
  >(null);
  const [attackAnimation, setAttackAnimation] = useState<string | null>(null);
  const [playerAction, setPlayerAction] = useState<ActionType>("idle");
  const [botAction, setBotAction] = useState<ActionType>("idle");
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (player.health <= 0) {
      setGameLog((prev) => ["Game Over! You Lost!", ...prev]);

      setPlayerAction("defeat");
      setBotAction("victory");

      setTimeout(() => {
        setPlayerAction("idle");
        setBotAction("idle");
      }, 1000);
    } else if (bot.health <= 0) {
      setGameLog((prev) => ["Game Over! You Won!", ...prev]);

      setPlayerAction("victory");
      setBotAction("defeat");

      setTimeout(() => {
        setPlayerAction("idle");
        setBotAction("idle");
      }, 1000);
    }
  }, [player.health, bot.health]);

  // Helper functions
  const getBotMove = (): MoveType => {
    const moves: MoveType[] = ["rock", "paper", "scissors"];
    return moves[Math.floor(Math.random() * moves.length)];
  };

  const getEffectiveness = (attack: MoveType, defense: MoveType) => {
    if (
      (attack === "rock" && defense === "scissors") ||
      (attack === "scissors" && defense === "paper") ||
      (attack === "paper" && defense === "rock")
    ) {
      return { multiplier: 2, type: "super" as const };
    } else if (attack === defense) {
      return { multiplier: 1, type: "normal" as const };
    } else {
      return { multiplier: 0.5, type: "not" as const };
    }
  };

  const handleMoveSelect = (move: MoveType) => {
    setLocalMoveType(move);
  };

  const handleConfirmMove = () => {
    if (!localMoveType) return;

    setIsDelayed(true);

    if (currentTurn === "attack") {
      // Player attacking
      setPlayerAction("attack");
      setBotAction("defend");
      const botDefense = getBotMove();
      const { multiplier, type } = getEffectiveness(localMoveType, botDefense);
      setEffectiveness(type);

      const damage = Math.max(
        5,
        Math.floor(player.attack * multiplier - bot.defense + Math.random() * 5)
      );
      setAttackAnimation("bot");

      setTimeout(() => {
        setBot((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - damage),
          currentDefenseType: botDefense,
        }));
        setPlayer((prev) => ({
          ...prev,
          currentAttackType: localMoveType,
        }));
        setGameLog((prev) => [
          `You attacked with ${localMoveType}. Bot defended with ${botDefense}. Dealt ${damage} damage!`,
          ...prev,
        ]);
        setAttackAnimation(null);
        setPlayerAction("idle");
        setBotAction("idle");
        setEffectiveness(null);
        setIsDelayed(false);
      }, 1000);

      // Bot's turn to attack
      setCurrentTurn("defend");
      const botAttack = getBotMove();
      setBot((prev) => ({ ...prev, currentAttackType: botAttack }));
    } else {
      // Player defending
      setPlayerAction("defend");
      setBotAction("attack");
      const botAttack = bot.currentAttackType!;
      const { multiplier, type } = getEffectiveness(botAttack, localMoveType);
      setEffectiveness(type);

      const damage = Math.max(
        5,
        Math.floor(bot.attack * multiplier - player.defense + Math.random() * 5)
      );
      setAttackAnimation("player");

      setTimeout(() => {
        setPlayer((prev) => ({
          ...prev,
          health: Math.max(0, prev.health - damage),
          currentDefenseType: localMoveType,
        }));
        setGameLog((prev) => [
          `Bot attacked with ${botAttack}. You defended with ${localMoveType}. Took ${damage} damage!`,
          ...prev,
        ]);
        setAttackAnimation(null);
        setPlayerAction("idle");
        setBotAction("idle");
        setEffectiveness(null);
        setIsDelayed(false);
      }, 1000);

      // Player's turn to attack
      setCurrentTurn("attack");
      setBot((prev) => ({ ...prev, currentAttackType: null }));
    }
    setLocalMoveType(null);
  };

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

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="md:text-2xl font-bold">VS Computer</h1>
        <div className="flex items-center gap-2">
          <HowToPlayModal />
          <Button variant="destructive" size="sm" onClick={onExitGame}>
            Exit Game
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Battle Arena */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl overflow-hidden border">
          <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-12">
            {/* Player Stick Figure */}
            <div className="flex flex-col items-center">
              <StickFigure
                action={playerAction}
                moveType={player.currentAttackType || localMoveType || "rock"}
                color="blue"
                flipped={false}
                className="h-24 w-24 sm:h-40 sm:w-40"
              />
              <div className="mt-2 w-20 sm:w-32">
                <Progress
                  value={(player.health / player.maxHealth) * 100}
                  className="h-1.5 sm:h-2"
                />
                <p className="text-[10px] sm:text-xs text-center mt-1">
                  {player.health}/{player.maxHealth}
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
                  ? "Normal"
                  : "Not Effective"}
              </div>
            )}

            {/* VS */}
            <div className="text-2xl sm:text-4xl font-bold opacity-20">VS</div>

            {/* Bot Stick Figure */}
            <div className="flex flex-col items-center">
              <StickFigure
                action={botAction}
                moveType={bot.currentAttackType || "rock"}
                color="red"
                flipped={true}
                className="h-24 w-24 sm:h-40 sm:w-40"
              />
              <div className="mt-2 w-20 sm:w-32">
                <Progress
                  value={(bot.health / bot.maxHealth) * 100}
                  className="h-1.5 sm:h-2"
                />
                <p className="text-[10px] sm:text-xs text-center mt-1">
                  {bot.health}/{bot.maxHealth}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Move Selection for Mobile */}
        {player.health > 0 && bot.health > 0 && (
          <Card className="block md:hidden">
            <CardHeader>
              <CardTitle>
                {currentTurn === "attack"
                  ? "Choose Your Attack"
                  : "Choose Your Defense"}
              </CardTitle>
              <CardDescription>
                {currentTurn === "attack"
                  ? "Rock beats Scissors, Scissors beats Paper, Paper beats Rock"
                  : `Defend against bot's attack`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-medium mb-3">
                  {currentTurn === "attack" ? "Attack Type:" : "Defense Type:"}
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
                disabled={!localMoveType || isDelayed}
                onClick={handleConfirmMove}
              >
                Confirm {currentTurn === "attack" ? "Attack" : "Defense"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Player Card */}
          <Card
            className={cn(
              "relative overflow-hidden",
              attackAnimation === "player" && "animate-shake"
            )}
          >
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex justify-between items-center">
                <span>{player.name} (You)</span>
                <Heart className="h-5 w-5 text-red-500" />
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Progress
                    value={(player.health / player.maxHealth) * 100}
                    className="h-4"
                  />
                  <span className="text-sm font-medium">
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Sword className="h-5 w-5 text-orange-500" />
                  <span>Attack: {player.attack}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Defense: {player.defense}</span>
                </div>
                {player.currentAttackType && (
                  <div className="flex items-center gap-2">
                    {getMoveTypeIcon(player.currentAttackType)}
                    <span>
                      Last Attack: {capitalize(player.currentAttackType)}
                    </span>
                  </div>
                )}
                {player.currentDefenseType && (
                  <div className="flex items-center gap-2">
                    {getMoveTypeIcon(player.currentDefenseType)}
                    <span>
                      Last Defense: {capitalize(player.currentDefenseType)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bot Card */}
          <Card
            className={cn(
              "relative overflow-hidden",
              attackAnimation === "bot" && "animate-shake"
            )}
          >
            <CardHeader className="bg-destructive/10">
              <CardTitle className="flex justify-between items-center">
                <span>{bot.name}</span>
                <Heart className="h-5 w-5 text-red-500" />
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Progress
                    value={(bot.health / bot.maxHealth) * 100}
                    className="h-4"
                  />
                  <span className="text-sm font-medium">
                    {bot.health}/{bot.maxHealth}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Sword className="h-5 w-5 text-orange-500" />
                  <span>Attack: {bot.attack}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Defense: {bot.defense}</span>
                </div>
                {bot.currentAttackType && (
                  <div className="flex items-center gap-2">
                    {getMoveTypeIcon(bot.currentAttackType)}
                    <span>
                      Last Attack: {capitalize(bot.currentAttackType)}
                    </span>
                  </div>
                )}
                {bot.currentDefenseType && (
                  <div className="flex items-center gap-2">
                    {getMoveTypeIcon(bot.currentDefenseType)}
                    <span>
                      Last Defense: {capitalize(bot.currentDefenseType)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Move Selection */}
        {player.health > 0 && bot.health > 0 && (
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>
                {currentTurn === "attack"
                  ? "Choose Your Attack"
                  : "Choose Your Defense"}
              </CardTitle>
              <CardDescription>
                {currentTurn === "attack"
                  ? "Rock beats Scissors, Scissors beats Paper, Paper beats Rock"
                  : `Defend against bot's ${bot.currentAttackType} attack`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-medium mb-3">
                  {currentTurn === "attack" ? "Attack Type:" : "Defense Type:"}
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
                disabled={!localMoveType || isDelayed}
                onClick={handleConfirmMove}
              >
                Confirm {currentTurn === "attack" ? "Attack" : "Defense"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Log */}
        <Card>
          <CardHeader>
            <CardTitle>
              {player.health <= 0
                ? "Game Over! You Lost!"
                : bot.health <= 0
                ? "Game Over! You Won!"
                : "Battle Log"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 overflow-y-auto border rounded-md p-4">
              {gameLog.map((log, index) => (
                <p key={index} className="mb-1">
                  {log}
                </p>
              ))}
            </div>
          </CardContent>
          {(player.health <= 0 || bot.health <= 0) && (
            <CardFooter>
              <Button
                onClick={onExitGame}
                variant="secondary"
                className="w-full"
              >
                Return to Lobby
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
