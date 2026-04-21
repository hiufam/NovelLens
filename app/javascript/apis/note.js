export async function createNote(formData) {
  try {
    const response = await fetch(`/api/v1/notes`, {
      method: "POST",
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      },
      body: formData
    });        
    const jsonRes = await response.json();
    
    return {
      response,
      data: jsonRes,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getNotes(params = { limit: 5, offset: 0 }) {
  try {
    const response = await fetch(`/api/v1/notes?limit=${params.limit}&offset=${params.offset}`);
    const jsonRes = await response.json();    

    return {
      response,
      data: jsonRes,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function deleteNote(id) {
  try {
    const response = await fetch(`/api/v1/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      },
    });
    const jsonRes = await response.json();    

    return {
      response,
      data: jsonRes,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function updateNote(id, formData) {
  try {
    const response = await fetch(`/api/v1/notes/${id}`, {
      method: 'PUT',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      },
      body: formData,
    });
    const jsonRes = await response.json();    

    return {
      response,
      data: jsonRes,
    };
  } catch (error) {
    console.error("Error:", error);
  }
}
