"use client";

import { useParams } from "next/navigation";
import { db } from "@/config/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

export default function BuzzerPage() {
  const { id } = useParams();
  const [buzzer, setBuzzer] = useState<any>(null);

  const buzz = async () => {
    await updateDoc(doc(db, "rooms", id as string), {
      buzzer: {
        player: "Player 1",
        timestamp: new Date().toISOString(),
      },
    });
  };

  useEffect(() => {
    const buzzerRef = doc(db, "rooms", id as string);
    const unsubscribe = onSnapshot(buzzerRef, (doc) => {
      setBuzzer(doc.data()?.buzzer);
    });

    return () => unsubscribe();
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-[450px] w-full p-6">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold">Buzzer System</h1>
          <p className="text-sm text-default-500">Game ID: {id}</p>
        </CardHeader>
        <CardBody className="flex flex-col items-center">
          <Button color="danger" onClick={buzz} className="rounded-full px-10 py-6 text-2xl">
            BUZZ!
          </Button>

          {buzzer && (
            <p className="mt-4 text-lg text-gray-700">
              First to Buzz: {buzzer.player}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
