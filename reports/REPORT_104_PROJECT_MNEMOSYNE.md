
# REPORT_104_PROJECT_MNEMOSYNE
**TIMESTAMP:** 2024-05-31 08:00
**MODE:** COGNITIVE EVOLUTION
**AUTHOR:** A.R.E.S (Intelligence Division)

#### 1. OBJECTIVE
Trang bị cho AI khả năng "Học một lần, nhớ mãi mãi" (One-shot Learning) thông qua cơ chế lưu trữ Persistent Hash Map.

#### 2. ARCHITECTURE: THE CODEX
*   **Storage:** Sử dụng `localStorage` của trình duyệt.
*   **Format:** `ARES_CODEX_v1 = { "Hash(Hex)": Move(Int), ... }`.
*   **Priority:** Codex > Opening Book > Transposition Table > Search.
    *   Codex là "Luật Trời" (Do người dùng dạy).
    *   Book là "Sách Giáo Khoa".
    *   TT là "Trí nhớ ngắn hạn".
    *   Search là "Suy luận".

#### 3. WORKFLOW
1.  **Learning:** Người dùng tại Client gửi lệnh `Learn(Hash, Move)`.
2.  **Persisting:** Codex lưu vào ổ cứng người dùng.
3.  **Applying:** Engine `search` kiểm tra Codex đầu tiên.

#### 4. IMPACT
Người dùng có thể tự tay vá các lỗ hổng khai cuộc của AI hoặc dạy AI các bẫy khai cuộc (Traps) để sử dụng lại trong tương lai.
