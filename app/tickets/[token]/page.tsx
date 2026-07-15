import { notFound } from "next/navigation";
import { Header } from "../../components/header";
import { buyerTickets } from "../../data/demo";
import { TicketCabinet } from "./ticket-cabinet";

type TicketPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function TicketPage({ params }: TicketPageProps) {
  const { token } = await params;
  const ticket = buyerTickets.find((item) => item.token === token);

  if (!ticket) {
    notFound();
  }

  return (
    <>
      <Header />
      <TicketCabinet ticket={ticket} />
    </>
  );
}
