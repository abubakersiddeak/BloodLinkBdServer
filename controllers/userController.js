import User from "../models/User.js";

export const users = async (req, res) => {
  try {
    const {
      status,
      role,
      search,
      searchField,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by role
    if (role && role !== "all") {
      query.role = role;
    }

    // Search functionality
    if (search) {
      if (searchField === "all") {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { bloodGroup: { $regex: search, $options: "i" } },
        ];
      } else {
        query[searchField] = { $regex: search, $options: "i" };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password") // Exclude password
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const user = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const userUbdate = async (req, res) => {
  try {
    const { role } = req.body; // 'donor', 'volunteer', 'admin'

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; //ubdate user role
export const userDelete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, district, upazila, page = 1, limit = 50 } = req.query;

    let query = {
      status: "active",
    };

    // Blood group filter
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    // District filter (Mongoose nested query)
    if (district) {
      query["location.district"] = {
        $regex: district,
        $options: "i",
      };
    }

    // Upazila filter
    if (upazila) {
      query["location.upazila"] = {
        $regex: upazila,
        $options: "i",
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const donors = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      searchCriteria: {
        bloodGroup: bloodGroup || null,
        district: district || null,
        upazila: upazila || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
