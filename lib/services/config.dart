class AppConfig {
  static const String baseUrl = 'http://localhost:5000';
  static const String facultyBaseUrl = 'http://localhost:5001'; // If running separately

  // API Endpoints
  static const String adminLogin = '$baseUrl/admin_login';
  static const String studentLogin = '$baseUrl/student_login';
  // ... more can be added here
}
