const generateBtn = document.querySelector(".generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const resultImg = document.querySelector(".result-img");
const UploadButton = document.querySelector(".gen-mode");
const downloadBtn = document.querySelector("#downloadBtn");
const addImageAndText = document.querySelector(".addImageAndText-container");

const imgCard = document.getElementById("img-cardID");
const credits = document.getElementById("Credits");

//Other way to Get elements

document.addEventListener('DOMContentLoaded',() => {
 document.getElementById('addImageButton').addEventListener("change", picFiles);
 document.querySelector(".image-edit-btn").addEventListener("submit", editButtonFunc)
});

//files change
function picFiles(e){
 const imagePreview = document.getElementById('imagePreview');
 const plusText = document.getElementById('plusText');
 const file = this.files[0];

  if (file) {
    
    const reader = new FileReader();

    reader.onload = function(e) {
      const base64Image = e.target.result;
      //localStorage.setItem('savedImage', base64Image);
        // Set the image source
    
  // --- Get real image dimensions ---
            const img = new Image();
            img.onload = function() {
                // Store dimensions on the input element to access later
                document.getElementById('addImageButton').dataset.width = img.naturalWidth;
                document.getElementById('addImageButton').dataset.height = img.naturalHeight;
                console.log(`Image size: ${img.naturalWidth} x ${img.naturalHeight}`);
            };
            img.src = base64Image;

      const uploadBtn = document.getElementById('idktry');
     uploadBtn.style.backgroundImage = `url(${base64Image})`;
     uploadBtn.style.backgroundSize = 'cover';
     uploadBtn.style.backgroundPosition = 'center';
     uploadBtn.style.color = 'transparent'; // hides "Upload" text
    // removes dashed style
     uploadBtn.style.backgroundSize = 'contain';
     uploadBtn.style.backgroundRepeat = 'no-repeat';
     uploadBtn.style.backgroundPosition = 'center';
    }

    reader.readAsDataURL(file);
  }
}

const dropArea = document.querySelector('.droparea');

// Prevent browser from opening the file on drag
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});

// Visual feedback
['dragenter', 'dragover'].forEach(event => {
    dropArea.addEventListener(event, () => {
        dropArea.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(event => {
    dropArea.addEventListener(event, () => {
        dropArea.classList.remove('drag-over');
    });
});

// Handle the actual drop
dropArea.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];

    if (!file || !file.type.startsWith('image/')) return;

    // Inject the file into the existing input so picFiles works normally
    const fileInput = document.getElementById('addImageButton');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Reuse your existing function
    picFiles.call(fileInput);
});




const promptInput = document.querySelector(".prompt-input");
let currentImageBlob = null;

// Generate


document.querySelector(".prompt-form").addEventListener("submit", promptForm)
   
async function promptForm(e){
    e.preventDefault();
    const prompt = promptInput.value.trim();
    
    const promptForm = document.querySelector(".prompt-form");
    const imageInput = document.getElementById("addImageButton");
    const file = imageInput.files[0];

    try {
        generateBtn.disabled = true;
        generateBtn.innerText = "Loading...";
        imgCard.classList.add("loading");
        //galleryGrid.style.display = "block";


        const formData = new FormData();
        formData.append("prompt", prompt);

       if (file) {
       formData.append("image", file);

               // Pull the stored dimensions
        const width = imageInput.dataset.width;
        const height = imageInput.dataset.height;

        if (width && height) {
            formData.append("width", width);
            formData.append("height", height);
            console.log(`Sending size: ${width} x ${height}`);
        }
       }

        // Sending to Back
        const response = await fetch("/generateImage", {
            method: "POST",
            body: formData,
        });

        
        // --- NEW LOGIC FOR LOGIN REDIRECT ---
        if (response.status === 401) {
            
            // 1. Save the text to the browser's memory
            localStorage.setItem('savedPrompt', prompt);
            
            
            // 2. Redirect them to the Google login route
            window.location.href = '/auth/google';
            return; // Stop the rest of the function
        }

        // 1. Check for errors first (e.g., Not logged in, out of credits)
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error); // Alerts "Out of credits!" or "You must be logged in"
            throw new Error(errorData.error); // Stop the script here
        }

        const imageBlob = await response.blob();
        currentImageBlob = imageBlob;
         
         // Create a temporary local URL for the blob
        const imageObjectURL = URL.createObjectURL(imageBlob);

        const remainingCredits = response.headers.get('X-Remaining-Credits');

        // 2. Preload the image
        const test = new Image();
        // Look at the new structure: resimage.image.message
        test.src = imageObjectURL; 

          const timeoutId = setTimeout(() => { 
            URL.revokeObjectURL(imageObjectURL); 
            }, 30000);

        test.onload = function () {
            resultImg.src = test.src;          
            
            imgCard.classList.remove("loading");

            generateBtn.innerText = "Generate";
            generateBtn.disabled = false;
            
            //Clean up memory after the image has loaded
             clearTimeout(timeoutId);
            URL.revokeObjectURL(imageObjectURL);

            // : Update your UI with the remaining credits!
            credits.textContent = remainingCredits;
        };

        test.onerror = function () {
          alert("Failed to load image");
          clearTimeout(timeoutId); // Cancel safety timer
          URL.revokeObjectURL(imageObjectURL); // Clean up immediately 
        };
         
    } catch (error) {
        console.error(error);
        generateBtn.innerText = "Generate";
        generateBtn.disabled = false;
        imgCard.classList.remove("loading");
    }
};

