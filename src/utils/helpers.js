export const formatMessage = (username, text) => {
    return {
        username,
        text,
        timestamp: new Date().toISOString()
    };
};

export const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9);
};