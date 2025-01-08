import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Message {
    role: 'user' | 'assistant';
    content: any;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultMessages = [
        "Analyze the Reels",
        "What do you think of Static posts?",
        "Which platform drives more users?",
        "Compare static posts with Reels performance"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        setError(null);
        const userMessage: Message = {
            role: 'user',
            content: inputMessage
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputMessage }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Log the styled UI from Mistral
            console.log("Styled UI from Mistral:", data.styledUI);

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.styledUI
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        }

        setIsLoading(false);
        setInputMessage('');
    };

    const renderMessage = (message: Message) => {
        if (message.role === 'user') {
            return (
                <div className="bg-blue-100 p-4 rounded-lg ml-auto max-w-[80%] shadow-md">
                    <p className="text-gray-800">{message.content}</p>
                </div>
            );
        }

        // Render the styled UI from Mistral inside a StyledResponse container
        return (
            <div className="StyledResponse bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%] shadow-md">
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="w-full max-w-6xl mx-auto p-6">
                <Card className="shadow-lg">
                    <CardContent className="p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                {error}
                            </div>
                        )}
                        <div className="space-y-6 mb-4 h-[500px] overflow-y-auto">
                            {messages.map((message, index) => (
                                <div key={index}>
                                    {renderMessage(message)}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%] shadow-md">
                                    <p className="text-gray-700">Processing...</p>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
                            >
                                Send
                            </Button>
                        </form>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {defaultMessages.map((msg, index) => (
                                <Button
                                    key={index}
                                    onClick={() => setInputMessage(msg)}
                                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-200 shadow-md"
                                >
                                    {msg}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Chat;