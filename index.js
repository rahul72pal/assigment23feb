const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { generateLoanSchedule, getLoanScheduleById, getAllLoans, updatePayment } = require("./controller/Loanschedule");

const app = express();
app.use(cors({
    origin: "https://assigment23febclient-git-main-99attendance.vercel.app",
    credentials: true,
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));


// POST API: Generate Loan Repayment Schedule
app.post("/api/generate-loan-schedule", generateLoanSchedule);

// GET API: Retrieve Loan Schedule
app.get("/api/loan-schedules/:id", getLoanScheduleById);

//GET API: Get All Loans
app.get("/api/loans", getAllLoans);


app.post("/api/submit-installment", updatePayment);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
