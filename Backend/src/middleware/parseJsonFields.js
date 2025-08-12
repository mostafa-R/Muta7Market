// middlewares/parseJsonFields.js
export const parseJsonFields = (fields = []) => (req, res, next) => {
    for (const f of fields) {
      const val = req.body?.[f];
      if (typeof val === "string") {
        try { req.body[f] = JSON.parse(val); } catch { /* keep as string */ }
      }
    }
    next();
  };
  