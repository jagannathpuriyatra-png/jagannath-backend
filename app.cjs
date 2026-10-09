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
  createdAt: { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', RegistrationSchema);

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

app.get('/api/registrations', async (req, res) => {
  try {
    const regs = await Registration.find().sort({ createdAt: -1 });
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: "Database Error" });
  }
});

app.delete('/api/registrations/:id', async (req, res) => {
  try {
    const deletedReg = await Registration.findByIdAndDelete(req.params.id);
    if (!deletedReg) return res.status(404).json({ message: "Registration nahi mili" });
    res.json({ message: "Registration successfully deleted!" });
  } catch (error) {
    res.status(500).json({ error: "Delete nahi ho saka" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Server running on port ${PORT}`));