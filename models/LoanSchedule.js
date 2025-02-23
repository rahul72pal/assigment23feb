const mongoose = require("mongoose");

const LoanScheduleSchema = new mongoose.Schema({
    principal: { type: Number, required: true },
    rate: { type: Number, required: true }, // Annual interest rate
    tenure: { type: Number, required: true }, // Years
    frequency: { type: Number, required: true }, // Payments per year (12 = Monthly)
    startDate: { type: Date, required: true }, // Loan start date
    schedule: [
        {
            installment: Number,
            emi: Number,
            interestPaid: Number,
            principalPaid: Number,
            remainingBalance: Number,
            dueDate: Date,
            status: {
                type: String,
                enum: ["due", "paid"],
                default: "due",
            },
        },
    ],
    status: {
        type: String,
        enum: ["Completed", "Pending"], // Enum with two possible values
        default: "Pending", // Default status is "Pending"
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoanSchedule", LoanScheduleSchema);
