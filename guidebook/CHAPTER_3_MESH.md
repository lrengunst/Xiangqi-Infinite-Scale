
# CHAPTER 3: THE MESH PROTOCOL

> "Máy chủ tốt nhất là không có máy chủ nào cả."

## 3.1. Triết lý Serverless thật sự
Trong thế giới Web truyền thống, "Serverless" nghĩa là bạn thuê máy chủ của người khác (AWS Lambda, Cloudflare Workers). Trong **Xiangqi Infinite Scale**, Serverless nghĩa là **Peer-to-Peer (P2P)**.

Chúng ta loại bỏ hoàn toàn điểm nghẽn trung tâm (Central Bottleneck). Hai người chơi kết nối trực tiếp với nhau. Dữ liệu bàn cờ chỉ tồn tại trên thiết bị của họ.

## 3.2. The Air-Gap Handshake (Bắt tay không khí)
Do rào cản kỹ thuật của môi trường Sandbox (không có WebSocket Server trung gian để làm Signaling), chúng ta sử dụng giao thức **Manual Signaling**.

### Quy trình:
1.  **Offer:** Host tạo ra một "Lời mời" (SDP Offer) chứa thông tin mạng của họ.
2.  **Air-Gap:** Lời mời này được nén thành chuỗi Token Base64. Host gửi nó cho Guest qua... bất cứ đâu (Chat, Email, Chim bồ câu).
3.  **Answer:** Guest nhận Token, tạo ra "Lời đáp" (SDP Answer).
4.  **Link:** Host nhận Lời đáp. Kết nối WebRTC DataChannel được thiết lập.

Mặc dù thủ công, phương pháp này có tính bảo mật cực cao (không ai có thể nghe lén quá trình bắt tay nếu kênh chat của bạn an toàn) và không phụ thuộc vào bất kỳ hạ tầng nào của Google hay Amazon.

## 3.3. State Synchronization (Đồng bộ trạng thái)
Làm sao để đảm bảo hai bên nhìn thấy cùng một bàn cờ?

Chúng ta không gửi hành động (`{ from: 10, to: 20 }`).
Chúng ta gửi **Trạng thái (Snapshot/FEN)**.

```typescript
// Gửi đi
const fen = Snapshot.serialize(board);
mesh.send({ type: 'move', payload: fen });

// Nhận về
match.sync(packet.payload);
```

### Tại sao?
1.  **Idempotency:** Nếu mạng lag và gửi gói tin 2 lần, việc set lại FEN 2 lần không gây lỗi logic (khác với việc thực thi lệnh di chuyển 2 lần).
2.  **Self-Correction:** Nếu một bên bị lệch trạng thái (do bug), gói tin tiếp theo từ đối thủ sẽ "ghi đè" và sửa lại bàn cờ cho đúng.
3.  **Cheating Prevention:** Mặc dù FEN không chống hack hoàn toàn, nhưng nó buộc Client phải validate trạng thái nhận được hợp lệ với luật chơi.
