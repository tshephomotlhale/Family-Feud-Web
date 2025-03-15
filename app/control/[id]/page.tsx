import ControlPage from "@/components/control";

export default function ControlRoute({ params }: { params: { id: string } }) {
  return <ControlPage roomId={params.id} />;
}