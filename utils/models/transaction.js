const transaction = new Schema(
  {
    date: { type: Date, default: Date.now() },
    wallet: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"] },
    amount: { type: Number, required: true },
    note: { type: String, required: true },
  },
  { timestamps: true }
);
global.Transaction =
  mongoose.models["Transaction"] || mongoose.model("Transaction", transaction);
