# Yêu Cầu Backend: Chuyển sang Expo Push Notification API

**Vấn đề hiện tại:** Frontend gửi lên `ExponentPushToken[...]`, nhưng Backend đang dùng Firebase Admin SDK để gửi. Firebase không hiểu token này -> Lỗi "Invalid Registration Token".

**Giải pháp:** Backend cần chuyển sang gọi **Expo Push API**. Đây là cách chuẩn để gửi thông báo cho ứng dụng Expo.

## 1. Expo Push API Endpoint

- **URL:** `https://exp.host/--/api/v2/push/send`
- **Method:** `POST`
- **Headers:**
    - `Content-Type: application/json`
    - `Accept: application/json`
    - `Accept-Encoding: gzip, deflate`

## 2. Cấu trúc Request Body (JSON)

Để thông báo hiển thị "nổi" (Heads-up) trên Android, cần thêm `priority` và `channelId`.

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Tiêu đề thông báo",
  "body": "Nội dung thông báo...",
  "sound": "default",
  "priority": "high",        
  "channelId": "default",    
  "data": {
    "type": "GENERAL",
    "activityId": "123"
  }
}
```

### Giải thích các trường quan trọng cho Android
- `priority`: `"high"` (Quyết định việc hiện popup ngay lập tức)
- `channelId`: `"default"` (Khớp với Frontend. Nếu thiếu, Android đẩy vào kênh rác và không hiện popup).

## 3. Ví dụ Code Java (Spring Boot với RestTemplate)

Thay vì dùng `FirebaseMessaging`, hãy dùng `RestTemplate` hoặc `WebClient`.

```java
@Service
public class ExpoNotificationService {

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendExpoNotification(String expoToken, String title, String body, Map<String, Object> data) {
        String url = "https://exp.host/--/api/v2/push/send";

        // Tạo Map payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("to", expoToken);
        payload.put("title", title);
        payload.put("body", body);
        payload.put("data", data);
        payload.put("sound", "default");
        
        // Cấu hình Android Heads-up (QUAN TRỌNG)
        payload.put("priority", "high");
        payload.put("channelId", "default");

        // Gửi Request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            // Check response.getStatusCode() == 200
        } catch (Exception e) {
            // Handle error
            e.printStackTrace();
        }
    }
}
```

## 4. Ưu điểm
- Không cần config file `google-services.json` phức tạp ở Backend cho từng môi trường.
- Expo sẽ tự động định tuyến đến FCM (cho Android) hoặc APNs (cho iOS).
- Hỗ trợ tốt token `ExponentPushToken[...]`.

---
**Lưu ý:**
Backend không cần `setAndroidConfig` nữa, chỉ cần put thẳng `channelId` và `priority` vào JSON root là Expo sẽ tự mapping.
