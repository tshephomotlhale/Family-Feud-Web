"use client";

import Image from "next/image";
import { useState } from "react";
import { db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";

interface Answer {
  answer: string;
  points: number;
  revealed: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

export default function CreateGamePage() {
  const [roomName, setRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initialQuestions: Question[] = [
    {
      question:
        "Name something a programmer might blame when their code doesn’t work as expected.",
      answers: [
        { answer: "Bug in the Code", points: 30, revealed: false },
        { answer: "Chat GPT", points: 25, revealed: false },
        { answer: "Internet Connection", points: 15, revealed: false },
        { answer: "Third-Party Libraries", points: 12, revealed: false },
        { answer: "Clear The Cache", points: 8, revealed: false },
        { answer: "A Typo", points: 5, revealed: false },
        { answer: "Missing semicolon/Sytax", points: 3, revealed: false },
        { answer: "Their PC", points: 2, revealed: false },
      ],
    },
    {
      question:
        "Name a popular programming language that beginners often learn to code with.",
      answers: [
        { answer: "Python", points: 35, revealed: false },
        { answer: "JavaScript", points: 26, revealed: false },
        { answer: "Java", points: 13, revealed: false },
        { answer: "C", points: 9, revealed: false },
        { answer: "C++", points: 9, revealed: false },
        { answer: "Ruby", points: 4, revealed: false },
        { answer: "Go", points: 4, revealed: false },
      ],
    },
    {
      question:
        "Name a sorting algorithm you’d use to organize your messy code files faster than a snail’s pace!",
      answers: [
        { answer: "Quick Sort", points: 33, revealed: false },
        { answer: "Merge Sort", points: 27, revealed: false },
        { answer: "Heap Sort", points: 15, revealed: false },
        { answer: "Bubble Sort", points: 10, revealed: false },
        { answer: "Insertion Sort", points: 8, revealed: false },
        { answer: "Selection Sort", points: 7, revealed: false },
      ],
    },
    {
      question:
        "’m a golden principles of UX design, Who am I?",
      answers: [
        { answer: "Consistency", points: 32, revealed: false },
        { answer: "Affordance", points: 21, revealed: false },
        { answer: "Constraints", points: 19, revealed: false },
        { answer: "Feedback", points: 16, revealed: false },
        { answer: "Visibility", points: 12, revealed: false }
      ],
    },
    {
      question: "Name one of the top four networking protocols essential for Internet communication.",
      answers: [
        { answer: "TCP/IP", points: 40, revealed: false },
        { answer: "UDP", points: 25, revealed: false },
        { answer: "HTTP", points: 20, revealed: false },
        { answer: "DNS", points: 15, revealed: false }
      ]
    } 
  ];

  const createRoom = async () => {
    try {
      if (!roomName.trim()) {
        setError("Please enter a room name");
        return;
      }

      if (roomName.length < 3) {
        setError("Room name must be at least 3 characters long");
        return;
      }

      setIsLoading(true);
      setError(null);

      const roomData = {
        name: roomName.trim(),
        createdAt: new Date(),
        score: 0,
        teams: [],
        status: "waiting",
        questions: initialQuestions.map((question) => ({
          question: question.question,
          answers: question.answers.map((answer) => ({
            answer: answer.answer,
            points: answer.points,
            revealed: answer.revealed,
          })),
        })),
        currentQuestion: 0,
        strikes: 0, // Added strikes field with default value
      };

      const roomRef = await addDoc(collection(db, "rooms"), roomData);
      console.log("Room created with ID:", roomRef.id);
      router.push(`/lobby/${roomRef.id}`); // Note: Changed to /lobby/ to match your navigation
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create room. Please try again.";
      console.error("Error creating room:", error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <Image
        src="/BIC Club Introduction (1).svg"
        alt="Family Feud Logo"
        width={120}
        height={120}
        className="mx-auto mb-6"
      />
      <Card className="max-w-[500px] w-full p-6 rounded-2xl">
        <CardHeader className="flex flex-col gap-2 text-center">
          <h1 className="font-bold text-3xl text-warning">Create Game Room</h1>
          <p className="text-sm">
            Set up a new Family Feud game room to challenge your friends!
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          <Input
            type="text"
            placeholder="Enter Game Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isLoading}
            maxLength={50}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex gap-3">
            <Button
              onPress={createRoom}
              color="warning"
              className="w-full font-semibold"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Creating..." : "Create Game"}
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
