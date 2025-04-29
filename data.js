// User Management
const USER_KEY = 'sentimeter_user';
const EMOTIONS_KEY = 'sentimeter_emotions';

const saveUser = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

// Emotion Entries Management
const saveEmotion = (emotionData) => {
    const user = getUser();
    if (!user) return false;

    // Get all emotions data
    let allEmotions = getAllEmotionsData();
    
    // Add new emotion with user identifier
    const newEmotion = {
        ...emotionData,
        userId: user.email,
        timestamp: new Date().toISOString()
    };

    // Update user's emotions
    allEmotions[user.email] = [
        newEmotion,
        ...(allEmotions[user.email] || [])
    ];

    // Save all emotions back to localStorage
    localStorage.setItem(EMOTIONS_KEY, JSON.stringify(allEmotions));
    return true;
};

const getEmotions = () => {
    const user = getUser();
    if (!user) return [];

    const allEmotions = getAllEmotionsData();
    return allEmotions[user.email] || [];
};

const getAllEmotionsData = () => {
    const emotions = localStorage.getItem(EMOTIONS_KEY);
    return emotions ? JSON.parse(emotions) : {};
};

const clearEmotions = () => {
    const user = getUser();
    if (!user) return;

    const allEmotions = getAllEmotionsData();
    delete allEmotions[user.email];
    localStorage.setItem(EMOTIONS_KEY, JSON.stringify(allEmotions));
};
