import { Ai } from '@cloudflare/ai';
import { marked } from 'marked';

export interface Env { AI: any; }

export default {
  async fetch(request: Request, env: Env) {
    const ai = new Ai(env.AI);

    if (request.method === 'POST') {
      const formData = await request.formData();
      const question = formData.get('question') || '';

      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: question }
      ];

      const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', { messages });

      const htmlResponse = marked.parse(response.response);

      const formattedResponse = `${question}\n${htmlResponse}`;

      return new Response(formattedResponse, { headers: { 'Content-Type': 'text/plain' } });
    }

    async function fetchBingWallpaper() {
      const response = await fetch(`https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US`);
      const data: any = await response.json();
      return "https://www.bing.com" + data.images[0].urlbase + "_" + "UHD.jpg";
    }

    const backgroundImageUrl = await fetchBingWallpaper();

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kotone's Room</title>
        <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/uLcdia/cloudflare_llm/main/favicon.png">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          form {
            width: 100%;
            margin: 30px auto;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            opacity: 0.4;
            transition: opacity 0.1s;
          }
          form:focus-within {
            opacity: 0.8;
          }
          input[type="text"] {
            width: 80%;
            height: 40px;
            padding: 10px;
            margin: 0px 0px 10px 0px;
            border-radius: 25px;
            box-sizing: border-box;
            font-family: "Arial", Arial, sans-serif;
            font-weight: 600;
          }
          input[type="submit"] {
            width: 40px;
            height: 40px;
            padding: 10px;
            margin: 0px 0px 10px 5px;
            border-radius: 50%;
            box-sizing: border-box;
            background-color: cyan;
            font-family: "Arial", Arial, sans-serif;
            font-weight: 600;
            font-size: 16px;
          }
          body {
            background-image: url(${backgroundImageUrl});
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-size: cover;
          }
          #response {
            width: 80%;
            margin: auto;
            background-color: floralwhite;
            opacity: 0.8;
            padding: 30px;
            font-family: "Arial", Arial, sans-serif;
            font-weight: 600;
            font-size: 24px;
          }
          #response:empty {
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <form action="" method="POST" id="question-form">
          <input type="text" id="question" name="question" autofocus>
          <input type="submit" value="" id="submit-button">
        </form>
        <div id="response"></div>
        <script>
          let responseCounter = 0;
          document.querySelector('#question-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const submitButton = document.getElementById('submit-button');

            submitButton.value = ""
            submitButton.style.backgroundColor = 'coral';
            submitButton.disabled = true;

            const response = await fetch('', { method: 'POST', body: formData });
            const data = await response.text();
            //document.getElementById('response').innerHTML = data;

            responseCounter++;

            document.getElementById('question').value = '';

            const responseDiv = document.getElementById('response');
            const responseForm = document.createElement('div');
            responseForm.classList.add('response-form');
            if(responseCounter > 1){
              responseForm.innerHTML = data + "<br />";
            } else{
              responseForm.innerHTML = data;
            }
            responseDiv.insertBefore(responseForm, responseDiv.firstChild);

            document.getElementById('question').focus();

            submitButton.value = ""
            submitButton.style.backgroundColor = 'cyan';
            submitButton.disabled = false;

          });
        </script>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  }
}
