"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";

export default function JoinGamePage() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const joinRoom = async () => {
    try {
      if (!roomCode.trim()) {
        setError("Please enter a room code");
        return;
      }

      if (roomCode.length < 3) {
        setError("Room code must be at least 3 characters long");
        return;
      }

      setIsLoading(true);
      setError(null);

      const roomRef = doc(db, "rooms", roomCode);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        router.push(`/game/${roomCode}`);
      } else {
        setError("Room not found. Please check the code and try again.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to join room. Please try again.";
      console.error("Error joining room:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <Image
        src="/BIC Club Introduction (1).svg"
        alt="BIC Club Family Feud Tech Edition Logo"
        width={120}
        height={120}
        className="mx-auto mb-6"
      />
      <Card className="max-w-[500px] w-full p-6 rounded-2xl">
        <CardHeader className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-3xl text-warning">Join Game Room</h1>
          <p className="text-sm">
            Enter the room code provided by the host to join the game!
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          <Input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => {
              setRoomCode(e.target.value);
              setError(null); // Clear error on input change
            }}
            disabled={isLoading}
            maxLength={50} // Consistent with CreateGamePage
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex gap-3">
            <Button
              onPress={joinRoom}
              color="warning"
              className="w-full font-semibold"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Joining..." : "Join Game"}
            </Button>
            <Button
              onPress={() => router.push("/")}
              variant="bordered"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}