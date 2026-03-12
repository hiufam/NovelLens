export async function getWordDefinition(query) {
  try {
    const response = await fetch(`/api/v1/definitions?query=${query}`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
