// Utility for voice dictation using the Web Speech API
// Provides a startDictation function that returns a promise with the transcript

export function startDictation({ lang = "en-US", interim = false } = {}) {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported"));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = interim;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    recognition.onerror = (event) => {
      reject(event.error);
    };
    recognition.onnomatch = () => {
      reject("No speech match");
    };
    recognition.start();
  });
}
