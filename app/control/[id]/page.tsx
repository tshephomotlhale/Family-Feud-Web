"use client";

import ControlPage from "@/components/control";

export default function ControlPageWrapper({ params }: { params: { id: string } }) {
  return <ControlPage roomId={params.id} />;
}
