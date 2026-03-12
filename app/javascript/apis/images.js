/**
 * 
 * @param {{search: string}} args
 * @returns 
 */
export async function getImages(args) {
  try {
    const { query } = args;    

    const response = await fetch(`/api/v1/images?query=${query}`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
