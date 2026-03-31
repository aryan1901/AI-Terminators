import React, { useState } from "react";
import "./PDFFlashCards.css";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFFlashCards = () => {

 const [cards, setCards] = useState([
    {
      question: "What is the main concept discussed?",
      answer: "Explanation of the concept."
    },
    {
      question: "Define the key term from chapter one.",
      answer: "Definition explanation."
    }
  ]);

  const [flip, setFlip] = useState({});
  const [file, setFile] = useState(null);

  const handleFlip = (index) => {
    setFlip(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleFileUpload = (file) => {
  if (!file) return;

  console.log("Uploaded file:", file.name);
    setFile(file);   
  // Later you can send this PDF to backend API
};

const generateFlashcards = async () => {

  if (!file) {
    alert("Please upload a PDF first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {

    const response = await fetch("http://localhost:8080/api/flashcards", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    setCards(data);

  } catch (error) {
    console.error("Error generating flashcards:", error);
  }
};




const shuffleCards = () => {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  console.log("Shuffled cards:", shuffled);
  setCards(shuffled);
};

const exportPDF = () => {

  const doc = new jsPDF();

  cards.forEach((card, index) => {
    doc.text(`Q${index + 1}: ${card.question}`, 10, 20 + index * 20);
    doc.text(`A: ${card.answer}`, 10, 30 + index * 20);
  });

  doc.save("flashcards.pdf");
};

const exportCSV = () => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    cards.map(card => `${card.question},${card.answer}`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");

  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "flashcards.csv");
  document.body.appendChild(link);

  link.click();
};
  return (
    <div className="flashcards-container">

      <h1>Generate Flashcards</h1>

      <div className="upload-box">
    <p>Drag & Drop your PDF here</p>

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => handleFileUpload(e.target.files[0])}
    />

  </div>

      <div className="options">
        <button>Cards: 20</button>
        <button>Difficulty: Mixed</button>
        <button className="generate" onClick={generateFlashcards}>
  Generate Flashcards
</button>
      </div>

      <div className="progress">
        <div className="progress-bar"></div>
      </div>

      <div className="cards">

        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${flip[index] ? "flip" : ""}`}
            onClick={() => handleFlip(index)}
          >
            {!flip[index] ? (
              <div>
                <h3>Q{index + 1}</h3>
                <p>{card.question}</p>
              </div>
            ) : (
              <div>
                <h3>Answer</h3>
                <p>{card.answer}</p>
              </div>
            )}
          </div>
        ))}

      </div>

      <div className="actions">
        <button onClick={shuffleCards}>Shuffle</button>
        <button onClick={exportPDF}>Export PDF</button>
        <button onClick={exportCSV}>Export CSV</button>
      </div>

    </div>
  );
};

export default PDFFlashCards;
