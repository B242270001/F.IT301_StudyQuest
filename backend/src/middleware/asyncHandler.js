// Express 4 async алдааг өөрөө барьдаггүй тул handler-ийг ороож next(err) руу дамжуулна.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
