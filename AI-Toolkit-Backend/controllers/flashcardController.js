const pdfParse = require("pdf-parse");
const axios = require("axios");
const Flashcard = require("../models/Flashcard");
const UsageEvent = require("../models/UsageEvent");

const parseFlashcards = (text) => {
  const flashcards = [];
  const regex = /Q:\s*(.*?)\s*A:\s*(.*?)(?=Q:|$)/gs;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const question = match[1]?.trim();
    const answer = match[2]?.trim();

    if (question && answer) {
      flashcards.push({
        question,
        answer,
        difficulty: "medium",
      });
    }
  }

  return flashcards;
};

// @desc    Generate flashcards from PDF
// @route   POST /api/flashcards/generate
// @access  Private
const generateFlashcards = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    const text = data.text.substring(0, 2000);

    const prompt = `Generate 10 question and answer pairs from this text. Format each as "Q: [question] A: [answer]":\n\n${text}`;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const flashcardsText = response.data?.[0]?.generated_text || "";
    const flashcards = parseFlashcards(flashcardsText);

    const savedFlashcard = await Flashcard.create({
      userId: req.user._id,
      title: req.body.title || "Untitled Flashcard Set",
      sourceFileName: req.file.originalname,
      flashcards,
    });

    await UsageEvent.create({
      userId: req.user._id,
      tool: "flashcards",
      action: "generate_flashcards",
      meta: {
        title: savedFlashcard.title,
        summary: `Generated ${savedFlashcard.flashcards.length} cards from "${savedFlashcard.title}"`,
        cardCount: savedFlashcard.flashcards.length,
        sourceFileName: req.file?.originalname || "",
      },
    });

    res.status(201).json({
      success: true,
      data: savedFlashcard,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's flashcards
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: flashcards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateFlashcards,
  getFlashcards,
};