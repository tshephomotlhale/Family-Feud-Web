import Game from "@/components/game";

export default function GameRoute({ params }: { params: { id: string } }) {
  return <Game roomId={params.id} />;
}