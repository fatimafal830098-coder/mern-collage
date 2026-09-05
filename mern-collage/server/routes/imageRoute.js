const express = require("express");
const path = require("path");
const fs = require("fs");

const Image = require("../models/Image");
const upload = require("../middleware/upload");

const router = express.Router();
const normalizeTags = (tagsInput) => {
  if (!tagsInput) return [];
  let arr = Array.isArray(tagsInput) ? tagsInput : tagsInput.split(",");
  return arr
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
    .slice(0, 5);
};
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const { title, description } = req.body;
    const trimmedTitle = title ? title.trim() : "";

    if (!trimmedTitle || trimmedTitle.length > 80) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.status(400).json({
        message: "Title is required (1-80 characters)",
      });
    }
    if (description && description.length > 240) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.status(400).json({
        message: "Description cannot exceed 240 characters",
      });
    }

    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const tags = normalizeTags(req.body.tags);

    const image = await Image.create({
      imageUrl: imageUrl,
      title: trimmedTitle,
      description: description || "",
      tags: tags,
    });

    res.status(201).json(image);
  } catch (error) {
    console.error(error);

    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      message: "Failed to upload image",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, favorite, sort } = req.query;
    let query = {};

    if (favorite === "true") {
      query.isFavorite = true;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const images = await Image.find(query).sort(sortOption);
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get images",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const updates = {};

    if (title !== undefined) {
      const trimmed = title.trim();
      if (!trimmed || trimmed.length > 80) {
        return res.status(400).json({
          message: "Title must be between 1 and 80 characters",
        });
      }
      updates.title = trimmed;
    }

    if (description !== undefined) {
      if (description.length > 240) {
        return res.status(400).json({
          message: "Description cannot exceed 240 characters",
        });
      }
      updates.description = description;
    }

    if (tags !== undefined) {
      updates.tags = normalizeTags(tags);
    }

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedImage) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    res.json(updatedImage);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message || "Failed to update image details",
    });
  }
});

router.patch("/:id/favorite", async (req, res) => {
  try {
    const { isFavorite } = req.body;

    if (typeof isFavorite !== "boolean") {
      return res.status(400).json({
        message: "isFavorite must be a boolean value",
      });
    }

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      { isFavorite },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    res.json(updatedImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update favorite status",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    let filename;
    try {
      filename = path.basename(new URL(image.imageUrl).pathname);
    } catch (e) {
      filename = path.basename(image.imageUrl);
    }

    const filePath = path.join(__dirname, "..", "uploads", filename);

    await Image.findByIdAndDelete(req.params.id);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: "Image deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete image",
    });
  }
});

module.exports = router;