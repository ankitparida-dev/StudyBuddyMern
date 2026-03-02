const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const sendChatMessage = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response');
    }

    return data.response;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
};