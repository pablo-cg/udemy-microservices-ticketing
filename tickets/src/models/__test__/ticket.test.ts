import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  const newTicket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  await newTicket.save();

  const firstInstance = await Ticket.findById(newTicket.id);
  const secondInstance = await Ticket.findById(newTicket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const newTicket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  await newTicket.save();

  expect(newTicket.version).toEqual(0);

  await newTicket.save();

  expect(newTicket.version).toEqual(1);
});
