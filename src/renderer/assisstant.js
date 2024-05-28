const OpenAI = require('openai');

apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

const messageButton = document.getElementById('messageButton');

let ran;

messageButton.addEventListener('click', async function (event) {
  try {
  const thread = await openai.beta.threads.create();

  const message = await openai.beta.threads.messages.create(
    thread.id,
    {
      role: "user",
      content: "I need to write a python function that takes in a string and returns the first character of the string. Can you help me with that?"
    }
  );

  const messages = await openai.beta.threads.messages.list(
    thread.id
  );

  const run = await openai.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: process.env.ASSISTANT_ID
    }
  );

  while (ran?.status !== "complete" && ran?.status !== "failed") {
    ran = await new Promise(resolve => setTimeout(async () => {
      const result = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      resolve(result);
    }, 5000));
    console.log(ran);
  }
  
  console.log(message);
  console.log(messages);

  } catch (error) {
    console.error('Error handling message button click:', error.message);
  }
});
