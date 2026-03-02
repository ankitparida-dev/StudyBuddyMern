const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const sendNotificationEmail = async ({ recipient, subject, body }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient,
        subject,
        body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email API Error:', error);
    throw error;
  }
};