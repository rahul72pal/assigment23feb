const LoanSchedule = require("../models/LoanSchedule");

// Function to calculate EMI
const calculateEMI = (principal, rate, tenure, frequency) => {
    const monthlyRate = rate / (12 * 100); // Convert annual rate to monthly
    const numPayments = tenure * frequency; // Total number of payments

    if (monthlyRate === 0) {
        return principal / numPayments; // If 0% interest, divide principal equally
    }

    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
};

// Function to generate repayment schedule
const generateSchedule = (principal, rate, tenure, frequency, startDate) => {
    const schedule = [];
    let remainingBalance = principal;
    const emi = calculateEMI(principal, rate, tenure, frequency);
    let currentDate = new Date(startDate);

    for (let i = 1; i <= tenure * frequency; i++) {
        const interestPaid = remainingBalance * (rate / (12 * 100)); // Monthly interest
        const principalPaid = emi - interestPaid;
        remainingBalance -= principalPaid;
    
        // Ensure dueDate increases correctly
        const dueDate = new Date(currentDate);
        dueDate.setMonth(dueDate.getMonth() + 1); // Move to the next month
    
        schedule.push({
            installment: i,
            emi: parseFloat(emi.toFixed(2)),
            interestPaid: parseFloat(interestPaid.toFixed(2)),
            principalPaid: parseFloat(principalPaid.toFixed(2)),
            remainingBalance: parseFloat(remainingBalance.toFixed(2)),
            dueDate: dueDate.toISOString(),
        });
    
        currentDate = new Date(dueDate); // Move currentDate to next dueDate
    }    

    return schedule;
};

// Controller to handle loan schedule generation
const generateLoanSchedule = async (req, res) => {
    const { principal, rate, tenure, frequency, startDate } = req.body;

    if (!principal || !rate || !tenure || !frequency || !startDate) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const schedule = generateSchedule(principal, rate, tenure, frequency, startDate);

    try {
        const loan = new LoanSchedule({
            principal,
            rate,
            tenure,
            frequency,
            startDate,
            schedule,
        });
        await loan.save();

        res.json({ scheduleId: loan._id, schedule: loan.schedule });
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error.message });
    }
};

// Get Loan Schedule by ID
const getLoanScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const loanSchedule = await LoanSchedule.findById(id);

        if (!loanSchedule) {
            return res.status(404).json({ error: "Loan schedule not found" });
        }

        res.json(loanSchedule);
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error.message });
    }
};

const getAllLoans = async (req, res) => {
    try {
        const loans = await LoanSchedule.find(); // Fetch all loans
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}

const updatePayment = async (req, res) => {
    const { loanScheduleId, installmentNumber } = req.body;

    try {
        const schedule = await LoanSchedule.findOne({ _id: loanScheduleId });
        if (!schedule) return res.status(404).json({ message: "Loan schedule not found" });

        const installmentIndex = schedule.schedule.findIndex((s) => s.installment === installmentNumber);
        if (installmentIndex === -1) return res.status(404).json({ message: "Installment not found" });

        schedule.schedule[installmentIndex].status = "paid";
        await schedule.save();

        res.status(200).json({ message: "Installment marked as paid" });
    } catch (error) {
        res.status(500).json({ message: "Error updating installment status" });
    }
};


module.exports = { generateLoanSchedule, getLoanScheduleById, getAllLoans, updatePayment };
