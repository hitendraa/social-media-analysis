const axios = require('axios');
require('dotenv').config();

const ASTRA_API_ENDPOINT = "https://api.langflow.astra.datastax.com/lf/a59f5097-f04c-401a-b620-753f149165b3/api/v1/run/c1ab3c98-bb86-4aac-9947-5739c9c5f45a";
const APPLICATION_TOKEN = "AstraCS:AzAeUrtZQlQwHMszWviQjpZP:ef06082d45f326afcbca56bd43d5e42d78fc1021296868072c5e456954d0a483";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

exports.processChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Step 1: Get raw data from Astra API
        const astraResponse = await axios.post(
            `${ASTRA_API_ENDPOINT}?stream=false`,
            {
                input_value: message,
                output_type: "chat",
                input_type: "chat",
                tweaks: {
                    "File-ElsHF": {},
                    "ChatInput-i1J5S": {},
                    "AstraDB-aoG7S": {},
                    "SplitText-lKn6g": {},
                    "TextInput-74AuH": {},
                    "ParseData-G40Cw": {},
                    "CombineText-otcmj": {},
                    "GoogleGenerativeAIModel-jYetk": {},
                    "ChatOutput-pCPQL": {}
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${APPLICATION_TOKEN}`
                }
            }
        );

        // Extract the actual message content from the nested response
        let rawData;
        if (astraResponse.data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
            const textContent = astraResponse.data.outputs[0].outputs[0].results.message.text;
            const cleanedContent = textContent.replace(/```json\n|\n```/g, '');
            rawData = JSON.parse(cleanedContent);
        } else {
            rawData = astraResponse.data;
        }

        // Step 2: Send raw data to Mistral AI for styling
        const mistralResponse = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: "mistral-large-latest",
                messages: [
                    {
                        role: "user",
                        content: `
You are a UI designer. Your task is to apply the best Tailwind CSS and shadcn/ui styling to the following data. Use the following components and guidelines:

### Components to Use:
1. **Cards**: Use shadcn/ui Card component with Tailwind classes for padding, shadows, and borders.
   Example:
   \`\`\`html
   <div class="StyledResponse">
       <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
           <h2 class="text-xl font-bold mb-4">Card Title</h2>
           <p class="text-gray-700">Card content goes here.</p>
       </div>
   </div>
   \`\`\`

2. **Buttons**: Use shadcn/ui Button component with Tailwind classes for colors, hover effects, and shadows.
   Example:
   \`\`\`html
   <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md">
       Click Me
   </button>
   \`\`\`

3. **Inputs**: Use shadcn/ui Input component with Tailwind classes for borders, padding, and focus states.
   Example:
   \`\`\`html
   <input class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter text" />
   \`\`\`

4. **Tabs**: Use shadcn/ui Tabs component with Tailwind classes for spacing and borders.
   Example:
   \`\`\`html
   <div class="flex space-x-4 border-b border-gray-200">
       <button class="px-4 py-2 text-gray-500 hover:text-blue-500">Tab 1</button>
       <button class="px-4 py-2 text-gray-500 hover:text-blue-500">Tab 2</button>
   </div>
   \`\`\`

5. **Charts**: Use Recharts with Tailwind classes for responsive sizing.
   Example:
   \`\`\`html
   <div class="h-[300px]">
       <ResponsiveContainer width="100%" height="100%">
           <BarChart data={data}>
               <XAxis dataKey="name" />
               <YAxis />
               <Tooltip />
               <Legend />
               <Bar dataKey="value" fill="#8884d8" />
           </BarChart>
       </ResponsiveContainer>
   </div>
   \`\`\`

6. **Responsive Grid**: Use Tailwind's grid system for responsive layouts.
   Example:
   \`\`\`html
   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
       <div class="bg-white p-4 rounded-lg shadow-md">Item 1</div>
       <div class="bg-white p-4 rounded-lg shadow-md">Item 2</div>
       <div class="bg-white p-4 rounded-lg shadow-md">Item 3</div>
   </div>
   \`\`\`

### Guidelines:
- Wrap the entire styled output in a div with the class "StyledResponse".
- Do not add, remove, or modify any content. Only apply styling.
- Ensure the design is fully responsive.

### Data:
${JSON.stringify(rawData)}
                        `
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`
                }
            }
        );

        // Extract the styled UI from Mistral's response
        const styledUI = mistralResponse.data.choices[0].message.content;

        // Log the styled code to the console
        console.log("Styled UI from Mistral:", styledUI);

        // Step 3: Return the styled UI
        res.json({ styledUI });

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(error.response?.status || 500).json({
            error: 'Failed to process chat message',
            details: error.message,
            statusCode: error.response?.status
        });
    }
};