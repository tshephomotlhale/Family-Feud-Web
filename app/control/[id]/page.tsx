"use client";
import ControlPage from "@/components/control";

export default function ControlPageWrapper({ params }: { params: { id: string } }) {
  // This wrapper ensures that the page receives the proper props from Next.js,
  // and only navigates when the admin explicitly clicks a button.
  return <ControlPage roomId={params.id} />;
}
