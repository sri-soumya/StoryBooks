const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index", { stories });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).lean();
    if (!story) return res.render("error/404");
    if (story.user != req.user.id) {
      return res.redirect("/stories");
    }
    res.render("stories/edit", { story });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      await Story.deleteOne({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate("user").lean();
    if (!story) return res.render("error/404");
    res.render("stories/show", { story });
  } catch (error) {
    console.log(error);
    res.render("error/404");
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const stories = await Story.find({ user: req.params.id, status: "public" })
      .populate("user")
      .lean();
    res.render("stories/index", { stories });
  } catch (error) {
    console.log(error);
    res.redirect("error/500");
  }
});

router.post("/search", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      title: req.body.query,
      status: "public",
    })
      .populate("user")
      .lean();
    if (!stories) return res.render("error/404");
    return res.render("stories/index", { stories });
  } catch (error) {
    console.log(error);
    res.render("error/404");
  }
});
module.exports = router;
