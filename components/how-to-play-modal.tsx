import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { HelpCircle } from "lucide-react";

export function HowToPlayModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="w-4 h-4 mr-2" />
          How to Play
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How to Play</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
