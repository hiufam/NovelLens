export async function searchWiki(query) {
  try {
    const response = await fetch(`/api/v1/wiki?query=${query}`);
    if (response.ok) {      
      return response.json();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
