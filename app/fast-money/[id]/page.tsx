"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/config/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function FastMoneyRound() {
  const { id } = useParams();
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    const roomRef = doc(db, "rooms", id as string);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      setRoom(doc.data());
    });

    return () => unsubscribe();
  }, [id]);

  // Submit answers and tally score
  const submitAnswers = async () => {
    let score = 0;
    const correctAnswers = room.questions[room.currentQuestion]?.answers || [];

    answers.forEach((ans) => {
      const match = correctAnswers.find(
        (item: any) => item.answer.toLowerCase() === ans.toLowerCase()
      );
      if (match) {
        score += match.points;
      }
    });

    await updateDoc(doc(db, "rooms", id as string), {
      score: room.score + score,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-[600px] w-full p-6">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold">Fast Money Round</h1>
          <p>Game ID: {id}</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {answers.map((answer, index) => (
            <Input
              key={index}
              value={answer}
              placeholder={`Answer ${index + 1}`}
              onChange={(e) => {
                const updatedAnswers = [...answers];
                updatedAnswers[index] = e.target.value;
                setAnswers(updatedAnswers);
              }}
            />
          ))}

          <Button onPress={submitAnswers} color="warning" className="w-full">
            Submit Answers
          </Button>

          <p className="text-lg font-bold">Total Score: {room?.score}</p>
        </CardBody>
      </Card>
    </div>
  );
}
