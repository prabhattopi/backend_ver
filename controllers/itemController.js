const Item = require("../models/Item");
const { sendEmail } = require("../utils");

// Create new item
const createItem = async (req, res) => {
  try{
    const {
      name,
      unit_price,
      total_price,
      shipping,
      tax,
      approval_email,
      quantity
    } = req.body;
  
    const item = await Item.create({
      name,
      unit_price,
      total_price,
      shipping,
      tax,
      quantity,
      approval_email,
      created_email:req.user.email,
      createdBy: req.user._id, // Attach the item to the logged-in user
    });
    sendEmail(req.user.email,`Your Item has been created and of orderId:${item._id} and waiting for the approval`)
    sendEmail(approval_email,`New Item has been created of orderId:${item._id} and waiting for your approval`)
  
    return res.status(201).json({message:"Item Created Successfully",item:item});
  }
  catch(err){
    console.log(err)
    return res.status(500).json({message:"Something went wrong"});

  }
  
};

// Get all items (can be restricted based on role)
const getItems = async (req, res) => {
  try {
    let items = await Item.find({
      $or: [
        { approval_email: req.user.email },
        { created_email: req.user.email },
      ],
    });
    return res.status(200).json({item:items});
  } catch (err) {
    return res.status(404).json(err);
  }
};

// Update the is_approved status of an item
const updateItem = async (req, res) => {
  try {
    const { isApproved } = req.body; // Expecting a boolean value

    // Find the item by ID
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if the logged-in user's email matches the approval_email
    if (item.approval_email !== req.user.email) {
      return res.status(403).json({ message: "Not authorized to update this item's approval status" });
    }

    // Update the is_approved field based on the isApproved payload
    item.is_approved = isApproved ? "Succeed" : "Rejected";

    // Save the updated item
    const updatedItem = await item.save();
    sendEmail(item.created_email,`Your Item of orderId:${item._id} approval has been ${isApproved ? "Succeed" : "Rejected"}`)
    sendEmail(item.approval_email,`You have been approved ${isApproved ? "Succeed" : "Rejected"}  of orderId:${item._id}`)
    return res.status(200).json({ message: "Approval status updated", item: updatedItem });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};


// Delete item (users can only delete their own items, admins can delete any)
const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Check if the logged-in user is either the creator or an admin
  if (
    item.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this item" });
  }

  await Item.findOneAndDelete(req.params.id);
  res.json({ message: "Item removed" });
};

module.exports = { createItem, getItems, updateItem, deleteItem };
