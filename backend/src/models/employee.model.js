const mongoose = require('mongoose');


const employeeSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },


    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Invalid email',
      ],
    },


    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [
        /^[0-9]{10,15}$/,
        'Invalid phone number',
      ],
    },


    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },


    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },


    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: 0,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: 'Salary must be integer',
      },
    },


    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      validate: {
        validator(date) {
          return date <= new Date();
        },
        message: 'Joining date cannot be future date',
      },
    },


    role: {
      type: String,
      enum: {
        values: [
          'admin',
          'manager',
          'employee'
        ],
        message: 'Invalid role',
      },
      default: 'employee',
    },


    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },


    deletedAt: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);



// Auto lowercase email before save
employeeSchema.pre('save', function(next){

  if(this.isModified('email')){
    this.email = this.email.toLowerCase();
  }

  
});




// Active employees only
employeeSchema.query.active = function(){

  return this.where({
    isActive:true,
    deletedAt:null
  });

};




// Soft delete method
employeeSchema.methods.softDelete = function(){

  this.isActive = false;
  this.deletedAt = new Date();

  return this.save();

};



// Restore employee
employeeSchema.methods.restore = function(){

  this.isActive = true;
  this.deletedAt = null;

  return this.save();

};



// Search index
employeeSchema.index({
  name:'text',
  email:'text',
  department:'text',
  designation:'text'
});



const Employee = mongoose.model(
  'Employee',
  employeeSchema
);


module.exports = Employee;