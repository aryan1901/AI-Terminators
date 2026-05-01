const axios = require("axios");
const UsageEvent = require("../models/UsageEvent");

const fallbackSummarize = (text, length = "medium") => {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  if (sentences.length === 0) return text.slice(0, 300);

  const count =
    length === "short" ? 2 :
    length === "long" ? 6 :
    4;

  return sentences.slice(0, count).join(" ");
};

// @desc    Summarize text
// @route   POST /api/summarize
// @access  Private
const summarizeText = async (req, res) => {
  try {
    const { text, length = "medium" } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Please provide text to summarize" });
    }

    let summary = "";

    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      summary =
        response.data?.[0]?.summary_text ||
        response.data?.summary_text ||
        "";
    } catch (hfError) {
      console.log("Hugging Face failed, using fallback summary:");
      console.log(hfError.response?.data || hfError.message);

      summary = fallbackSummarize(text, length);
    }

    await UsageEvent.create({
      userId: req.user._id,
      tool: "summarizer",
      action: "summarize",
      meta: {
        summary: `Created ${length} summary`,
        textPreview: text.slice(0, 80),
      },
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summarizer error:", error);
    return res.status(500).json({ message: "Summarization failed" });
  }
};

module.exports = { summarizeText };