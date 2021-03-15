const employee = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  pass: { type: String, required: true },
  work: [
    {
      work: { type: Schema.Types.ObjectId, ref: "EmpWork", required: true },
    },
  ],
});

employee.statics.updateWork = (_id) => {
  // if (!ObjectID.isValid(_id)) return;
  return EmpWork.find({ employee: _id }, "_id")
    .then((works) => {
      const newWorks = works.map((item) => {
        return { work: item._id };
      });
      Employee.findByIdAndUpdate(_id, { work: newWorks }).catch((err) => {
        console.log("could not upadte", err);
      });
    })
    .catch((err) => {
      console.log("err while upating work", err);
    });
};

global.Employee =
  mongoose.models["Employee"] || mongoose.model("Employee", employee);

const worker = new Schema({
  name: { type: String, required: true, trim: true },
  join: { type: Date, required: true },
  salary: { type: Number },
  abs: [{ date: { type: Date, required: true } }],
  paid: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
    },
  ],
});

global.Worker = mongoose.models["Worker"] || mongoose.model("Worker", worker);
