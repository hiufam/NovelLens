const dictionaryApiUrl = 'https://api.dictionaryapi.dev/api/v2';

export async function getWordDefinition(word) {
  try {
    const response = await fetch(`${dictionaryApiUrl}/entries/en/${word}`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
