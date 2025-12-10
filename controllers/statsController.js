import User from "../models/User.js";
import Fund from "../models/Fund.js";
import BloodDonationRequest from "../models/BloodDonationReq.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Execute all 3 database operations in parallel for best performance
    const [totalUsers, totalRequests, fundAggregation] = await Promise.all([
      // 1. Count Total Users
      User.countDocuments(),

      // 2. Count Total Blood Donation Requests
      BloodDonationRequest.countDocuments(),

      // 3. Sum Total Funds collected
      Fund.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amountTotal" }, // Summing the 'amountTotal' field
          },
        },
      ]),
    ]);

    // Handle Fund Aggregation Result (it returns an array)
    // If no funds exist, default to 0
    const totalFundCollected =
      fundAggregation.length > 0 ? fundAggregation[0].totalAmount : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRequests,
        totalFund: totalFundCollected,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
