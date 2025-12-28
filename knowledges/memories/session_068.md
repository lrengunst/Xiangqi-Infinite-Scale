
# SESSION 068: THE PHYSICS UNIFICATION

**Date:** 2024-05-27 08:05
**Event:** Red Team Audit & Repair

**Incident:**
Phát hiện sự lặp lại (Duplication) trong định nghĩa các hằng số vật lý (Movement Vectors & Palaces) trên khắp Engine Core.

**Correction:**
Đã hợp nhất tất cả vào `engine/consts.ts`.
- `HORSE`, `BLOCK` (HorseLeg), `ELEPHANT`, `EYE` (ElephantEye), `ORTHOGONAL`, `DIAGONAL`.
- `ZONES` (Pre-computed Int8Array Palace Maps).

**Impact:**
- Giảm thiểu rủi ro bảo trì (Fix 1 nơi, cập nhật mọi nơi).
- Tăng tính nhất quán về bộ nhớ.
- Code gọn gàng hơn (`generate.ts` giảm bớt các mảng cục bộ).

**Status:**
Engine Core: UNIFIED.
