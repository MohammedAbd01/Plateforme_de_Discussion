class RoomController {
    constructor(Room) {
        this.Room = Room;
    }

    async createRoom(req, res) {
        const { name, subject } = req.body;
        try {
            const newRoom = new this.Room({ name, subject, participants: [] });
            await newRoom.save();
            res.status(201).json(newRoom);
        } catch (error) {
            res.status(500).json({ message: 'Error creating room', error });
        }
    }

    async joinRoom(req, res) {
        const { roomId } = req.params;
        const { userId } = req.body;
        try {
            const room = await this.Room.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }
            if (!room.participants.includes(userId)) {
                room.participants.push(userId);
                await room.save();
            }
            res.status(200).json(room);
        } catch (error) {
            res.status(500).json({ message: 'Error joining room', error });
        }
    }

    async getRooms(req, res) {
        try {
            const rooms = await this.Room.find();
            res.status(200).json(rooms);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving rooms', error });
        }
    }
}

export default RoomController;