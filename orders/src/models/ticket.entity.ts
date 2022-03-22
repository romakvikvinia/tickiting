import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order.entity";

interface TicketAttr {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved: () => Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build: (attrs: TicketAttr) => TicketDoc;
  findByEvent: (event: {
    id: string;
    version: number;
  }) => Promise<TicketDoc | null>;
}

const ticketScheme = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ref) => {
        ref.id = ref._id;
        delete ref._id;
      },
    },
  }
);

ticketScheme.statics.build = (attrs: TicketAttr) =>
  new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
ticketScheme.statics.findByEvent = (event: { id: string; version: number }) =>
  Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });

ticketScheme.set("versionKey", "version");
ticketScheme.plugin(updateIfCurrentPlugin);

// ticketScheme.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//   done();
// });

ticketScheme.methods.isReserved = async function () {
  // this === Ticket Document
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $nin: [OrderStatus.Cancelled],
    },
  });
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketScheme);

export { Ticket };
