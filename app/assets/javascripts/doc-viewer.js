const docPicker = document.getElementById('doc-picker');
const docViewer = document.getElementById('doc-viewer');
const docViewerBody = document.getElementById('doc-viewer-body');

docPicker.onchange = handleDocPickerChange

async function handleDocPickerChange(e) {
  const files = e.target.files;  

  const formData = new FormData();
  formData.append("file", files[0]);
  
  const response = await fetch("/api/v1/conversions/docx_to_html", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(data.html, 'text/html');
  
  docViewerBody.innerHTML = htmlDoc.getElementsByTagName('body')[0].innerHTML;  
}
