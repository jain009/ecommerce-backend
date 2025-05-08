import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// @desc Create new Order
// @route POST /api/orders  (Corrected route)
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  // Validate orderItems:  Check if it is array and is not empty
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400).json({ message: "No order items provided" }); // Send JSON response
    return; // IMPORTANT: Exit the handler
  }

  try {
    const productIds = orderItems.map((item) => item.product);

    // Check for valid product IDs
    if (productIds.some((id) => !id)) {
      res.status(400).json({ message: "Some product IDs are invalid" });
      return;
    }

    // Fetch products in a single query
    const products = await Product.find({ _id: { $in: productIds } });

    // Create a map for efficient product lookup
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    // Validate order items and prepare validatedItems array
    const validatedItems = orderItems.map((item) => {
      const productId = item.product;
      const product = productMap.get(productId);

      if (!product) {
        res.status(404).json({ message: `Product not found: ${productId}` });
        return; 
        //throw new Error(`Product not found: ${productId}`); // Removed:  Throwing error inside map is not good.
      }

      return {
        product: productId,
        name: product.name,
        qty: item.qty,
        image: product.image,
        price: product.price,
      };
    }).filter(item => item !== undefined); // Filter out the undefined ones.

    if (validatedItems.length !== orderItems.length) {
      return; // IMPORTANT:  Exit, because some products were not found.  Errors were sent.
    }
    // Create the order
    const order = new Order({
      orderItems: validatedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order processing error:", error);
    res.status(500).json({ message: "Server error while processing order", error: error.message }); // Send JSON response
  }
});

// @desc Get logged in user orders
// @route GET /api/orders/myorders (Corrected route)
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  try{
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json(orders);
  } catch(error){
    res.status(500).json({message: "Server error", error: error.message});
  }
});

// @desc Get order by ID
// @route GET /api/orders/:id (Corrected route)
// @access Private
const getMyOrdersById = asyncHandler(async (req, res) => {
  try{
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      res.status(404).json({ message: "Order not found" }); // Send JSON
      return;
    }
    res.status(200).json(order);
  } catch(error){
    res.status(500).json({message: "Server error", error: error.message});
  }
});

// @desc Update order to paid
// @route PUT /api/orders/:id/pay (Corrected route and method)
// @access Private
const updateOrderToPay = asyncHandler(async (req, res) => {
  try{
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch(error){
    res.status(500).json({message: "Server error", error: error.message});
  }
});

// @desc Update order to delivered
// @route PUT /api/orders/:id/deliver (Corrected route and method)
// @access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try{
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    order.isDelivered = true;
    order.deliveredAt = new Date();
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder); // Corrected status code
  } catch(error){
    res.status(500).json({message: "Server Error", error: error.message});
  }
});

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin  (Corrected access)
const getOrders = asyncHandler(async (req, res) => {
  try{
    const orders = await Order.find({}).populate("user", "name email");
    res.status(200).json(orders);
  } catch(error){
    res.status(500).json({message: "Server Error", error: error.message});
  }
});

export { addOrderItems, getMyOrders, getMyOrdersById, updateOrderToPay, updateOrderToDelivered, getOrders };
