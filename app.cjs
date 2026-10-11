const dns = require('dns');
// Windows DNS issue fix: Isse Node.js IPv6 ki jagah IPv4 use karega
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// DEBUG CHECK: Ye batayega ki .env file load hui ya nahi
console.log("ENV CHECK:", process.env.MONGO_URI);

// Database Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("DB Error Details: ", err.message)); 

// --- SCHEMA (Payment Status add kiya gaya hai) ---
const RegistrationSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  whatsapp: String,
  aadhaar: String,
  city: String,
  station: String,
  roomType: String,
  coachType: String,
  emergencyName: String,
  emergencyRelation: String,
  emergencyPhone: String,
  count: Number,
  coTravellers: Array,
  paymentStatus: { type: String, default: "Pending" }, // Naya field yahan add hua
  createdAt: { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', RegistrationSchema);

// 1. Data Save Karne ke liye (Frontend form se data yahan aayega)
app.post('/api/registrations', async (req, res) => {
  try {
    const newReg = new Registration(req.body);
    const savedReg = await newReg.save();
    res.status(201).json({ message: "Registration Saved!", id: savedReg._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database Error" });
  }
});

// 2. Admin Panel ke liye saara data lene ke liye
app.get('/api/registrations', async (req, res) => {
  try {
    const regs = await Registration.find().sort({ createdAt: -1 }); // Naya data sabse upar
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: "Database Error" });
  }
});

// 3. Payment Update karne ke liye (Admin se verify karne ke liye) - NAYA ROUTE
app.put('/api/registrations/:id', async (req, res) => {
  try {
    const updatedReg = await Registration.findByIdAndUpdate(
      req.params.id, 
      { $set: { paymentStatus: req.body.paymentStatus } }, // Sirf payment status update hoga
      { new: true }
    );
    if (!updatedReg) return res.status(404).json({ message: "Registration nahi mili" });
    res.json(updatedReg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment update nahi ho saka" });
  }
});

// 4. Admin Panel se kisi data ko delete karne ke liye
app.delete('/api/registrations/:id', async (req, res) => {
  try {
    const deletedReg = await Registration.findByIdAndDelete(req.params.id);
    if (!deletedReg) return res.status(404).json({ message: "Registration nahi mili" });
    res.json({ message: "Registration successfully deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete nahi ho saka" });
  }
});

// Server Start
const PORT = process.env.PORT || 5000;
// 5. Single User data lene ke liye (Pass ke liye)
app.get('/api/registrations/mobile/:mobile', async (req, res) => {
  try {
    const user = await Registration.findOne({ mobile: req.params.mobile });
    if (!user) return res.status(404).json({ message: "User nahi mila" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Database Error" });
  }
});
app.listen(PORT, () => console.log(`Backend Server running on port ${PORT}`));
