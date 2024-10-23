const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  img: { type: String },
  unit_price: { type: Number },
  total_price: { type: Number },
  shipping: { type: Number },
  tax: { type: Number },
  quantity: { type: Number, required: true },
  is_approved: { type: String,default: "Pending" },
  approval_email:{ type: String, required: true},
  created_email:{ type: String, required: true},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Relation to User
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
