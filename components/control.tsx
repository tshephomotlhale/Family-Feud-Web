"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/config/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
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
  questions: Question[];
  currentQuestion: number;
  teams: Team[];
  strikes: number;
}

interface ControlPageProps {
  roomId: string;
}

export default function ControlPage({ roomId }: ControlPageProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [strikes, setStrikes] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [scoreChange, setScoreChange] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

          if (questions.length > 0 && questionIndex >= 0 && questionIndex < questions.length) {
            setCurrentQuestion(questions[questionIndex]);
          } else {
            setCurrentQuestion(null);
          }

          setRoom(data);
          setTeams(Array.isArray(data.teams) ? data.teams : []);
          setStrikes(typeof data.strikes === "number" ? data.strikes : 0);
          setError(null);
        } else {
          setError(`Room not found for roomId: ${roomId}`);
        }
      },
      (err) => {
        setError(`Failed to load game data: ${err.message}`);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const handleNextQuestion = async () => {
    if (!room) return;
    const currentIndex = room.currentQuestion;
    if (currentIndex + 1 < room.questions.length) {
      const roomRef = doc(db, "rooms", roomId);
      try {
        setIsUpdating(true);
        await updateDoc(roomRef, { currentQuestion: currentIndex + 1 });
      } catch (err: any) {
        console.error("Error moving to next question:", err);
        setError("Error moving to next question.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handlePrevQuestion = async () => {
    if (!room) return;
    const currentIndex = room.currentQuestion;
    if (currentIndex > 0) {
      const roomRef = doc(db, "rooms", roomId);
      try {
        setIsUpdating(true);
        await updateDoc(roomRef, { currentQuestion: currentIndex - 1 });
      } catch (err: any) {
        console.error("Error moving to previous question:", err);
        setError("Error moving to previous question.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleRevealAnswer = async (index: number) => {
    if (!room) return;
    const currentIndex = room.currentQuestion;
    if (currentIndex < 0 || currentIndex >= room.questions.length) return;

    // Copy the entire questions array
    const updatedQuestions = [...room.questions];
    const updatedAnswers = [...updatedQuestions[currentIndex].answers];

    if (!updatedAnswers[index].revealed) {
      updatedAnswers[index] = { ...updatedAnswers[index], revealed: true };
      updatedQuestions[currentIndex].answers = updatedAnswers;

      const roomRef = doc(db, "rooms", roomId);
      try {
        setIsUpdating(true);
        // Update the entire questions array
        await updateDoc(roomRef, { questions: updatedQuestions });
      } catch (err: any) {
        console.error("Error revealing answer:", err);
        setError("Error revealing answer.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleUpdateScore = async () => {
    if (!selectedTeam || scoreChange === 0 || !room) return;
    const roomRef = doc(db, "rooms", roomId);
    const updatedTeams = teams.map((team) =>
      team.name === selectedTeam ? { ...team, score: team.score + scoreChange } : team
    );
    try {
      setIsUpdating(true);
      await updateDoc(roomRef, { teams: updatedTeams });
      setScoreChange(0);
    } catch (err: any) {
      console.error("Error updating score:", err);
      setError("Error updating score.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddStrike = async () => {
    if (!room) return;
    if (strikes >= 3) {
      setError("Maximum strikes reached.");
      return;
    }
    const roomRef = doc(db, "rooms", roomId);
    try {
      setIsUpdating(true);
      await updateDoc(roomRef, { strikes: strikes + 1 });
    } catch (err: any) {
      console.error("Error adding strike:", err);
      setError("Error adding strike.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetStrikes = async () => {
    if (!room) return;
    const roomRef = doc(db, "rooms", roomId);
    try {
      setIsUpdating(true);
      await updateDoc(roomRef, { strikes: 0 });
    } catch (err: any) {
      console.error("Error resetting strikes:", err);
      setError("Error resetting strikes.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-500 text-xl">{error}</p>
        <Button onPress={() => router.push("/")} color="warning" className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-xl">Loading control panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Image
        src="/BIC Club Introduction (1).svg"
        alt="BIC Club Family Feud Tech Edition Logo"
        width={150}
        height={150}
        className="mx-auto mb-6"
      />
      <div className="w-full max-w-[1400px] flex flex-col items-start justify-center gap-6">
        {/* Title Card */}
        <Card className="w-full">
          <CardHeader className="text-center w-full p-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Control Panel
              {currentQuestion ? ` - ${currentQuestion.question}` : " - No question available"}
            </h2>
          </CardHeader>
        </Card>

        <div className="w-full flex flex-col md:flex-row items-start justify-between gap-6">
          {/* Teams list */}
          <div className="w-full md:w-1/5 flex flex-col gap-2">
            <Card className="p-1 rounded-lg text-center">
              <CardHeader className="text-center">
                <h3 className="text-xl text-warning font-semibold">Teams</h3>
              </CardHeader>
              <CardBody>
                {teams.map((team, index) => (
                  <p key={index} className="text-3xl font-bold">
                    {team.name}: {team.score}
                  </p>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Question and Reveal Controls */}
          <div className="w-full md:w-3/5">
            <Card className="p-2 rounded-xl">
              <CardBody>
                <div className="flex flex-col md:flex-row gap-3">
                  {/* First half of answers */}
                  <div className="flex-1 flex flex-col gap-2">
                    {currentQuestion &&
                      currentQuestion.answers.slice(0, 4).map((answer, index) => (
                        <div key={index} className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-warning w-8">
                              {index + 1}.
                            </span>
                            <Button
                              onPress={() => handleRevealAnswer(index)}
                              color="warning"
                              className="flex-1 text-center text-lg font-medium rounded-md p-1"
                              disabled={answer.revealed || isUpdating}
                            >
                              {answer.revealed
                                ? `${answer.answer} (${answer.points})`
                                : "Reveal"}
                            </Button>
                          </div>
                          {/* Show the admin the actual answer if it's not revealed yet */}
                          {!answer.revealed && (
                            <p className="text-sm text-gray-500 ml-10">
                              Admin sees: {answer.answer} ({answer.points})
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                  {/* Second half of answers */}
                  <div className="flex-1 flex flex-col gap-2">
                    {currentQuestion &&
                      currentQuestion.answers.slice(4, 8).map((answer, index) => (
                        <div key={index + 4} className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-warning w-8">
                              {index + 5}.
                            </span>
                            <Button
                              onPress={() => handleRevealAnswer(index + 4)}
                              color="warning"
                              className="flex-1 text-center text-lg font-medium rounded-md p-1"
                              disabled={answer.revealed || isUpdating}
                            >
                              {answer.revealed
                                ? `${answer.answer} (${answer.points})`
                                : "Reveal"}
                            </Button>
                          </div>
                          {/* Show the admin the actual answer if it's not revealed yet */}
                          {!answer.revealed && (
                            <p className="text-sm text-gray-500 ml-10">
                              Admin sees: {answer.answer} ({answer.points})
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Question navigation and strike controls */}
                <div className="flex justify-between mt-4">
                  <Button
                    onPress={handlePrevQuestion}
                    color="warning"
                    className="p-2"
                    disabled={isUpdating}
                  >
                    Previous
                  </Button>
                  <Button
                    onPress={handleNextQuestion}
                    color="warning"
                    className="p-2"
                    disabled={isUpdating}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-center mt-4">
                  <p className="text-xl text-red-500 font-bold">
                    Strikes: {strikes >= 3 ? "Max" : "X ".repeat(strikes).trim()}
                  </p>
                  <div className="flex justify-center gap-2 mt-2">
                    <Button
                      onPress={handleAddStrike}
                      color="warning"
                      className="p-1"
                      disabled={isUpdating || strikes >= 3}
                    >
                      +1
                    </Button>
                    <Button
                      onPress={handleResetStrikes}
                      color="warning"
                      className="p-1"
                      disabled={isUpdating}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Score Control */}
          <div className="w-full md:w-1/5 flex flex-col gap-2">
            <Card className="p-1 rounded-lg text-center">
              <CardHeader className="text-center">
                <h3 className="text-xl text-warning font-semibold">Score Control</h3>
              </CardHeader>
              <CardBody>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full text-xl text-warning font-semibold p-1 mb-2 rounded-md"
                  disabled={isUpdating}
                >
                  <option value="">Select Team</option>
                  {teams.map((team, index) => (
                    <option key={index} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  value={scoreChange.toString()}
                  onChange={(e) => setScoreChange(Number(e.target.value))}
                  className="w-full text-xl p-1 mb-2"
                  placeholder="Score Change"
                  disabled={isUpdating}
                />
                <Button
                  onPress={handleUpdateScore}
                  color="warning"
                  className="w-full p-2"
                  disabled={isUpdating}
                >
                  Update Score
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
