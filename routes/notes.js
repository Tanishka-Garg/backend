const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

//ROUTE 1:  get all notes from user using GET "api/notes/fetchallnotes" login of the user required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
  }
});

//ROUTE 2:  add notes from user using POST "api/notes/addnote" login of the user required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "enter valid email").isLength({ min: 2 }),
    body("description", "enter valid password").isLength({ min: 4 }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savenote = await note.save();
      res.json(savenote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

//ROUTE 3:  update notes from user using PUT "api/notes/updatenote" login of the user required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    // create newnote object
    const { title, description, tag } = req.body;
    const newnote = {};
    if (title) {
      newnote.title = title;
    }
    if (description) {
      newnote.description = description;
    }
    if (tag) {
      newnote.tag = tag;
    }

    //find note to be updated
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("unauthorized");
    }

    //update the note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newnote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
  }
});

//ROUTE 4:  delete notes from user using DELETE "api/notes/deletenote" login of the user required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //find note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("unauthorized");
    }

    //update the note
    note = await Note.findByIdAndDelete(req.params.id);
    res.json("Successfully deleted");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
  }
});

module.exports = router;
