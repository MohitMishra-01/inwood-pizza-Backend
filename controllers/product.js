const Product = require("../models/Product")

const createFood = async (req, res) => {
    try {
        const {title, desc, img, catagory, prices, extraOptions} = req.body;
        const newFood = new Product({
            title,
            desc,
            img,
            catagory,
            prices,
            extraOptions,
        });
         const saveFood = newFood.save();
         res.status(200).json({
            message: "Food Successfully Add",
            successz: true,
            data:{
                food: saveFood,
            }
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal Server Error",
            success: false,
        });
    }
};

const getAllFoods = async (req, res) => {
    try {
        const foodItems = await Product.find();

         res.status(200).json({
            message: "Food Successfully Add",
            successz: true,
            data:{
                food: foodItems,
            }
         })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal Server Error",
            success: false,
        });
    }
};

module.exports = {createFood, getAllFoods}