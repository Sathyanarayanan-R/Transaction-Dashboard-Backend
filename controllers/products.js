import Product from "../models/productModel.js";
import axios from "axios";

const monthNames = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export const getProductsBySearchAndPagination = async (req, res) => {
  try {
    const { searchQuery, page } = req.query;
    const month =
      req.params.month !== "All"
        ? monthNames.indexOf(req.params.month) + 1
        : req.params.month;

    const LIMIT = 10;
    const startIndex = (Number(page) - 1) * LIMIT;

    let products, total;

    let title, description, price;

    if (searchQuery) {
      title = new RegExp(searchQuery, "i");
      description = new RegExp(searchQuery, "i");

      if (!isNaN(searchQuery)) {
        price = Number(searchQuery);
      }
    }

    if (month !== "All") {
      const monthlyProducts = await Product.aggregate([
        {
          $project: {
            datewithIST: {
              $dateToString: {
                date: "$dateOfSale",
                timezone: "+0530",
                format: "%Y-%m-%dT%H:%M:%S.%LZ",
              },
            },
            datewithUTC: { date: "$dateOfSale" },
            id: 1,
            sold: 1,
            price: 1,
            title: 1,
            description: 1,
            image: 1,
            category: 1,
          },
        },
        {
          $project: {
            month: { $substr: ["$datewithIST", 5, 2] },
            id: 1,
            sold: 1,
            price: 1,
            title: 1,
            description: 1,
            image: 1,
            category: 1,
          },
        },
        { $match: { month: month < 10 ? "0" + month : month.toString() } },
      ]);

      if (searchQuery) {

        let monthlySearchProducts = [];

        monthlyProducts.forEach((product) => {
          if (
            product.title.search(title) !== -1 ||
            product.description.search(description) !== -1 ||
            product.price.toString().search(price + "") !== -1
          ) {
            monthlySearchProducts.push(product);
          }
        });

        total = monthlySearchProducts.length;
        products = monthlySearchProducts.slice(startIndex, startIndex + LIMIT);
      } else {
        total = monthlyProducts.length;
        products = monthlyProducts.slice(startIndex, startIndex + LIMIT);
      }
    } else {
      if (searchQuery) {
        let searchProducts = [];

        const allProducts = await Product.find({});

        allProducts.forEach((product) => {
          if (
            product.title.search(title) !== -1 ||
            product.description.search(description) !== -1 ||
            product.price.toString().search(price + "") !== -1
          ) {
            searchProducts.push(product);
          }
        });

        total = searchProducts.length;
        products = searchProducts.slice(startIndex, startIndex + LIMIT);
      } else {
        total = await Product.countDocuments({});
        products = await Product.find().limit(LIMIT).skip(startIndex);
      }
    }

    res.status(200).json({
      data: products,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getMonthlySalesStatistics = async (req, res) => {
  try {
    const month = monthNames.indexOf(req.params.month) + 1;

    const products = await Product.aggregate([
      {
        $project: {
          datewithIST: {
            $dateToString: {
              date: "$dateOfSale",
              timezone: "+0530",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
            },
          },
          datewithUTC: { date: "$dateOfSale" },
          sold: 1,
          price: 1,
        },
      },
      {
        $project: {
          month: { $substr: ["$datewithIST", 5, 2] },
          sold: 1,
          price: 1,
        },
      },
      { $match: { month: month < 10 ? "0" + month : month.toString() } },
      {
        $group: {
          _id: "$sold",
          totalAmount: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalSaleAmount = 0,
      totalSoldItemsCount = 0,
      totalUnsoldItemsCount = 0;

    products.forEach((items) => {
      if (items._id === true) {
        totalSaleAmount = items.totalAmount;
        totalSoldItemsCount = items.count;
      } else if (items._id === false) totalUnsoldItemsCount = items.count;
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount,
      totalSoldItemsCount: totalSoldItemsCount,
      totalUnsoldItemsCount: totalUnsoldItemsCount,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getMonthlyPriceRange = async (req, res) => {
  try {
    const month = monthNames.indexOf(req.params.month) + 1;

    const products = await Product.aggregate([
      {
        $project: {
          datewithIST: {
            $dateToString: {
              date: "$dateOfSale",
              timezone: "+0530",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
            },
          },
          datewithUTC: { date: "$dateOfSale" },
          price: 1,
        },
      },
      {
        $project: {
          month: { $substr: ["$datewithIST", 5, 2] },
          price: 1,
        },
      },
      { $match: { month: month < 10 ? "0" + month : month.toString() } },
      {
        $set: {
          group: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [{ $gte: ["$price", 0] }, { $lte: ["$price", 100] }],
                  },
                  then: 100,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 101] },
                      { $lte: ["$price", 200] },
                    ],
                  },
                  then: 200,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 201] },
                      { $lte: ["$price", 300] },
                    ],
                  },
                  then: 300,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 301] },
                      { $lte: ["$price", 400] },
                    ],
                  },
                  then: 400,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 401] },
                      { $lte: ["$price", 500] },
                    ],
                  },
                  then: 500,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 501] },
                      { $lte: ["$price", 600] },
                    ],
                  },
                  then: 600,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 601] },
                      { $lte: ["$price", 700] },
                    ],
                  },
                  then: 700,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 701] },
                      { $lte: ["$price", 800] },
                    ],
                  },
                  then: 800,
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$price", 801] },
                      { $lte: ["$price", 900] },
                    ],
                  },
                  then: 900,
                },
                {
                  case: {
                    $gte: ["$price", 901],
                  },
                  then: 901,
                },
              ],
              default: "Did not match",
            },
          },
        },
      },
      { $group: { _id: "$group", totalNoOfItems: { $sum: 1 } } },
    ]);

    const monthlyPriceRanges = products.map((item) => {
      if (item._id <= 100) {
        return { priceRange: "0 - 100", ...item };
      } else if (item._id >= 901) return { priceRange: "901 - above", ...item };
      else return { priceRange: `${item._id - 99} - ${item._id}`, ...item };
    });

    res.status(200).json({ monthlyPriceRanges });
  } catch (err) {
    console.log(err);
  }
};

export const getMonthlyCategories = async (req, res) => {
  try {
    const month = monthNames.indexOf(req.params.month) + 1;

    const categories = await Product.aggregate([
      {
        $project: {
          datewithIST: {
            $dateToString: {
              date: "$dateOfSale",
              timezone: "+0530",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
            },
          },
          datewithUTC: { date: "$dateOfSale" },
          category: 1,
        },
      },
      {
        $project: {
          month: { $substr: ["$datewithIST", 5, 2] },
          category: 1,
        },
      },
      { $match: { month: month < 10 ? "0" + month : month.toString() } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ categories });
  } catch (err) {
    console.log(err);
  }
};

export const getAllAPIData = async (req, res) => {
  try {
    const month = req.params.month;

    const BASE_URL = "http://localhost:5000/products/";
    const urlPath = [
      "monthlysale/",
      "monthlypricerange/",
      "monthlycategories/",
    ];

    const { data: salesData } = await axios.get(BASE_URL + urlPath[0] + month);
    const { data: priceRangeData } = await axios.get(
      BASE_URL + urlPath[1] + month
    );
    const { data: productCategoriesData } = await axios.get(
      BASE_URL + urlPath[2] + month
    );

    const All3APIData = [
      { month: month },
      salesData,
      priceRangeData,
      productCategoriesData,
    ];

    res.status(200).json({ All3APIData: All3APIData });
  } catch (err) {
    console.log(err);
  }
};
