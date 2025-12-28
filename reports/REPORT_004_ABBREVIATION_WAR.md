
# REPORT_004_ABBREVIATION_WAR
**TIMESTAMP:** 2024-05-21 12:30
**MODE:** Deep Red Team Attack (Clarity & Semantics)
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Tấn công vào các từ viết tắt (Abbreviations) và biến đơn ký tự đang tồn tại trong hệ thống hoặc được đề xuất trong Report 003. Đảm bảo tuân thủ tuyệt đối "Sự thuần khiết của định danh".

#### 2. RED TEAM ATTACK LOG (Nhật ký Tấn công)

### VECTOR 1: SỰ LƯỜI BIẾNG CỦA "GEN" VÀ "ENC" (The Laziness of Abbreviation)
*   **Target:** 
    *   `constants.ts` -> `enc` (hàm helper).
    *   `REPORT_003` -> Đề xuất đổi `generateMoves` thành `gen`.
*   **Attack:**
    *   **`enc`**: Là cái gì? `enclose`? `encrypt`? `encounter`? Trong ngữ cảnh `constants.ts`, nó ghép Side và Role. Tên đúng phải là `encode` hoặc `compose`.
    *   **`gen`**: Đây là một từ lóng (slang/clipped word). Trong thiết kế Framework chuyên nghiệp, chúng ta không tiết kiệm vài byte mã nguồn để đánh đổi sự rõ ràng.
    *   **Hậu quả:** Gây nhập nhằng về ngữ nghĩa. `gen` có thể hiểu là `General` (Tướng).
*   **Verdict:** **TỪ CHỐI**. Phải dùng từ tiếng Anh trọn vẹn.

### VECTOR 2: CÁC BIẾN VÔ DANH (Anonymous Variables)
*   **Target:** `domain/core.ts`, `domain/gen.ts`
*   **Evidence:**
    *   `const p = ...` (Point)
    *   `const d = ...` (Direction/Delta)
    *   `const i = ...` (Index - chấp nhận được trong loop nhỏ, nhưng tệ trong logic lớn).
*   **Attack:**
    *   Mã nguồn đang lạm dụng các biến 1 ký tự.
    *   `p` nên là `point` hoặc `vector`.
    *   `d` nên là `delta` hoặc `offset`.
*   **Verdict:** Refactor sang danh từ đầy đủ.

### VECTOR 3: ĐỘNG TỪ CHUYỂN ĐỔI (Conversion Verbs)
*   **Target:** `domain/core.ts` -> `toIndex`, `toPoint`.
*   **Attack:**
    *   `toIndex` (2 từ) -> Vi phạm luật đơn từ.
    *   `toPoint` (2 từ) -> Vi phạm luật đơn từ.
    *   Đây là tư duy ứng dụng (helper functions). Trong toán học/cấu trúc dữ liệu, hành động này là "làm phẳng" (2D sang 1D) và "mở rộng" (1D sang 2D).
*   **Refinement:**
    *   `toIndex` -> `flatten` (Làm phẳng).
    *   `toPoint` -> `expand` (Mở rộng) hoặc `locate` (Định vị).

#### 3. REFINED SOLUTION (Giải pháp tối ưu)
Cập nhật lại `naming.md` và `manifesto.md`. Cấm tuyệt đối các từ viết tắt trừ khi chúng là chuẩn công nghiệp không thể thay thế (như `id`).

**Bảng sửa đổi:**
*   `gen` -> `generate`
*   `enc` -> `encode`
*   `pos` -> `position`
*   `toIndex` -> `flatten`
*   `toPoint` -> `expand`
*   `val` -> `value`
*   `idx` -> `index`
