
const express = require("express")
const router = express.Router();
const Problem = require("../models/AddProblems");

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, topic, language, difficulty, notes, references, code, solutions } = req.body;
    
    const updatedProblem = await Problem.findByIdAndUpdate(
      id, 
      { title, description, topic, language, difficulty, notes, references, code, solutions }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    
    const problemWithId = {
      ...updatedProblem.toObject(),
      id: updatedProblem._id.toString(),
    };
    
    res.status(200).json({ message: "Problem updated successfully", data: problemWithId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
