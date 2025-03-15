"use client";
import Game from "@/components/game";

export default function GameWrapper({ params }: { params: { id: string } }) {
  return <Game roomId={params.id} />;
}
