export async function signOut() {
  try {
    const response = await fetch("/session", {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
        "Content-Type": "application/json"
      },
    });

    if (response.ok) {      
      return response;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
