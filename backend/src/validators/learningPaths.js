export const validateLearningPath = (req, res, next) => {
  const { title, description, stepsCount } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(422).json({ error: "Validation failed: 'title' is required and must be a non-empty string." });
  }

  if (!description || typeof description !== "string") {
    return res.status(422).json({ error: "Validation failed: 'description' is required." });
  }

  if (stepsCount === undefined || typeof stepsCount !== "number" || stepsCount <= 0) {
    return res.status(422).json({ error: "Validation failed: 'stepsCount' must be a positive number." });
  }

  next();
};