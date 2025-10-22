# Quiz Game - Multiplayer Quiz Application

Ứng dụng quiz multiplayer với Socket.io, React và Node.js cho phép nhiều người chơi cùng lúc.

## Tính năng

### Tính năng chính

- **Multiplayer Real-time**: Nhiều người chơi cùng lúc
- **Phòng chơi**: Tạo và tham gia phòng chơi
- **Host Controls**: Host quản lý game và câu hỏi
- **Real-time Leaderboard**: Bảng xếp hạng cập nhật theo thời gian thực
- **Timer**: Giới hạn thời gian cho mỗi câu hỏi
- **Responsive Design**: Giao diện đẹp trên mọi thiết bị

### Trải nghiệm game

- **Lobby**: Chờ đợi và quản lý người chơi
- **Game Play**: Trả lời câu hỏi với timer
- **Results**: Xem kết quả và bảng xếp hạng
- **Admin Panel**: Host quản lý câu hỏi và game

## Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js >= 14.0.0
- npm hoặc yarn

### Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd Quiz
```

2. **Cài đặt dependencies cho server**

```bash
cd server
npm install
```

3. **Cài đặt dependencies cho client**

```bash
cd ../client
npm install
```

### Chạy ứng dụng

1. **Khởi động server**

```bash
cd server
npm start
# hoặc cho development
npm run dev
```

2. **Khởi động client** (terminal mới)

```bash
cd client
npm start
```

3. **Truy cập ứng dụng**

- Mở trình duyệt tại: `http://localhost:3000`
- Server API: `http://localhost:4000`

## Cấu trúc dự án

```
Quiz/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   │   ├── Game/      # Game Components
│   │   │   ├── Admin/     # Admin Components
│   │   │   └── Common/    # Shared Components
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # Custom Hooks
│   │   ├── services/      # API Services
│   │   └── utils/         # Utility Functions
│   └── public/
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Route Controllers
│   │   ├── models/        # Data Models
│   │   ├── services/      # Business Logic
│   │   ├── routes/        # API Routes
│   │   ├── middleware/    # Custom Middleware
│   │   └── utils/         # Utility Functions
│   └── index.js          # Server Entry Point
└── README.md
```

## Cách sử dụng

### Cho người chơi

1. **Tạo phòng**: Nhập tên và nhấn "Tạo phòng"
2. **Tham gia phòng**: Nhập tên và mã phòng
3. **Chơi game**: Trả lời câu hỏi trong thời gian quy định
4. **Xem kết quả**: Kiểm tra bảng xếp hạng

### Cho host

1. **Tạo phòng**: Tự động trở thành host
2. **Quản lý người chơi**: Xem danh sách người chơi
3. **Bắt đầu game**: Khi đủ người chơi
4. **Điều khiển game**: Chuyển câu hỏi, kết thúc game

## API Endpoints

### Server API

- `GET /api/health` - Kiểm tra trạng thái server
- `GET /api/games` - Lấy danh sách game đang hoạt động

### Socket Events

#### Client → Server

- `create_room` - Tạo phòng mới
- `join_room` - Tham gia phòng
- `leave_room` - Rời phòng
- `start_game` - Bắt đầu game
- `submit_answer` - Gửi câu trả lời
- `next_question` - Chuyển câu hỏi tiếp theo
- `end_game` - Kết thúc game

#### Server → Client

- `room_created` - Phòng đã được tạo
- `joined_room` - Đã tham gia phòng
- `player_joined` - Người chơi mới tham gia
- `player_left` - Người chơi rời khỏi
- `game_started` - Game đã bắt đầu
- `question_started` - Câu hỏi mới
- `question_timeout` - Hết thời gian
- `leaderboard_update` - Cập nhật bảng xếp hạng
- `game_ended` - Game kết thúc

## Giao diện

### Màu sắc chính

- **Primary**: #667eea (Xanh dương)
- **Secondary**: #764ba2 (Tím)
- **Success**: #48bb78 (Xanh lá)
- **Danger**: #f56565 (Đỏ)
- **Warning**: #f6ad55 (Cam)

### Responsive Design

- **Desktop**: Layout đầy đủ với sidebar
- **Tablet**: Layout tối ưu cho màn hình trung bình
- **Mobile**: Layout dọc, tối ưu cho màn hình nhỏ

## Tính năng nâng cao

### Đã implement

- Multiplayer real-time
- Room management
- Host controls
- Real-time leaderboard
- Timer system
- Responsive design
- Error handling
- Loading states

### Có thể mở rộng

- Database integration (MongoDB/PostgreSQL)
- User authentication
- Question categories
- Custom question editor
- Game statistics
- Chat system
- Spectator mode
- Tournament mode

## Troubleshooting

### Lỗi thường gặp

1. **Không kết nối được server**

   - Kiểm tra server đã chạy chưa
   - Kiểm tra port 4000 có bị chiếm không

2. **Socket connection failed**

   - Kiểm tra CORS settings
   - Kiểm tra firewall

3. **Game không bắt đầu được**
   - Cần ít nhất 2 người chơi
   - Host phải có quyền bắt đầu game

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
