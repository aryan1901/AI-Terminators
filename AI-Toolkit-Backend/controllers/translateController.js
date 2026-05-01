const axios = require("axios");
const TranslationHistory = require("../models/TranslationHistory");
const UsageEvent = require("../models/UsageEvent");

const googleTranslate = async (text, sourceLang, targetLang) => {
  const url = "https://translate.googleapis.com/translate_a/single";

  const response = await axios.get(url, {
    params: {
      client: "gtx",
      sl: sourceLang,
      tl: targetLang,
      dt: "t",
      q: text,
    },
  });

  return response.data[0].map((item) => item[0]).join("");
};

const myMemoryTranslate = async (text, sourceLang, targetLang) => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${sourceLang}|${targetLang}`;

  const response = await axios.get(url);
  return response.data.responseData.translatedText;
};

// @desc    Translate text
// @route   POST /api/translate
// @access  Private
const translateText = async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    let translatedText = "";

    try {
      translatedText = await googleTranslate(text, sourceLang, targetLang);
    } catch (googleError) {
      console.log("Google translate failed, using MyMemory fallback");
      translatedText = await myMemoryTranslate(text, sourceLang, targetLang);
    }

    const history = await TranslationHistory.create({
      userId: req.user._id,
      sourceText: text,
      translatedText,
      sourceLang,
      targetLang,
    });

    await UsageEvent.create({
      userId: req.user._id,
      tool: "translator",
      action: "translate",
      meta: {
        summary: `Translated ${sourceLang} → ${targetLang}`,
        textPreview: text.slice(0, 80),
      },
    });

    res.status(200).json({
      success: true,
      translatedText,
      history: history._id,
    });
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);
    res.status(500).json({ message: error.message || "Translation failed" });
  }
};

// @desc    Get translation history
// @route   GET /api/translate/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const history = await TranslationHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { translateText, getHistory };