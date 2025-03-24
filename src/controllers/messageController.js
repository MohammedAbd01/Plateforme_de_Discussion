class MessageController {
    constructor(Message) {
        this.Message = Message;
    }

    async sendMessage(req, res) {
        try {
            const { content, roomId } = req.body;
            const message = new this.Message({
                content,
                sender: req.user.id,
                roomId,
                timestamp: new Date()
            });
            await message.save();
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    async getMessages(req, res) {
        try {
            const { roomId } = req.params;
            const messages = await this.Message.find({ roomId }).sort({ timestamp: 1 });
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve messages' });
        }
    }

    async searchMessages(req, res) {
        try {
            const { roomId, query } = req.params;
            const messages = await this.Message.find({
                roomId,
                content: { $regex: query, $options: 'i' }
            });
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Failed to search messages' });
        }
    }
}

export default MessageController;