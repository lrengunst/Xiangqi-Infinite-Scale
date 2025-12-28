
# REPORT_086_ARGUMENT_INFLATION
**TIMESTAMP:** 2024-05-26 22:45
**MODE:** RED TEAM EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION
`engine/generate.ts` yêu cầu truyền tham số `buffer` vào hàm đệ quy.
Vì `BUFFER` là một Singleton toàn cục (trong ngữ cảnh Engine/Worker), việc truyền nó qua Stack Frame là dư thừa và gây áp lực lên thanh ghi CPU.

#### 2. THE EXECUTION
*   **Generate API:** `generate(board, turn, buffer, offset)` -> `generate(board, turn, offset)`.
*   **Import:** `BUFFER` được import trực tiếp từ `engine/memory`.
*   **Consumers:** Cập nhật `search.ts`, `query.ts`, `tests/suite.ts` để tuân thủ API mới.

#### 3. IMPACT
Giảm kích thước Stack Frame. Tăng tốc độ gọi hàm trong đệ quy sâu.

#### 4. STATUS
**CLEAN.**
