"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/config/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
} from "@heroui/table";
import Game from "@/components/game";
import ControlPage from "@/components/control";

interface Team {
  name: string;
  score: number;
}

interface Room {
  name: string;
  status: "waiting" | "started";
  teams: Team[];
  questions?: any[];
  currentQuestion?: number;
  strikes?: number;
}

export default function GameLobby() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid room ID in URL.");
      return;
    }
    console.log("GameLobby: Fetching room with ID:", id);

    const roomRef = doc(db, "rooms", id as string);
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Room;
          console.log("GameLobby: Room data:", data);
          setRoom(data);
        } else {
          setError("Room not found.");
        }
      },
      (err) => {
        console.error("Error fetching room:", err);
        setError("Failed to load room data.");
      }
    );

    return () => unsubscribe();
  }, [id]);

  const addTeam = async () => {
    if (!teamName.trim()) {
      setError("Please enter a team name.");
      return;
    }

    if (room?.status === "started") {
      setError("Cannot add teams after the game has started.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const updatedTeams: Team[] = [
        ...(room?.teams || []),
        { name: teamName.trim(), score: 0 },
      ];
      const roomRef = doc(db, "rooms", id as string);
      await updateDoc(roomRef, { teams: updatedTeams });
      setTeamName("");
    } catch (err) {
      console.error("Error adding team:", err);
      setError("Failed to add team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async () => {
    if (!room) return;
    try {
      setIsLoading(true);
      setError(null);
      if (!room.teams || room.teams.length < 2) {
        setError("At least 2 teams are required to start the game.");
        return;
      }
      const roomRef = doc(db, "rooms", id as string);
      await updateDoc(roomRef, { status: "started" });
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <p className="text-red-500 text-xl">{error}</p>
        <Button onPress={() => router.push("/")} color="warning" className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <p className="text-red-500 text-xl">Invalid room ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <Image
        src="/BIC Club Introduction (1).svg"
        alt="BIC Club Family Feud Tech Edition Logo"
        width={120}
        height={120}
        className="mx-auto mb-6"
      />
      <Card className="max-w-[600px] w-full p-6 rounded-2xl">
        <CardHeader className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-3xl text-warning">
            {room?.name || "Loading..."}
          </h1>
          {room?.status === "started" ? (
            <div className="flex gap-3 justify-center text-sm">
              <Button
                onPress={() => router.push(`/game/${id}`)}
                variant="flat"
                className="text-warning font-semibold"
              >
                Go to Game
              </Button>
              <Button
                onPress={() => router.push(`/control/${id}`)}
                color="warning"
                className="font-semibold"
              >
                Admin
              </Button>
            </div>
          ) : (
            <p className="text-sm">Add teams and start the game!</p>
          )}
        </CardHeader>
        <CardBody className="space-y-6">
          {room?.status !== "started" && (
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter Team Name"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                maxLength={50}
                className="flex-1"
              />
              <Button
                onPress={addTeam}
                color="warning"
                className="font-semibold"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Adding..." : "Add Team"}
              </Button>
            </div>
          )}

          {room?.teams && room.teams.length > 0 ? (
            <Table aria-label="Teams table">
              <TableHeader>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
              </TableHeader>
              <TableBody>
                {room.teams.map((team: Team, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.score} Points</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No teams added yet.</p>
          )}

          {room?.status !== "started" && (
            <div className="flex gap-3">
              <Button
                onPress={startGame}
                color="warning"
                className="w-full font-semibold"
                disabled={isLoading || (room?.teams?.length || 0) < 2}
                isLoading={isLoading}
              >
                Start Game
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}
