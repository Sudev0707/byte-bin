

const express = require("express")
const router = express.Router();
const Problem = require("../models/AddProblems");

// 
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });

    // 
    const formattedProblems = problems.map((doc) => {
      const obj = doc.toObject();

      return {
        ...obj,
        id: obj._id.toString(),
        dateAdded: obj.createdAt.toISOString().split("T")[0],
        // dateAdded: new Date(obj.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
      }
    })


    // const problemsWithId = problems.map((doc) => ({
    //   ...doc.toObject(),
    //   id: doc._id.toString(),
    // }));

    res.status(200).json(formattedProblems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    const problemWithId = {
      ...problem.toObject(),
      id: problem._id.toString(),
    };
    res.status(200).json(problemWithId);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
