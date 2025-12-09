import BloodDonationRequest from "../models/BloodDonationReq.js";
export const createBloodDonationReq = async (req, res) => {
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
      userRole: req.user.role,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const myBloodDonationReq = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { requesterId: req.user._id };
    if (status && status !== "all") {
      query.status = status;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BloodDonationRequest.countDocuments(query);
    const donations = await BloodDonationRequest.find(query)
      .populate("requesterId", "name avatar email phone")
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
    const canDelete =
      (isOwner && request.donationStatus === "pending") ||
      req.user.role === "admin";

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

    const request = await BloodDonationRequest.findById(id).populate(
      "requesterId",
      "name email avatar phone"
    );

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
