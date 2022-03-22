import { Ticket } from "../ticket.entity";

it("implements optimistic concurrency control", async () => {
  // create instance of ticket
  const ticket = Ticket.build({
    title: "New",
    price: 20,
    userId: "124",
  });
  // Save the ticket to the database
  await ticket.save();
  // fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make tow separate changes to the tickets we fetch
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 50 });
  // save first fetched ticket
  await firstInstance!.save();

  // save second fetched ticket

  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }
  throw new Error("Should not reach this point");
});

it("increments version number", async () => {
  // create instance of ticket
  const ticket = Ticket.build({
    title: "New",
    price: 20,
    userId: "124",
  });
  // Save the ticket to the database
  await ticket.save();
  // fetch ticket twice
  expect(ticket.version).toEqual(0);
  ticket.set({ price: 13 });
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
  await ticket.save();
  expect(ticket.version).toEqual(3);
});
