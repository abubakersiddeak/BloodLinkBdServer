import Fund from "../models/Fund.js";

export const allFund = async (req, res) => {
  try {
    const [totalAgg, allDonations] = await Promise.all([
      Fund.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amountTotal" },
          },
        },
      ]),

      Fund.find().sort({ createdAt: -1 }),
    ]);

    const totalFundCollected =
      totalAgg.length > 0 ? totalAgg[0].totalAmount : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalFund: totalFundCollected,
        donations: allDonations,
      },
    });
  } catch (error) {
    console.error("Error in allFund:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const userFund = async (req, res) => {
  const { email } = req.user;
  try {
    const data = await Fund.find({ funderEmail: email });
    if (!data) {
      console.log("No fund found for this email");
      return null;
    }
    console.log("Fund found:", data);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
