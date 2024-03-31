import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
	element.textContent = '';
        
        loadInterval = setInterval(() => {
            element.textContent += '.';

            if(element.textContent === '....'){
               element.textContent = '';
            }
        }, 300);
	
}


function typeText(element, text) {
	let index = 0;

        let interval = setInterval(() => {
	  if(index < text.length){
		element.innerHTML += text.charAt(index);
                index++;
          }else{
		clearInterval(interval);
          }
	
	}, 20);
}

function generateUniqueId(){
	const timestamp = Date.now();
        const randomNumber = Math.random();

        const hexadecimalString = randomNumber.toString(16);

        return `id-${timestamp}-${hexadecimalString}`;
	
}

function chatStripe (isAi, value, uniqueId){
	return (
	`
           <div class="wrapper ${isAi && 'ai'}">
              <div class="chat">
                  <div class="profile">
                     <img
			src=${isAi ? bot: user}
                        alt="${isAi? 'bot': 'user'}"
                      />
                   </div>
                   <div class="message" id=${uniqueId}>${value}</div>
              </div>
           </div>
                     
        `
	)
}


const handleSubmit = async (e) => {
	e.preventDefault();
        const data = new FormData(form);
	chatContainer.innerHTML += chatStripe(false, data.get('prompt'));


        form.reset();

        const uniqueId = generateUniqueId();
        chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

        chatContainer.scrollTop = chatContainer.scrollHeight;

        const messageDiv = document.getElementById(uniqueId);
	loader(messageDiv);
	
	const imagesContainer = document.createElement('div');
        imagesContainer.className = 'row p-2';	

	for (let i = 0; i < 3; i++){
        	const response = await fetch('http://localhost:5000', {
	 		method: 'POST',
                	headers: {
                    	'Content-Type': 'application/json'
                	},
                	body: JSON.stringify({
		    	prompt: data.get('prompt')
			})
		})

        	//clearInterval(loadInterval);
        	//messageDiv.innerHTML = '';
	
		if (response.ok) {
	        	const contentType = response.headers.get('content-type');
        		if (contentType && contentType.startsWith('image')) {
           	 		// If response is an image, display it in the chat
            			const blob = await response.blob();
            			const imageUrl = URL.createObjectURL(blob);
            			const imgElement = document.createElement('img');
               			imgElement.className = 'img-fluid rounded';
				imgElement.style.borderRadius = '10px';
				imgElement.style.marginRight = '20px'; 
 
                		const tempImg = new Image();
            			tempImg.onload = function() {
                			const originalWidth = tempImg.width;
                			const originalHeight = tempImg.height;

                			// Set the width and height of the image element to 1/4th of the original size
                			imgElement.width = originalWidth / 4;
                			imgElement.height = originalHeight / 4;

                			imgElement.src = imageUrl;
                			imagesContainer.appendChild(imgElement);
                                        
                                        chatContainer.scrollTop = chatContainer.scrollHeight;
            			};
                                tempImg.src = imageUrl;
                	
        		} else {
            			// If response is not an image, treat it as text
            			const data = await response.json();
            			const parsedData = data.bot.trim();
            			typeText(messageDiv, parsedData);
        		}
    		} else {
        		const err = await response.text();
        		messageDiv.innerHTML = "Something went wrong";
        		alert(err);
    		}

	}

        messageDiv.appendChild(imagesContainer);
        clearInterval(loadInterval);
        //messageDiv.innerHTML = '';
        
}


form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
	if(e.keyCode === 13){
		handleSubmit(e);
	}
})
