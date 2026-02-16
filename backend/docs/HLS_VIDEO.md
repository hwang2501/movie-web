# Chống download phim - HLS Streaming

## Cách triển khai

1. **HLS (m3u8 + segments)**: Video được chia thành các segment nhỏ, stream tuần tự.
2. **Signed URL hết hạn**: Mỗi URL xem phim có thời hạn (vd: 1h), hết hạn không dùng được.
3. **Hotlink protection**: Kiểm tra Referer/Origin, chỉ cho phép từ domain chính thức.
4. **Watermark**: Đóng dấu logo/username lên video để răn đe.

## Giới hạn

**Không thể chặn tuyệt đối** nếu user xem được video. User có thể:
- Quay màn hình
- Dùng extension ghi màn hình
- Chụp màn hình từng frame

Các biện pháp trên chỉ **hạn chế** việc download trực tiếp file gốc.

## Cấu trúc lưu video

```
/videos/{movie-slug}/ep{N}/
  master.m3u8
  segment_0.ts
  segment_1.ts
  ...
```
