const express = require("express");
const { checkEntitlement, listMyEntitlements } = require("../controllers/entitlement.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/entitlements/check", requireAuth, checkEntitlement);
router.get("/entitlements/me", requireAuth, listMyEntitlements);

module.exports = router;
