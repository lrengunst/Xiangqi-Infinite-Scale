
# CHAPTER 4: THE SILICON BRAIN

## 4.1. Actor Model (Mô hình Diễn viên)
Javascript là đơn luồng (Single Threaded). Để AI không làm treo UI, chúng ta trục xuất nó sang một thế giới khác: **Web Worker**.

Trong mô hình này:
*   **Main Thread (UI):** Chỉ biết vẽ và nhận Input.
*   **Worker Thread (Brain):** Chỉ biết tính toán.

Giao tiếp giữa hai thế giới này tuân thủ **Giao thức Nghiêm ngặt (`worker/protocol.ts`)**:
```typescript
// Chỉ có 3 tín hiệu được phép phát ra từ Brain
export enum Signal {
  Moved = 1, // "Tôi đã đi xong"
  Error = 2, // "Tôi gặp lỗi"
  Ready = 3, // "Tôi sẵn sàng"
}
```

## 4.2. Zero-Allocation Search
Thuật toán tìm kiếm là **Negamax** kết hợp **Alpha-Beta Pruning**. Tuy nhiên, điểm đặc biệt của A.R.E.S nằm ở quản lý bộ nhớ.

### The Stack Buffer
Thay vì đệ quy và tạo mảng nước đi mới mỗi lần:
```typescript
function search(depth) {
   const moves = generate(); // Tốn bộ nhớ
   // ...
}
```

Chúng ta dùng một mảng tĩnh khổng lồ (`BUFFER`) và chia nó ra cho từng tầng đệ quy (Stack Slicing):
```typescript
function search(depth, startPointer) {
   const endPointer = generate(buffer, startPointer); 
   // Dữ liệu tầng này nằm từ startPointer -> endPointer
   // Tầng sau sẽ bắt đầu từ endPointer
   search(depth - 1, endPointer);
}
```
Kết quả: **0 byte** được cấp phát trong quá trình suy nghĩ. GC (Garbage Collector) thất nghiệp.

## 4.3. Incremental Scoring (Điểm số gia tăng)
Chúng ta không tính điểm lại từ đầu (`initial()`) tại mỗi node lá.
Chúng ta chỉ tính **Delta**:
$$ Score_{new} = Score_{old} - Value_{move} + Value_{target} $$

Đây là phép toán O(1). Tốc độ đánh giá thế cờ tăng gấp 100 lần so với cách tiếp cận ngây thơ.

## 4.4. Lời kết
Hệ thống này chứng minh rằng với kỷ luật sắt đá về cấu trúc dữ liệu và giải thuật, Javascript hoàn toàn có thể vận hành các tác vụ hiệu năng cao mà không cần nhờ đến C++ hay WASM.
