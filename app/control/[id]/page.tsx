"use client";
import ControlPage from "@/components/control";

export default function Page({ params }: { params: { id: string } }) {
  return <ControlPage roomId={params.id} />;
}
