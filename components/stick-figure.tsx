import { cn } from "@components/lib/utils";

type MoveType = "rock" | "paper" | "scissors";

type StickFigureProps = {
  action: "idle" | "attack" | "defend" | "hit" | "victory" | "defeat";
  moveType: MoveType;
  color: string;
  flipped: boolean;
  className?: string;
};

export function StickFigure({
  action,
  moveType,
  color,
  flipped,
  className,
}: StickFigureProps) {
  // Define colors based on the color prop
  const strokeColor = color === "blue" ? "#3b82f6" : "#ef4444";

  // Base class for the SVG
  const baseClass = cn(
    "transition-all duration-300",
    flipped && "scale-x-[-1]",
    className
  );

  // Render different stick figure poses based on the action and moveType
  switch (action) {
    case "idle":
      return (
        <svg
          className={baseClass}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="20" r="10" stroke={strokeColor} strokeWidth="3" />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="70"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="70"
            x2="35"
            y2="95"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="70"
            x2="65"
            y2="95"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="45"
            x2="30"
            y2="60"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="45"
            x2="70"
            y2="60"
            stroke={strokeColor}
            strokeWidth="3"
          />
        </svg>
      );

    case "attack":
      // Different attack poses based on moveType
      if (moveType === "rock") {
        return (
          <svg
            className={baseClass}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="20"
              r="10"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="40"
              y1="30"
              x2="45"
              y2="70"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="70"
              x2="30"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="70"
              x2="60"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="40"
              x2="25"
              y2="55"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="40"
              x2="85"
              y2="30"
              stroke={strokeColor}
              strokeWidth="3"
              className="animate-punch"
            />
            <circle
              cx="85"
              cy="30"
              r="8"
              stroke={strokeColor}
              strokeWidth="3"
              fill="transparent"
              className="animate-punch"
            />
          </svg>
        );
      } else if (moveType === "paper") {
        return (
          <svg
            className={baseClass}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="20"
              r="10"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="40"
              y1="30"
              x2="45"
              y2="70"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="70"
              x2="30"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="70"
              x2="60"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="40"
              x2="25"
              y2="55"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="40"
              x2="85"
              y2="30"
              stroke={strokeColor}
              strokeWidth="3"
              className="animate-paper"
            />
            <rect
              x="75"
              y="20"
              width="15"
              height="20"
              rx="2"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="animate-paper"
            />
          </svg>
        );
      } else {
        // scissors
        return (
          <svg
            className={baseClass}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="20"
              r="10"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="40"
              y1="30"
              x2="45"
              y2="70"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="70"
              x2="30"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="70"
              x2="60"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="40"
              x2="25"
              y2="55"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="45"
              y1="40"
              x2="85"
              y2="30"
              stroke={strokeColor}
              strokeWidth="3"
              className="animate-scissors"
            />
            <path
              d="M75 20 L85 30 L95 20"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="animate-scissors"
            />
            <path
              d="M75 40 L85 30 L95 40"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="animate-scissors"
            />
          </svg>
        );
      }

    case "defend":
      // Different defense poses based on moveType
      if (moveType === "rock") {
        return (
          <svg
            className={baseClass}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="20"
              r="10"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="30"
              x2="50"
              y2="70"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="70"
              x2="35"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="70"
              x2="65"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="45"
              x2="30"
              y2="45"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <circle
              cx="30"
              cy="45"
              r="8"
              stroke={strokeColor}
              strokeWidth="3"
              fill="transparent"
              className="animate-shield"
            />
          </svg>
        );
      } else if (moveType === "paper") {
        return (
          <svg
            className={baseClass}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="20"
              r="10"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="30"
              x2="50"
              y2="70"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="70"
              x2="35"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="70"
              x2="65"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="45"
              x2="30"
              y2="45"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <rect
              x="20"
              y="35"
              width="20"
              height="20"
              rx="2"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="animate-shield"
            />
          </svg>
        );
      } else {
        // scissors
        return (
          <svg
            className={baseClass}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="20"
              r="10"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="30"
              x2="50"
              y2="70"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="70"
              x2="35"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="70"
              x2="65"
              y2="95"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <line
              x1="50"
              y1="45"
              x2="30"
              y2="45"
              stroke={strokeColor}
              strokeWidth="3"
            />
            <path
              d="M20 35 L30 45 L20 55"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="animate-shield"
            />
            <path
              d="M40 35 L30 45 L40 55"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="animate-shield"
            />
          </svg>
        );
      }

    case "hit":
      return (
        <svg
          className={baseClass}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="45" cy="20" r="10" stroke={strokeColor} strokeWidth="3" />
          <line
            x1="45"
            y1="30"
            x2="40"
            y2="65"
            stroke={strokeColor}
            strokeWidth="3"
            className="animate-shake"
          />
          <line
            x1="40"
            y1="65"
            x2="25"
            y2="90"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="40"
            y1="65"
            x2="55"
            y2="90"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="40"
            y1="45"
            x2="20"
            y2="60"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="40"
            y1="45"
            x2="60"
            y2="60"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <path
            d="M60 30 L65 35 L70 30 L65 25 Z"
            fill="#ffcc00"
            stroke="#ff9900"
            strokeWidth="1"
            className="animate-hit"
          />
          <path
            d="M30 40 L35 45 L40 40 L35 35 Z"
            fill="#ffcc00"
            stroke="#ff9900"
            strokeWidth="1"
            className="animate-hit"
          />
        </svg>
      );

    case "victory":
      return (
        <svg
          className={baseClass}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="20"
            r="10"
            stroke={strokeColor}
            strokeWidth="3"
            className="animate-bounce"
          />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="70"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="70"
            x2="35"
            y2="95"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="70"
            x2="65"
            y2="95"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="40"
            x2="20"
            y2="20"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="40"
            x2="80"
            y2="20"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <path
            d="M40 15 L45 5 L50 15"
            stroke="#ffcc00"
            strokeWidth="2"
            className="animate-victory"
          />
          <path
            d="M50 15 L55 5 L60 15"
            stroke="#ffcc00"
            strokeWidth="2"
            className="animate-victory"
          />
        </svg>
      );

    case "defeat":
      return (
        <svg
          className={baseClass}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="20" r="10" stroke={strokeColor} strokeWidth="3" />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="50"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="50"
            x2="65"
            y2="40"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="50"
            x2="35"
            y2="40"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="50"
            x2="40"
            y2="80"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="50"
            x2="60"
            y2="80"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="45"
            y1="15"
            x2="40"
            y2="20"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <line
            x1="55"
            y1="15"
            x2="60"
            y2="20"
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );

    default:
      return (
        <svg
          className={baseClass}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="20" r="10" stroke={strokeColor} strokeWidth="3" />
          <line
            x1="50"
            y1="30"
            x2="50"
            y2="70"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="70"
            x2="35"
            y2="95"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="70"
            x2="65"
            y2="95"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="45"
            x2="30"
            y2="60"
            stroke={strokeColor}
            strokeWidth="3"
          />
          <line
            x1="50"
            y1="45"
            x2="70"
            y2="60"
            stroke={strokeColor}
            strokeWidth="3"
          />
        </svg>
      );
  }
}
