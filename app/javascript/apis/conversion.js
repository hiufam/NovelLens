
/**
 * 
 * @param {{file: File}} formData 
 */
export async function convertDocToHtml(formData) {
  try {    
    const response = await fetch("/api/v1/docx_to_html", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('Error: ' + error);
  }
}
