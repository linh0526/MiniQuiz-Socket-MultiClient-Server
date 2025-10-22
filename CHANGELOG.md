# Changelog

Tất cả các thay đổi quan trọng của dự án này sẽ được ghi lại trong file này.

Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
và dự án này tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-10-22

### Added

- Ứng dụng quiz multiplayer với Socket.io
- Hệ thống phòng chơi (tạo/tham gia/rời phòng)
- Real-time communication giữa client và server
- Timer system cho mỗi câu hỏi
- Leaderboard real-time
- Host controls để quản lý game
- Responsive design cho mobile và desktop
- Error handling và loading states
- Game states: Lobby, Playing, Results
- Admin panel cho host
- Cấu trúc MVC cho server
- React Context API cho state management
- Socket events cho real-time updates

### Technical Details

- **Frontend**: React 19.2.0, Socket.io-client 4.8.1
- **Backend**: Node.js, Express 5.1.0, Socket.io 4.8.1
- **Architecture**: MVC pattern, Context API, Real-time communication
- **Styling**: CSS3 với gradient và glassmorphism effects
- **Responsive**: Mobile-first design approach

### Features

- Multiplayer real-time quiz game
- Room-based gameplay
- Host controls và admin panel
- Real-time leaderboard
- Timer system
- Responsive UI/UX
- Error handling
- Loading states
- Game state management

### Documentation

- README.md với hướng dẫn chi tiết
- CONTRIBUTING.md cho contributors
- requirements.txt cho dependencies
- LICENSE file
- .gitignore cho Git repository

## [Unreleased]

### Planned

- Database integration (MongoDB/PostgreSQL)
- User authentication system
- Question categories
- Custom question editor
- Game statistics
- Chat system
- Spectator mode
- Tournament mode
- Performance optimizations
- Unit tests và integration tests
