import BloodDonationRequest from "../models/BloodDonationReq.js";
import User from "../models/User.js";
import mongoose from "mongoose";
export const createBloodDonationReq = async (req, res) => {
  const user = await User.findById(req.user.id).select("status");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  if (user.status === "blocked") {
    return res.status(403).json({
      success: false,
      message:
        "Your account is blocked. You cannot create a blood donation request.",
    });
  }
  try {
    const {
      recipientName,
      recipientLocation,
      hospitalName,
      fullAddress,
      bloodGroup,
      donationDate,
      donationTime,
      recipientPhone,
      additionalMessage,
      timeLapse,
    } = req.body;

    // Required field check
    if (
      !recipientName ||
      !recipientLocation ||
      !hospitalName ||
      !bloodGroup ||
      !donationDate ||
      !donationTime ||
      !recipientPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const newRequest = await BloodDonationRequest.create({
      requesterId: req.user.id,
      recipientName,
      recipientLocation,
      hospitalName,
      fullAddress,
      bloodGroup,
      donationDate,
      donationTime,
      recipientPhone,
      additionalMessage,
      timeLapse: timeLapse || 0,
    });

    res.status(201).json({
      success: true,
      message: "Blood donation request created successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Create Donation Req Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating donation request",
      error: error.message,
    });
  }
};
export const totalBloodDonationReq = async (req, res) => {
  console.log("hit prams");
  try {
    const {
      status,
      bloodGroup,
      district,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Role based
    if (req.user.role === "user") {
      query.requesterId = req.user.id;
    }

    // Status filter
    if (status && status !== "all") {
      query.donationStatus = status;
    }

    // Blood group
    if (bloodGroup && bloodGroup !== "all") {
      query.bloodGroup = bloodGroup;
    }

    // District filter
    if (district && district !== "all") {
      query.recipientLocation = { $regex: district, $options: "i" };
    }

    // Search
    if (search) {
      query.$or = [
        { recipientName: { $regex: search, $options: "i" } },
        { hospitalName: { $regex: search, $options: "i" } },
        { recipientPhone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BloodDonationRequest.countDocuments(query);

    const donations = await BloodDonationRequest.find(query)
      .populate("donorId", "name avatar email phone")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      userRole: req.user.role,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const myBloodDonationReq = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { requesterId: req.user.id };

    if (status && status !== "all") {
      query.donationStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BloodDonationRequest.countDocuments(query);

    const donations = await BloodDonationRequest.find(query)
      .populate("requesterId", "name avatar email phone")
      .populate("donorId", "name email phone bloodGroup address") // ADD THIS LINE
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("My Donation Req Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateBloodDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { donationStatus } = req.body;

    const request = await BloodDonationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check permissions
    const isOwner = request.requesterId.toString() === req.user.id;
    const canUpdate =
      isOwner || req.user.role === "volunteer" || req.user.role === "admin";

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this request",
      });
    }

    request.donationStatus = donationStatus;
    await request.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteBloodDonationReq = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BloodDonationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check permissions
    const isOwner = request.requesterId.toString() === req.user.id;
    const canDelete = isOwner || req.user.role === "admin";

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this request",
      });
    }

    await BloodDonationRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getSingleBloodDonationReq = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BloodDonationRequest.findById(id)
      .populate("requesterId", "name email avatar phone")
      .populate("donorId", "name email avatar phone");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check permissions
    const isOwner = request.requesterId._id.toString() === req.user.id;
    const canView =
      isOwner || req.user.role === "volunteer" || req.user.role === "admin";

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this request",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Single Donation Req Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateBloodDonationReq = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      recipientName,
      recipientLocation, // Specific address details
      hospitalName,
      fullAddress, // Object: { district, upazila }
      bloodGroup,
      donationDate,
      donationTime,
      recipientPhone,
      additionalMessage,
    } = req.body;

    const request = await BloodDonationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check Ownership: Ensure the logged-in user is the one who created the request
    if (request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this request",
      });
    }

    // Business Logic: Only allow editing if the request is still "pending"
    // (You usually can't change patient details if a donor is already on the way)
    if (request.donationStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot edit a request that is already in progress or completed.",
      });
    }

    // Update fields (only if provided in body, otherwise keep existing)
    if (recipientName) request.recipientName = recipientName;
    if (recipientLocation) request.recipientLocation = recipientLocation;
    if (hospitalName) request.hospitalName = hospitalName;
    if (bloodGroup) request.bloodGroup = bloodGroup;
    if (donationDate) request.donationDate = donationDate;
    if (donationTime) request.donationTime = donationTime;
    if (recipientPhone) request.recipientPhone = recipientPhone;

    // Handle optional field explicitly (allow clearing it)
    if (additionalMessage !== undefined)
      request.additionalMessage = additionalMessage;

    // Handle nested object update (fullAddress)
    if (fullAddress) {
      request.fullAddress = {
        district: fullAddress.district || request.fullAddress.district,
        upazila: fullAddress.upazila || request.fullAddress.upazila,
      };
    }

    const updatedRequest = await request.save();

    res.json({
      success: true,
      message: "Request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating request",
      error: error.message,
    });
  }
};
export const donateToRequest = async (req, res) => {
  try {
    const { id } = req.params; // The Request ID
    const donorId = req.user.id; // Logged in user ID

    // 1. Find the request
    const request = await BloodDonationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood donation request not found",
      });
    }

    // 2. Validation: Check if pending
    if (request.donationStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This request is no longer available (already in progress or cancelled).",
      });
    }

    // 3. Validation: Prevent donating to self
    if (request.requesterId.toString() === donorId) {
      return res.status(400).json({
        success: false,
        message: "You cannot donate to your own request.",
      });
    }

    // 4. Update the Request (Status & Donor ID)
    request.donationStatus = "in-progress";
    request.donorId = donorId;
    await request.save();

    // 5. Create History Object for User Model
    // Note: User Schema expects date as Date object, but Request has date as String.
    // We try to convert it, or default to Date.now()
    let historyDate = new Date(request.donationDate);
    if (isNaN(historyDate.getTime())) {
      historyDate = new Date(); // Fallback if string parsing fails
    }

    const historyEntry = {
      receiver: request.requesterId, // The person who asked for blood
      date: historyDate,
      hospital: request.hospitalName,
      note: `Committed to donate for patient: ${request.recipientName} (${request.bloodGroup})`,
    };

    // 6. Push to User's Donation History
    // await User.findByIdAndUpdate(
    //   donorId,
    //   { $push: { donationHistory: historyEntry } },
    //   { new: true }
    // );

    res.status(200).json({
      success: true,
      message:
        "Thank you! You have successfully accepted this donation request.",
      data: request,
    });
  } catch (error) {
    console.error("Donate Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing donation",
      error: error.message,
    });
  }
};
export const totalBloodDonationReqPublic = async (req, res) => {
  try {
    const {
      status,
      bloodGroup,
      district,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.donationStatus = status;
    }

    // Blood group
    if (bloodGroup && bloodGroup !== "all") {
      query.bloodGroup = bloodGroup;
    }

    // District filter
    if (district && district !== "all") {
      query.recipientLocation = { $regex: district, $options: "i" };
    }

    // Search
    if (search) {
      query.$or = [
        { recipientName: { $regex: search, $options: "i" } },
        { hospitalName: { $regex: search, $options: "i" } },
        { recipientPhone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BloodDonationRequest.countDocuments(query);

    const donations = await BloodDonationRequest.find(query)
      .populate("requesterId", "name avatar email phone")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const successDonate = async (req, res) => {
  try {
    const { id } = req.params; // The Request ID
    const donorId = req.user.id; // Logged in user ID

    // 1. Find the request
    const request = await BloodDonationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood donation request not found",
      });
    }

    // 2. Validation: Check if pending
    if (request.donationStatus !== "in-progress") {
      return res.status(400).json({
        success: false,
        message:
          "This request is no longer available (already in progress or cancelled).",
      });
    }

    // 3. Validation: Prevent donating to self
    if (request.requesterId.toString() === donorId) {
      return res.status(400).json({
        success: false,
        message: "You cannot donate to your own request.",
      });
    }

    // 4. Update the Request (Status & Donor ID)
    request.donationStatus = "success";
    request.donorId = donorId;
    await request.save();

    // 5. Create History Object for User Model
    // Note: User Schema expects date as Date object, but Request has date as String.
    // We try to convert it, or default to Date.now()
    let historyDate = new Date(request.donationDate);
    if (isNaN(historyDate.getTime())) {
      historyDate = new Date(); // Fallback if string parsing fails
    }

    const historyEntry = {
      receiver: request.requesterId, // The person who asked for blood
      date: historyDate,
      hospital: request.hospitalName,
      note: `Committed to donate for patient: ${request.recipientName} (${request.bloodGroup})`,
    };

    // 6. Push to User's Donation History
    await User.findByIdAndUpdate(
      donorId,
      { $push: { donationHistory: historyEntry } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message:
        "Thank you! You have successfully accepted this donation request.",
      data: request,
    });
  } catch (error) {
    console.error("Donate Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing donation",
      error: error.message,
    });
  }
};
export const InProgressRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;

    const requests = await BloodDonationRequest.find({
      requesterId: requesterId,
      donationStatus: "in-progress",
    })
      .populate("donorId", "name email phone bloodGroup address") // Make sure this is here
      .populate("requesterId", "name email phone avatar") // Optional: populate requester too
      .sort({ donationDate: 1, donationTime: 1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching accepted requests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// export const getMyRequestsStats = async (req, res) => {
//   try {
//     const requesterId = req.user.id;

//     const stats = await BloodDonationRequest.aggregate([
//       {
//         $match: {
//           requesterId: mongoose.Types.ObjectId(requesterId),
//         },
//       },
//       {
//         $group: {
//           _id: "$donationStatus",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const statsObject = {
//       total: 0,
//       pending: 0,
//       "in-progress": 0,
//       done: 0,
//       cancelled: 0,
//     };

//     stats.forEach((stat) => {
//       statsObject[stat._id] = stat.count;
//       statsObject.total += stat.count;
//     });

//     res.status(200).json({
//       success: true,
//       data: statsObject,
//     });
//   } catch (error) {
//     console.error("Error fetching stats:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// };
export const markRequestAsComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    const request = await BloodDonationRequest.findOne({
      _id: id,
      requesterId: requesterId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found",
      });
    }

    if (request.donationStatus !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress donations can be marked as complete",
      });
    }

    request.donationStatus = "success";
    await request.save();

    // Add to donor's history
    if (request.donorId) {
      let historyDate = new Date(request.donationDate);
      if (isNaN(historyDate.getTime())) {
        historyDate = new Date();
      }

      const historyEntry = {
        receiver: request.requesterId,
        date: historyDate,
        hospital: request.hospitalName,
        note: `Donated blood for ${request.recipientName} (${request.bloodGroup})`,
      };

      await User.findByIdAndUpdate(
        request.donorId,
        { $push: { donationHistory: historyEntry } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Donation marked as complete",
      data: request,
    });
  } catch (error) {
    console.error("Error marking as complete:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
export const cancelMyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    const request = await BloodDonationRequest.findOne({
      _id: id,
      requesterId: requesterId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Donation request not found",
      });
    }

    if (request.donationStatus === "success") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed donations",
      });
    }

    request.donationStatus = "cancelled";
    request.donorId = null; // Remove donor assignment
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getMyRequestsStats = async (req, res) => {
  try {
    const requesterId = req.user.id;

    const stats = await BloodDonationRequest.aggregate([
      {
        $match: {
          requesterId: new mongoose.Types.ObjectId(requesterId), // Use 'new' keyword
        },
      },
      {
        $group: {
          _id: "$donationStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsObject = {
      total: 0,
      pending: 0,
      "in-progress": 0,
      success: 0,
      cancelled: 0,
    };

    stats.forEach((stat) => {
      if (stat._id) {
        statsObject[stat._id] = stat.count;
        statsObject.total += stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: statsObject,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
