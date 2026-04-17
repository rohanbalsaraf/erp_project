class AppConfig {
  static const String baseUrl = 'http://localhost:5000';
  static const String facultyBaseUrl = 'http://localhost:5001'; // If running separately

  // API Endpoints
  static const String adminLogin = '$baseUrl/admin_login';
  static const String studentLogin = '$baseUrl/student_login';
  
  static String getAttendance(String studentId) => '$baseUrl/attendance/$studentId';
  static String getTimetable(String dept) => '$baseUrl/timetable/$dept';
  static const String notifications = '$baseUrl/notifications';

  // Third Party APIs
  static const String huggingFaceApiKey = 'YOUR_HUGGING_FACE_API_KEY'; // Placeholder
}
