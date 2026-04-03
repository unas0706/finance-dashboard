const mongoose = require('mongoose');

const RECORD_TYPES = ['income', 'expense'];

const CATEGORIES = [
  'salary', 'freelance', 'investment', 'gift', 'other_income',
  'food', 'transport', 'utilities', 'rent', 'healthcare',
  'entertainment', 'shopping', 'education', 'other_expense',
];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: RECORD_TYPES,
      required: [true, 'Type is required (income or expense)'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // soft delete — hidden by default
    },
  },
  {
    timestamps: true,
  }
);

// Exclude soft-deleted records by default
financialRecordSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
module.exports.RECORD_TYPES = RECORD_TYPES;
module.exports.CATEGORIES = CATEGORIES;
