import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiHandler {
  static Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {"Content-Type": "application/json"},
        body: json.encode(body),
      ).timeout(const Duration(seconds: 10));

      return _handleResponse(response);
    } catch (e) {
      return {"status": "error", "message": "Network error: $e"};
    }
  }

  static Future<Map<String, dynamic>> get(String url) async {
    try {
      final response = await http.get(
        Uri.parse(url),
      ).timeout(const Duration(seconds: 10));

      return _handleResponse(response);
    } catch (e) {
      return {"status": "error", "message": "Network error: $e"};
    }
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      final data = json.decode(response.body);
      return {
        "status": "error",
        "message": data['detail'] ?? "Operation failed with status ${response.statusCode}"
      };
    }
  }
}
