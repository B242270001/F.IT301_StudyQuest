let learningPaths = [
  {
    id: "lp-1",
    title: "Web Development Foundations",
    description: "Learn HTML, CSS, and basic JavaScript.",
    stepsCount: 5,
    category: "Web",
  },
  {
    id: "lp-2",
    title: "MERN Stack Mastery",
    description: "Build fullstack apps with MongoDB, Express, React, Node.",
    stepsCount: 8,
    category: "Fullstack",
  }
];

export const getLearningPaths = () => learningPaths;

export const getLearningPathById = (id) => learningPaths.find(p => p.id === id);

export const createLearningPath = (data) => {
  const newPath = {
    id: `lp-${Date.now()}`,
    ...data
  };
  learningPaths.push(newPath);
  return newPath;
};