const empWork = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  paid: { type: Number, default: 0 },
  season: { type: String },
  products: [
    {
      dress: { type: String, required: true, trim: true },
      group: { type: Number, required: true },
      qnt: { type: Number, required: true },
    },
  ],
});
global.EmpWork =
  mongoose.models["EmpWork"] || mongoose.model("EmpWork", empWork);

const season = new Schema({
  season: { type: String, required: true, unique: true },
  running: { type: Boolean },
});
global.Season = mongoose.models["Season"] || mongoose.model("Season", season);

const lot = new Schema({
  date: { type: Date, required: true },
  no: { type: Number },
  season: { type: String },
  products: [
    {
      dress: { type: String, required: true, trim: true },
      group: { type: Number, required: true },
      qnt: { type: Number, required: true },
    },
  ],
});
global.Lot = mongoose.models["Lot"] || mongoose.model("Lot", lot);

const group = new Schema({
  label: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});
global.Group = mongoose.models["Group"] || mongoose.model("Group", group);

const bill = new Schema({
  date: { type: Date, required: true },
  ref: { type: Number, required: true, unique: true },
  img: { type: String },
  products: [
    {
      dress: { type: String, required: true, trim: true },
      qnt: { type: Number, required: true },
      cost: { type: Number, required: true },
      wage: { type: Number, required: true },
    },
  ],
});
global.Bill = mongoose.models["Bill"] || mongoose.model("Bill", bill);

const payment = new Schema({
  date: { type: Date, required: true },
});

const Payment =
  mongoose.models["Payment"] || mongoose.model("Payment", payment);
const WagePayment =
  mongoose.models["WagePayment"] ||
  Payment.discriminator(
    "WagePayment",
    new Schema({ amount: { type: Number, required: true } })
  );

const MaterialPayment =
  mongoose.models["MaterialPayment"] ||
  Payment.discriminator(
    "MaterialPayment",
    new Schema({
      payments: [
        {
          remark: { type: String, required: true },
          amount: { type: Number, required: true },
        },
      ],
    })
  );

const costing = new Schema({
  lot: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  dress: { type: String, required: true, trim: true },
  lotSize: { type: Number, required: true },
  img: { type: String },
  materials: [
    {
      material: { type: String, required: true },
      qnt: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  note: { type: String },
});

const fabric = new Schema({
  dealer: { type: String, required: true },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  qnt: {
    unit: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  price: { type: Number, required: true },
  img: "",
  usage: [
    {
      lot: { type: Number, required: true },
      qnt: {
        unit: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    },
  ],
});
global.Fabric = mongoose.models["Fabric"] || mongoose.model("Fabric", fabric);

global.Payment = Payment;
global.WagePayment = WagePayment;
global.MaterialPayment = MaterialPayment;
global.Costing =
  mongoose.models["Costing"] || mongoose.model("Costing", costing);
