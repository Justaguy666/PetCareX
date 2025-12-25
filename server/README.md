
# PetCareX Backend (server)

## Mục lục
- [Cài đặt](#cài-đặt)
- [Các lệnh phát triển](#các-lệnh-phát-triển)
- [Quản lý database với Prisma](#quản-lý-database-với-prisma)
- [Seeding & Dọn dữ liệu](#seeding--dọn-dữ-liệu)
- [Chạy server](#chạy-server)
- [Ghi chú](#ghi-chú)

---

## Cài đặt

```bash
npm install
```

## Các lệnh phát triển


```json
{
	"_comments": {
		"migrate": "The migrate script applies all pending migrations to the database.",
		"rollback": "The rollback script reverts the last applied migration.",
		"seed": "The seed script populates the database with mock data for testing purposes.",
		"clear-seed": "The clear-seed script removes all mock data from the database.",
		"reset": "The reset script clears the database and reapplies all migrations and seed data.",
		"start": "The start script launches the server in production mode.",
		"dev": "The dev script launches the server in development mode with automatic restarts on file changes.",
		"generate-module": "Tạo mới một module (folder, controller, service, routes, ...)",
		"remove-module": "Xóa một module (folder, controller, service, routes, ... liên quan)"
	}
}
```

| Lệnh                        | Mô tả |
|-----------------------------|-------|
| `npm run migrate`           | Apply tất cả migration vào database |
| `npm run rollback`          | Revert migration cuối cùng |
| `npm run seed`              | Seed dữ liệu mẫu vào database |
| `npm run clear-seed`        | Xóa toàn bộ dữ liệu mẫu khỏi database |
| `npm run reset`             | Xóa sạch database, migrate lại và seed lại |
| `npm start`                 | Chạy server ở chế độ production |
| `npm run dev`               | Chạy server ở chế độ development, tự động reload khi thay đổi file |
| `npm run generate-module -- <moduleName>` | Tạo mới một module (folder, controller, service, routes, ...) |
| `npm run remove-module -- <moduleName>`   | Xóa một module (folder, controller, service, routes, ... liên quan) |

## Quản lý database với Prisma

- Tạo client:
	```bash
	npx prisma generate --schema=./src/prisma/schema.prisma
	```
- Chạy migration:
	```bash
	npm run migrate
	```
- Rollback migration:
	```bash
	npm run rollback
	```

## Seeding & Dọn dữ liệu

- Seed dữ liệu mẫu:
	```bash
	npm run seed
	```
- Xóa dữ liệu mẫu:
	```bash
	npm run clear-seed
	```
- Reset toàn bộ database:
	```bash
	npm run reset
	```

## Chạy server

- Production:
	```bash
	npm start
	```
- Development (auto reload):
	```bash
	npm run dev
	```

## Ghi chú
- Đảm bảo đã cấu hình kết nối database trong file `.env` hoặc `prisma.config.ts`.
- Khi seed dữ liệu lớn, nên kiểm tra cấu hình bộ nhớ và performance của database.
- Các script đều có log chi tiết quá trình thực thi.

## Tạo/Xóa module

- Tạo module mới:
	```bash
	node src/scripts/generate-module <moduleName>
	```
	Tự động tạo folder, controller, service, routes, ... cho module mới.

- Xóa module:
	```bash
	node src/scripts/remove-module <moduleName>
	```
	Xóa toàn bộ folder, controller, service, routes, ... liên quan đến module.
