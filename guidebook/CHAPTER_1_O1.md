
# CHAPTER 1: THE O(1) DOCTRINE

> "Tốc độ không phải là tính năng. Nó là nền tảng."

## 1.1. Lời nói dối về Hiệu suất
Hầu hết các lập trình viên Web được dạy rằng "tối ưu hóa sớm là nguồn gốc của mọi tội lỗi" (premature optimization is the root of all evil). Trong bối cảnh xây dựng một Game Engine chạy trên trình duyệt, câu nói này chính là thuốc độc.

Khi bạn xây dựng một ứng dụng CRUD, việc mất 10ms hay 100ms để render một danh sách không quan trọng. Nhưng trong Game, nơi vòng lặp AI phải chạy hàng triệu lần mỗi giây, sự khác biệt giữa O(1) và O(N) là sự khác biệt giữa **60 FPS** và **Crash**.

## 1.2. Kỹ thuật "Zero Allocation"
Trong Javascript, kẻ thù lớn nhất không phải là CPU, mà là Garbage Collector (GC).
Mỗi khi bạn viết `const moves = []`, bạn đang tạo rác.
Mỗi khi bạn viết `return { x, y }`, bạn đang tạo rác.

### The Bad Way (Ngây thơ)
```typescript
// Tệ hại: Cấp phát mảng mới mỗi lần gọi
function getMoves(board) {
  const moves = []; // Allocation
  for (let i = 0; i < board.length; i++) {
    if (valid) moves.push({ from: i, to: target }); // Object Allocation
  }
  return moves;
}
```

### The A.R.E.S Way (Tối ưu)
Chúng tôi sử dụng một vùng nhớ tĩnh (Static Buffer) được cấp phát một lần duy nhất khi khởi động.
```typescript
// Tuyệt vời: Không cấp phát gì cả
const BUFFER = new Int32Array(4096); // Static Pool

function generate(board, offset) {
  let pointer = offset;
  for (let index = 0; index < SIZE; index++) {
    if (valid) {
      // Mã hóa nước đi thành 1 số nguyên 32-bit (Source 8 bit | Target 8 bit)
      BUFFER[pointer++] = (index << 8) | target; 
    }
  }
  return pointer; // Trả về con trỏ mới
}
```

## 1.3. Lookup Tables (Bảng Tra Cứu)
Đừng bao giờ bắt CPU tính toán những gì Bộ nhớ có thể lưu trữ.
Thay vì tính toán tọa độ `x = index % 9` (phép chia rất chậm), hãy tính trước (Precompute) tất cả vào một mảng `FILES`.

```typescript
// engine/space.ts
const FILES = new Int8Array(90);
// Init...
export const file = (index: number) => FILES[index]; // O(1) truy cập mảng
```

## Tổng kết
Trong dự án này, chúng ta tuân thủ kỷ luật sắt đá:
1.  Không `new` trong vòng lặp.
2.  Không `map`, `filter`, `reduce` trong Hot Path.
3.  Ưu tiên `Int32Array` hơn `Array`.
