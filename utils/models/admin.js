const admin = new Schema({
  id: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
});

global.Admin = mongoose.models["Admin"] || mongoose.model("Admin", admin);
