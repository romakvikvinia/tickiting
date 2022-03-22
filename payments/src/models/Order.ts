import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@ge_tickets/common";

interface OrderAttr {
  id: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build: (attr: OrderAttr) => OrderDoc;
  findByEvent: (attr: { orderId: string; version: number }) => OrderDoc;
}

const orderScheme = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderScheme.statics.build = (attr: OrderAttr) =>
  new Order({
    _id: attr.id,
    status: attr.status,
    version: attr.version,
    userId: attr.userId,
    price: attr.price,
  });
orderScheme.statics.findByEvent = (attr: {
  orderId: string;
  version: number;
}) => Order.findOne({ _id: attr.orderId, version: attr.version - 1 });

orderScheme.set("versionKey", "version");
orderScheme.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderScheme);

export { Order };
