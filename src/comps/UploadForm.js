import React, { useState } from "react";
import ProgressBar from "./ProgressBar";

import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
tf.enableProdMode();

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const types = ["image/png", "image/jpeg"];

  const checkContent = async (file) => {
    const img = document.getElementById("preload-photo");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = reader.result;
    };

    reader.readAsDataURL(file);

    const model = await nsfwjs.load("/model/", { size: 299 });

    // Classify the image
    const predictions = await model.classify(img);

    // Reset img src after check (otherwise the classifier may get wrong input from previous img data)
    img.src = "";

    return predictions;
  };

  const handleChange = async (e) => {
    let file = e.target.files[0];

    if (file && types.includes(file.type)) {
      console.log(`Checking ${file.name}...`);
      const predictions = await checkContent(file);
      // console.log(predictions);
      let isBlocked = false;

      predictions.forEach((p) => {
        if (
          ["Hentai", "Porn", "Sexy"].includes(p.className) &&
          p.probability >= 0.05
        ) {
          isBlocked = true;
        }
        console.log(`${p.className}: ${(p.probability * 100).toFixed(2)}%`);
      });

      if (!isBlocked) {
        setFile(file);
        setError("");
      } else {
        setFile(null);
        setError(
          "This photo looks inappropriate! Please select a different one."
        );
      }
    } else {
      setFile(null);
      setError("Please select an image file (png or jpg)");
    }
  };

  return (
    <form>
      <label>
        <input type="file" onChange={handleChange} />
        <span>+</span>
      </label>
      <div className="output">
        {error && <div className="error">{error}</div>}
        {file && <div>{file.name}</div>}
        {file && <ProgressBar file={file} setFile={setFile} />}
      </div>
      <img
        src=""
        alt="preload"
        id="preload-photo"
        style={{ maxHeight: "250px", visibility: "hidden", display: "none" }}
      />
    </form>
  );
};

export default UploadForm;
