import mongoose from "mongoose";

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  //   version: number;
}
interface PaymentModel extends mongoose.Model<PaymentModel> {
  build: (attr: PaymentAttrs) => PaymentDoc;
}

const paymentScheme = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
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

paymentScheme.statics.build = (attrs: PaymentAttrs) =>
  new Payment({
    orderId: attrs.orderId,
    stripeId: attrs.stripeId,
  });

export const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentScheme
);
