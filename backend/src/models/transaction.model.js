const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },


    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      set: value => Number(value.toFixed(2)),
    },


    type: {
      type: String,
      enum: {
        values: ['income', 'expense', 'transfer'],
        message: '{VALUE} is not valid transaction type'
      },
      required: true,
      index: true,
    },


    category: {
      type: String,
      enum: {
        values: [
          'salary',
          'vendor',
          'operations',
          'tax',
          'other'
        ],
        message: '{VALUE} is not valid category'
      },
      required: true,
      index: true,
    },


    date: {
      type: Date,
      default: Date.now,
      index: true,
    },


    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },


    reference: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },


    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },


    isDeleted: {
      type: Boolean,
      default: false,
    }

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Query Helper

transactionSchema.query.active = function () {

  return this.where({
    isDeleted: false
  });

};

// Soft Delete

transactionSchema.methods.softDelete = async function(){

  this.isDeleted = true;
  this.deletedAt = new Date();

  return this.save();

};

// Restore

transactionSchema.methods.restore = function(){

  this.isDeleted = false;
  this.deletedAt = null;

  return this.save();

};

// Indexes

transactionSchema.index({
  title: 'text',
  description: 'text',
  reference: 'text'
});


transactionSchema.index({
  createdBy:1,
  date:-1
});


transactionSchema.index({
  type:1,
  category:1
});


// Middleware

transactionSchema.pre('save', function(next){

  if(this.type === 'expense'){
    this.amount = Math.abs(this.amount);
  }

});


const Transaction =
mongoose.model(
  'Transaction',
  transactionSchema
);


module.exports = Transaction;