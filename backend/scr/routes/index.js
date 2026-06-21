const router = require("express").Router();
const ApiResponse = require("../utils/ApiResponse");

// API Information
router.get("/", (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Amdox ERP API v1", {
      version: "1.0.0",
      environment: process.env.NODE_ENV,
      endpoints: {
        auth: "/api/v1/auth",
        users: "/api/v1/users",
        hr: "/api/v1/hr",
        finance: "/api/v1/finance",
        supplychain: "/api/v1/supplychain",
        projects: "/api/v1/projects",
        dashboard: "/api/v1/dashboard",
        notifications: "/api/v1/notifications",
        settings: "/api/v1/settings",
      },
    })
  );
});

// Module Routes
router.use("/auth", require("../modules/auth/auth.routes"));

module.exports = router;