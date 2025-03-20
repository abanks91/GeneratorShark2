document.addEventListener("DOMContentLoaded", function () {
    console.log("GeneratorShark Cyberpunk UI Loaded!");

    // API Base URL (change this if needed)
    const API_BASE_URL = "https://www.generatorshark.com"; 

    // Example: Fetch a generated text from backend
    function fetchGeneratedText() {
        fetch(`${API_BASE_URL}/api/text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log("Generated Text:", data.text);
            document.getElementById("generatedText").innerText = data.text; // Update UI if an element exists
        })
        .catch(error => console.error("Error fetching text:", error));
    }

    // Example: Fetch a generated meme from backend
    function fetchMeme() {
        fetch(`${API_BASE_URL}/api/meme`)
        .then(response => response.json())
        .then(data => {
            console.log("Generated Meme:", data.meme);
            document.getElementById("memeImage").src = data.meme; // Update UI if an element exists
        })
        .catch(error => console.error("Error fetching meme:", error));
    }

    // Call API functions when the page loads
    fetchGeneratedText();
    fetchMeme();
});
