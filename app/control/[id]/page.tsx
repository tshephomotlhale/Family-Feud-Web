import dynamic from "next/dynamic";

// Dynamically import your client component so that it only renders on the client.
const ControlPageClient = dynamic(() => import("@/components/control"), {
  ssr: false,
});

export default function ControlPageWrapper({
  params,
}: {
  params: { id: string };
  searchParams?: Record<string, string | string[]>;
}) {
  // Now params is resolved on the server, and we pass the id to our client component.
  return <ControlPageClient roomId={params.id} />;
}
