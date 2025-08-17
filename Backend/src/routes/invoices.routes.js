const express = require("express");
const { listMyInvoices, getInvoice } = require("../controllers/invoices.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/invoices", requireAuth, listMyInvoices);       // ?status=pending|paid|...
router.get("/invoices/:id", requireAuth, getInvoice);

module.exports = router;
