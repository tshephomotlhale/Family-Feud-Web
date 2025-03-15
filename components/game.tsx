"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";

interface Answer {
  answer: string;
  points: number;
  revealed: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

interface Team {
  name: string;
  score: number;
}

interface Room {
  name: string;
  status: string;
  questions: Question[];
  currentQuestion: number;
  teams: Team[];
  strikes: number;
}

interface GameProps {
  roomId: string;
}

export default function Game({ roomId }: GameProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [strikes, setStrikes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Strike sound: uses a simpler file name.
  const strikeSoundRef = useRef<HTMLAudioElement>(
    new Audio("/sounds/family_feud_strike.mp3")
  );
  const prevStrikesRef = useRef<number>(0);

  useEffect(() => {
    if (strikes > prevStrikesRef.current) {
      strikeSoundRef.current.currentTime = 0;
      strikeSoundRef.current.play().catch((err) => {
        console.error("Error playing strike sound:", err);
      });
    }
    prevStrikesRef.current = strikes;
  }, [strikes]);

  const revealSoundRef = useRef<HTMLAudioElement>(
    new Audio("/sounds/reveal.mp3")
  );
  const prevRevealedAnswersRef = useRef<boolean[]>([]);

  useEffect(() => {
    if (currentQuestion) {
      currentQuestion.answers.forEach((answer, index) => {
        if (answer.revealed && !prevRevealedAnswersRef.current[index]) {
          console.log("Revealing answer", index, answer); // Debug log
          revealSoundRef.current.currentTime = 0;
          revealSoundRef.current.play().catch((err) => {
            console.error("Error playing reveal sound:", err);
          });
        }
      });
      prevRevealedAnswersRef.current = currentQuestion.answers.map(
        (a) => a.revealed
      );
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (!roomId) {
      setError("Invalid room ID: roomId is empty or undefined.");
      return;
    }
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Room;
          const questions = Array.isArray(data.questions) ? data.questions : [];
          const questionIndex =
            typeof data.currentQuestion === "number" ? data.currentQuestion : 0;
          if (
            questions.length > 0 &&
            questionIndex >= 0 &&
            questionIndex < questions.length
          ) {
            setCurrentQuestion(questions[questionIndex]);
          } else {
            setCurrentQuestion(null);
            setError(
              "Invalid question data: No valid questions or currentQuestion index out of range."
            );
          }
          setRoom(data);
          setTeams(Array.isArray(data.teams) ? data.teams : []);
          setStrikes(typeof data.strikes === "number" ? data.strikes : 0);
          setError(null);
        } else {
          setError(`Room not found in Firestore for roomId: ${roomId}`);
        }
      },
      (err) => {
        setError(`Failed to load game data: ${err.message}`);
      }
    );
    return () => unsubscribe();
  }, [roomId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-500 text-xl">{error}</p>
        <Button
          onPress={() => router.push("/")}
          color="warning"
          className="mt-4"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  if (!room || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-xl">Loading game...</p>
      </div>
    );
  }

  const totalPoints = currentQuestion.answers.reduce(
    (sum, answer) => (answer.revealed ? sum + answer.points : sum),
    0
  );

  const maxAnswers = 8;
  const displayedAnswers = [...currentQuestion.answers];
  while (displayedAnswers.length < maxAnswers) {
    displayedAnswers.push({ answer: "", points: 0, revealed: false });
  }
  const leftAnswers = displayedAnswers.slice(0, 4);
  const rightAnswers = displayedAnswers.slice(4, 8);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Image
        src="/BIC Club Introduction (1).svg"
        alt="BIC Club Family Feud Tech Edition Logo"
        width={150}
        height={150}
        className="mx-auto mb-6"
      />
      <div className="w-full max-w-[1400px] flex flex-col items-center gap-6">
        <Card className="w-full rounded-xl shadow-md overflow-hidden">
          <CardHeader className="text-center p-4">
            <h2 className="text-xl md:text-3xl font-bold text-warning">
              {currentQuestion.question}
            </h2>
            <p className="text-xl md:text-2xl">
              Total Points:{" "}
              <span className="font-bold text-warning">{totalPoints}</span>
            </p>
          </CardHeader>
        </Card>

        <div className="w-full flex flex-col md:flex-row justify-between gap-6">
          {/* Teams List (Left Side) */}
          <div className="w-full md:w-1/5 flex flex-col gap-2">
            {teams.slice(0, Math.ceil(teams.length / 2)).map((team, index) => (
              <Card key={index} className="p-4 rounded-lg text-center">
                <CardHeader className="text-center">
                  <h3 className="text-2xl text-warning font-semibold">
                    {team.name}
                  </h3>
                </CardHeader>
                <CardBody className="text-center">
                  <p className="text-3xl font-bold">{team.score}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          {/* Answers */}
          <div className="w-full md:w-3/5">
            <Card className="p-2 rounded-xl">
              <CardBody>
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Left Answers */}
                  <div className="flex-1 flex flex-col gap-4">
                    {leftAnswers.map((answer, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-xl font-bold text-warning mr-3 w-8">
                          {index + 1}.
                        </span>
                        <Button
                          disabled
                          variant="flat"
                          radius="full"
                          size="lg"
                          className="flex-1 text-center text-xl font-medium p-2 border border-gray-300"
                        >
                          {answer.revealed ? (
                            <>
                              {answer.answer} (
                              <span className="font-bold text-warning">
                                {answer.points}
                              </span>
                              )
                            </>
                          ) : answer.answer ? (
                            "???"
                          ) : (
                            " "
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Right Answers */}
                  <div className="flex-1 flex flex-col gap-4">
                    {rightAnswers.map((answer, index) => (
                      <div key={index + 4} className="flex items-center">
                        <span className="text-xl font-bold text-warning mr-3 w-8">
                          {index + 5}.
                        </span>
                        <Button
                          disabled
                          variant="flat"
                          radius="full"
                          size="lg"
                          className="flex-1 text-center text-xl font-medium p-2 border border-gray-300"
                        >
                          {answer.revealed ? (
                            <>
                              {answer.answer} (
                              <span className="font-bold text-warning">
                                {answer.points}
                              </span>
                              )
                            </>
                          ) : answer.answer ? (
                            "???"
                          ) : (
                            " "
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Strike Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <Button
                      key={i}
                      disabled
                      variant="ghost"
                      className={`text-4xl font-bold ${i < strikes ? "text-danger" : "text-gray-300"}`}
                    >
                      X
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
          {/* Teams List (Right Side) */}
          <div className="w-full md:w-1/5 flex flex-col gap-2">
            {teams.slice(Math.ceil(teams.length / 2)).map((team, index) => (
              <Card key={index} className="p-4 rounded-lg text-center">
                <CardHeader className="text-center">
                  <h3 className="text-2xl text-warning font-semibold">
                    {team.name}
                  </h3>
                </CardHeader>
                <CardBody className="text-center">
                  <p className="text-3xl font-bold">{team.score}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
