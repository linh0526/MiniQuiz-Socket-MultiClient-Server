# Contributing to Quiz Game

Cảm ơn bạn đã quan tâm đến việc đóng góp cho Quiz Game! Dưới đây là hướng dẫn để bạn có thể đóng góp hiệu quả.

## Cách đóng góp

### Báo cáo lỗi

1. Kiểm tra xem lỗi đã được báo cáo chưa trong [Issues](https://github.com/your-repo/issues)
2. Tạo issue mới với:
   - Mô tả chi tiết lỗi
   - Các bước tái tạo lỗi
   - Thông tin môi trường (OS, Node.js version, browser)
   - Screenshot nếu có

### Đề xuất tính năng

1. Kiểm tra [Issues](https://github.com/your-repo/issues) xem tính năng đã được đề xuất chưa
2. Tạo issue với label "enhancement"
3. Mô tả chi tiết tính năng và lý do tại sao nó hữu ích

### Đóng góp code

1. Fork repository
2. Tạo branch mới từ `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit changes:
   ```bash
   git commit -m "Add: your feature description"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Tạo Pull Request

## Quy tắc code

### Code Style

- Sử dụng ESLint và Prettier
- Tuân thủ naming conventions
- Viết comment cho code phức tạp
- Sử dụng TypeScript nếu có thể

### Commit Messages

- Sử dụng format: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Ví dụ: `feat: add multiplayer support`

### Testing

- Viết test cho code mới
- Đảm bảo tất cả test pass
- Test trên nhiều browser khác nhau

## Cấu trúc dự án

```
Quiz/
├── client/          # React frontend
├── server/          # Node.js backend
├── docs/           # Documentation
└── tests/          # Test files
```

## Development Setup

1. Clone repository:

   ```bash
   git clone https://github.com/your-repo/quiz-game.git
   cd quiz-game
   ```

2. Install dependencies:

   ```bash
   npm run install-all
   ```

3. Start development:
   ```bash
   npm run dev
   ```

## Pull Request Process

1. Đảm bảo code của bạn:

   - Tuân thủ code style
   - Có test coverage
   - Không có lỗi linting
   - Hoạt động trên nhiều browser

2. Mô tả chi tiết trong PR:

   - Tính năng/lỗi được sửa
   - Cách test
   - Screenshot nếu có UI changes

3. Đảm bảo:
   - PR target đúng branch
   - Code được review
   - Tất cả check pass

## Code of Conduct

- Tôn trọng mọi người
- Xây dựng môi trường tích cực
- Tập trung vào vấn đề, không phải con người
- Chấp nhận feedback một cách xây dựng

## Liên hệ

Nếu có câu hỏi, vui lòng:

- Tạo issue trên GitHub
- Liên hệ qua email: your-email@example.com

Cảm ơn bạn đã đóng góp cho Quiz Game!