//Upload buton


UploadButton.addEventListener("click", function(){
    const fileInput = document.getElementById("addImageButton");
    fileInput.click()
});




//image downoald

downloadBtn.addEventListener("click", function() {
    if (!currentImageBlob) {
        alert("No image to download");
        return;
    }

    const url = URL.createObjectURL(currentImageBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-${Date.now()}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
});

//edit button

function editButtonFunc(){
  
};

var typingTimeout;

//text are animation

function AnimationOftext() {
 const messages = [
  "Thumbnail is about...",
  "It should be...",
  "It looks like..."
 ];

 const el = document.getElementById("typeArea");
 let msgIndex = 0;
 let charIndex = 0;

 function typePlaceholder() {
  const current = messages[msgIndex];
  el.placeholder = current.slice(0, charIndex);

  charIndex++;

  if (charIndex <= current.length) {
    typingTimeout = setTimeout(typePlaceholder, 100);
  } else {
    typingTimeout = setTimeout(() => {
      charIndex = 0;
      msgIndex = (msgIndex + 1) % messages.length;
      typePlaceholder();
    }, 2500);
  }
 }

 typePlaceholder();

 generateBtn.addEventListener("click", function(){
 clearTimeout(typingTimeout);
 el.placeholder = "Describe the thumbnail you want to create/edit..."
generateBtn.style.backgroundColor = "#f3c81e";
generateBtn.style.boxShadow ="0 3px 0px #d7bb1c, 0 8px 15px rgba(0, 0, 0, 0.2)";
generateBtn.textContent = "Generate";
document.querySelector(".logo-edit").style.display = "none"
 })

}

AnimationOftext()

//Logout
/*document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        // Hit the logout route
        const response = await fetch('/auth/logout', { 
            method: 'POST' 
        });

        if (response.ok) {
            // Redirect the user back to the home page or login page
            window.location.href = '/'; 
        }
    } catch (error) {
        console.error("Failed to log out", error);
    }
});*/

// Run this when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // 1. Check if we have a saved prompt in memory
    const savedPrompt = localStorage.getItem('savedPrompt');
    const savedfile = localStorage.getItem('savedImage');

    if (savedPrompt) {
        // 2. Put the text back into the input field
        promptInput.value = savedPrompt;
        
        // 3. Clear it from memory so it doesn't get stuck there forever
        localStorage.removeItem('savedPrompt');
        
    }
    if (savedfile) {

    
        const imagePreview = document.getElementById('imagePreview');
        const plusText = document.getElementById('plusText');
        // 2. Put the text back into the input field
     /*  imagePreview.src = savedfile;
      // Show the image
      imagePreview.style.display = 'block';
      // Hide the "+" text
      plusText.style.display = 'none'; */
    

     


        localStorage.removeItem('savedImage');
    }
    
});




// Focus on input

promptInput.addEventListener("focus", () => {
    addImageAndText.style.outline = "1px solid #000";
    addImageAndText.style.boxShadow = "#00000052 0 8px 6px -6px";
});

promptInput.addEventListener("blur", () => {
    addImageAndText.style.outline = "none";
    addImageAndText.style.boxShadow = "none";
});

//function that shows credits if auth

async function fetchInitialCredits() {
        try {
            const response = await fetch('/api/user-stats');
            if (response.ok) {
                const data = await response.json();
                console.log( `Initial Credits: ${data.credits}`);
                document.getElementById("Credits").textContent = data.credits;
            }
        } catch (err) {
            console.error("Failed to load credits", err);
        }
    }
//try loading credits
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if the URL has our unique login flag
    if (urlParams.get('login') === 'success') {
        console.log("Login detected! Fetching credits...");
        fetchInitialCredits();

        // CLEANUP (Optional but recommended): 
        // This removes the "?login=success" from the address bar 
        // so it looks clean and won't trigger again on a simple refresh.
        window.history.replaceState({}, document.title, "/");
    } else {
        // Standard page load logic (maybe still fetch credits if you want them always visible)
        fetchInitialCredits(); 
    }
});



