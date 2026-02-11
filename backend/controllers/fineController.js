// ────────────────────────────────────────────────
// backend/controllers/fineController.js   (optional)
// ────────────────────────────────────────────────

const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');
const { calculateFine } = require('../utils/calculateFine');

const calculateAndCreateFines = async (req, res) => {
    try {
        const today = new Date();
        const overdueBorrows = await Borrow.find({
            status: 'borrowed',
            dueDate: { $lt: today },
        });

        const fines = [];

        for (const borrow of overdueBorrows) {
            const existingFine = await Fine.findOne({ borrow: borrow._id });
            if (existingFine) continue;

            const fineAmount = calculateFine(borrow.dueDate, today);

            const fine = await Fine.create({
                borrow: borrow._id,
                user: borrow.user,
                amount: fineAmount,
                dueDate: new Date(today.setDate(today.getDate() + 7)), // 7 days to pay
            });

            fines.push(fine);
        }

        res.json({ message: `${fines.length} new fines created`, fines });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserFines = async (req, res) => {
    try {
        const fines = await Fine.find({ user: req.user._id })
            .populate('borrow', 'book dueDate returnDate')
            .populate('borrow.book', 'title author isbn');

        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { calculateAndCreateFines, getUserFines };