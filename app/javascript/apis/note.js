export async function createNote(formData) {
  try {
    const response = await fetch(`/api/v1/notes`, {
      method: "POST",
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      },
      body: formData
    });    
    return response;
  } catch (error) {
    console.error("Error:", error);
  }
}
